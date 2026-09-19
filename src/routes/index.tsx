import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import {
	Calendar,
	CheckCircle2,
	Church,
	Clock,
	Heart,
	Loader2,
	MapPin,
	PartyPopper,
	UtensilsCrossed,
} from "lucide-react";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { submitRsvp } from "#/server/rsvp";
import {
	DEFAULT_SITE_SETTINGS,
	getSiteSettings,
	type SiteSettings,
} from "#/server/site";

export const Route = createFileRoute("/")({
	loader: async () => ({ settings: await getSiteSettings() }),
	head: ({ loaderData }) => {
		const settings = loaderData?.settings ?? DEFAULT_SITE_SETTINGS;
		const heroImage = absoluteUrl(
			settings.heroImage || DEFAULT_SITE_SETTINGS.heroImage,
		);
		return {
			meta: [
				{ title: settings.siteTitle },
				{ name: "description", content: settings.siteDescription },
				{ property: "og:title", content: settings.siteTitle },
				{ property: "og:description", content: settings.siteDescription },
				{ property: "og:type", content: "website" },
				{ property: "og:image", content: heroImage },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:image", content: heroImage },
			],
			links: [{ rel: "icon", href: settings.favicon || "/icon.png" }],
		};
	},
	component: Home,
});

type FormState = {
	name: string;
	email: string;
	attending: "yes" | "no";
	guests: string;
	message: string;
};

type RsvpFieldErrors = Partial<Record<keyof FormState, string[]>>;

function parseFieldErrors(err: unknown): RsvpFieldErrors | null {
	if (!(err instanceof Error)) return null;
	try {
		const issues = JSON.parse(err.message) as {
			path?: (string | number)[];
			message?: string;
		}[];
		if (!Array.isArray(issues)) return null;
		const fields: RsvpFieldErrors = {};
		let found = false;
		for (const issue of issues) {
			const field = issue.path?.[0];
			if (typeof field !== "string" || !issue.message) continue;
			found = true;
			const existing = fields[field];
			if (existing) {
				existing.push(issue.message);
			} else {
				fields[field] = [issue.message];
			}
		}
		return found ? fields : null;
	} catch {
		return null;
	}
}

const initialForm: FormState = {
	name: "",
	email: "",
	attending: "yes",
	guests: "1",
	message: "",
};

const attendances: {
	value: "yes" | "no";
	title: string;
	description: string;
}[] = [
	{
		value: "yes",
		title: "Joyfully Accept",
		description: "I'd be honored to attend",
	},
	{
		value: "no",
		title: "Regretfully Decline",
		description: "Sadly, I can't make it",
	},
];

function accentStyle(settings: SiteSettings): CSSProperties {
	return {
		...(settings.primaryColor
			? { "--primary": settings.primaryColor, "--ring": settings.primaryColor }
			: {}),
		...(settings.secondaryColor
			? { "--secondary": settings.secondaryColor }
			: {}),
	} as CSSProperties;
}

const SITE_URL = (
	(typeof process !== "undefined" ? process.env?.PUBLIC_SITE_URL : undefined) ||
	(import.meta.env?.VITE_PUBLIC_SITE_URL as string | undefined) ||
	""
).replace(/\/+$/, "");

function absoluteUrl(value: string) {
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
	if (value.startsWith("//")) return `https:${value}`;
	if (!SITE_URL) return value;
	return `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function Home() {
	const { settings } = Route.useLoaderData();
	const [form, setForm] = useState<FormState>(initialForm);
	const [status, setStatus] = useState<
		"idle" | "submitting" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<RsvpFieldErrors>({});
	const [successMessage, setSuccessMessage] = useState("");

	function handleViewRsvp() {
		document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
	}

	function handleViewProgramme() {
		document
			.getElementById("programme")
			?.scrollIntoView({ behavior: "smooth" });
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (status === "submitting") return;

		setStatus("submitting");
		setError(null);
		setFieldErrors({});

		try {
			const response = await submitRsvp({
				data: {
					name: form.name,
					email: form.email,
					attending: form.attending,
					guests: Number(form.guests),
					message: form.message,
				},
			});
			setSuccessMessage(response.message);
			setStatus("success");
		} catch (err) {
			setStatus("error");
			const issues = parseFieldErrors(err);
			if (issues) {
				setFieldErrors(issues);
			} else {
				setError(
					err instanceof Error
						? err.message
						: "Something went wrong. Please try again.",
				);
			}
		}
	}

	function clearFieldError(field: keyof FormState) {
		setFieldErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	}

	return (
		<main
			className="min-h-dvh bg-background font-sans text-foreground antialiased"
			style={accentStyle(settings)}
		>
			<header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end p-2 sm:p-6">
				<ThemeToggle />
			</header>

			<Hero
				settings={settings}
				onRsvp={handleViewRsvp}
				onViewProgramme={handleViewProgramme}
			/>

			<Countdown settings={settings} />

			<Schedule settings={settings} />

			<RsvpSection
				settings={settings}
				form={form}
				setForm={setForm}
				status={status}
				error={error}
				fieldErrors={fieldErrors}
				onFieldChange={clearFieldError}
				successMessage={successMessage}
				onSubmit={handleSubmit}
				onReset={() => {
					setForm(initialForm);
					setStatus("idle");
					setFieldErrors({});
				}}
			/>

			<footer className="border-t border-border py-5 text-center text-sm text-muted-foreground">
				<Heart className="mx-auto mb-3 size-4 fill-primary text-primary" />
				<p className="font-serif text-lg text-foreground">
					{settings.partnerA} &amp; {settings.partnerB}
				</p>
				<p className="mt-1">
					{settings.dateLabel} · {settings.location}
				</p>
			</footer>
		</main>
	);
}

const divider = (
	<div className="flex items-center gap-4">
		<span className="h-px w-12 bg-border sm:w-20" />
		<Heart className="size-4 fill-primary text-primary" />
		<span className="h-px w-12 bg-border sm:w-20" />
	</div>
);

function RsvpSection({
	settings,
	form,
	setForm,
	status,
	error,
	fieldErrors,
	onFieldChange,
	successMessage,
	onSubmit,
	onReset,
}: {
	settings: SiteSettings;
	form: FormState;
	setForm: React.Dispatch<React.SetStateAction<FormState>>;
	status: "idle" | "submitting" | "success" | "error";
	error: string | null;
	fieldErrors: RsvpFieldErrors;
	onFieldChange: (field: keyof FormState) => void;
	successMessage: string;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
}) {
	const fieldError = (field: keyof FormState) => fieldErrors[field]?.[0];
	return (
		<section
			id="rsvp"
			className="mx-auto max-w-xl scroll-mt-24 px-3 py-6 sm:py-16"
		>
			<div className="text-center">
				<p className="text-xs font-semibold tracking-[0.35em] text-secondary uppercase">
					Kindly respond by {settings.rsvpDeadline}
				</p>
				<h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
					RSVP
				</h2>
				<div className="mt-3">{divider}</div>
			</div>

			{status === "success" ? (
				<div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
					<span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
						<CheckCircle2 className="size-8" strokeWidth={1.5} />
					</span>
					<h3 className="font-serif text-2xl">You're all set!</h3>
					<p className="mx-auto max-w-xs leading-relaxed text-muted-foreground">
						{successMessage}
					</p>
					<Button size="lg" onClick={onReset}>
						Submit Another Response
					</Button>
				</div>
			) : (
				<form onSubmit={onSubmit} noValidate className="mt-6 grid gap-2">
					<div className="grid gap-2">
						<Label htmlFor="rsvp-name">Full Name</Label>
						<Input
							id="rsvp-name"
							required
							autoComplete="name"
							placeholder="Your full name"
							aria-invalid={Boolean(fieldError("name"))}
							value={form.name}
							onChange={(event) => {
								setForm((prev) => ({
									...prev,
									name: event.target.value,
								}));
								onFieldChange("name");
							}}
						/>
						{fieldError("name") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("name")}
							</p>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="rsvp-email">Email Address</Label>
						<Input
							id="rsvp-email"
							type="email"
							required
							autoComplete="email"
							placeholder="you@example.com"
							aria-invalid={Boolean(fieldError("email"))}
							value={form.email}
							onChange={(event) => {
								setForm((prev) => ({
									...prev,
									email: event.target.value,
								}));
								onFieldChange("email");
							}}
						/>
						{fieldError("email") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("email")}
							</p>
						)}
					</div>

					<div className="grid gap-2.5">
						<Label>Attendance</Label>
						<RadioGroup
							value={form.attending}
							onValueChange={(value) => {
								setForm((prev) => ({
									...prev,
									attending: value as "yes" | "no",
								}));
								onFieldChange("attending");
							}}
						>
							{attendances.map((attendance) => {
								const selected = form.attending === attendance.value;
								return (
									<label
										key={attendance.value}
										htmlFor={`attendance-${attendance.value}`}
										className={cn(
											"flex cursor-pointer items-start gap-3 rounded-lg border p-1.5 transition-colors",
											selected
												? "border-primary bg-primary/5 ring-1 ring-primary/30"
												: "border-border hover:bg-accent",
										)}
									>
										<RadioGroupItem
											id={`attendance-${attendance.value}`}
											value={attendance.value}
											className="mt-0.5"
										/>
										<span className="grid gap-0.5">
											<span className="text-sm font-medium leading-tight">
												{attendance.title}
											</span>
											<span className="text-xs text-muted-foreground">
												{attendance.description}
											</span>
										</span>
									</label>
								);
							})}
						</RadioGroup>
						{fieldError("attending") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("attending")}
							</p>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="rsvp-guests">Guest Count</Label>
						<Select
							value={form.guests}
							onValueChange={(value) => {
								setForm((prev) => ({ ...prev, guests: value }));
								onFieldChange("guests");
							}}
						>
							<SelectTrigger id="rsvp-guests" className="w-full">
								<SelectValue placeholder="Select number of guests" />
							</SelectTrigger>
							<SelectContent>
								{[1, 2, 3, 4, 5].map((count) => (
									<SelectItem key={count} value={String(count)}>
										{count} {count === 1 ? "guest" : "guests"} (inc. yourself)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldError("guests") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("guests")}
							</p>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="rsvp-message" className="items-baseline gap-1">
							Personal Note
							<span className="text-xs font-normal text-muted-foreground">
								(optional)
							</span>
						</Label>
						<Textarea
							id="rsvp-message"
							rows={4}
							placeholder="Share a note, well wishes, or dietary requirements..."
							aria-invalid={Boolean(fieldError("message"))}
							value={form.message}
							onChange={(event) => {
								setForm((prev) => ({
									...prev,
									message: event.target.value,
								}));
								onFieldChange("message");
							}}
						/>
						{fieldError("message") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("message")}
							</p>
						)}
					</div>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<Button
						type="submit"
						size="lg"
						className="mt-2"
						disabled={status === "submitting"}
					>
						{status === "submitting" ? (
							<>
								<Loader2 className="animate-spin" />
								Sending…
							</>
						) : (
							"Send RSVP"
						)}
					</Button>
				</form>
			)}
		</section>
	);
}

function Hero({
	settings,
	onRsvp,
	onViewProgramme,
}: {
	settings: SiteSettings;
	onRsvp: () => void;
	onViewProgramme: () => void;
}) {
	const heroImage = settings.heroImage || DEFAULT_SITE_SETTINGS.heroImage;

	return (
		<section className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4 pt-24 pb-14 text-center sm:justify-center sm:pt-0 sm:pb-0">
			<img
				src={heroImage}
				alt=""
				aria-hidden
				className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover blur-lg"
			/>
			<img
				src={heroImage}
				alt=""
				aria-hidden
				className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-10 bg-black/50 md:bg-black/30"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-40 -right-40 size-[28rem] rounded-full border border-primary/10"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-48 -left-48 size-[32rem] rounded-full border border-secondary/10"
			/>

			<div className="relative z-20 flex flex-col items-center">
				<p className="text-xs font-semibold tracking-[0.35em] text-secondary uppercase">
					{settings.introTagline}
				</p>

				<h1
					className={cn(
						"mt-3 font-serif leading-none tracking-tight text-primary text-5xl text-balance md:text-7xl md:whitespace-nowrap lg:text-8xl",
					)}
				>
					{settings.partnerA}{" "}
					<span className="text-secondary italic">&amp;</span>{" "}
					{settings.partnerB}
				</h1>

				<div className="mt-4">{divider}</div>

				<p className="mt-4 text-sm font-semibold tracking-[0.25em] text-muted-foreground uppercase">
					{settings.introSubtitle}
				</p>

				<p className="mt-3 font-serif text-5xl font-bold text-secondary sm:text-6xl">
					{settings.dateLabel}
				</p>
				<p className="mt-2 flex items-center gap-2 text-muted-foreground">
					<MapPin className="size-5 text-primary" strokeWidth={1.75} />
					{settings.location}
				</p>

				<Button
					size="lg"
					className="mt-5 h-12 rounded-full px-10 text-base shadow-lg"
					onClick={onRsvp}
				>
					<Heart className="fill-current" />
					RSVP Now
				</Button>

				<Button
					variant="secondary"
					size="lg"
					className="mt-2 h-12 rounded-full px-10 text-base shadow-lg"
					onClick={onViewProgramme}
				>
					VIEW PROGRAMME
				</Button>

				<p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Scroll to see the celebration
				</p>
			</div>
		</section>
	);
}

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

function getTimeLeft(target: Date = new Date()): TimeLeft {
	const totalSeconds = Math.max(
		0,
		Math.floor((target.getTime() - Date.now()) / 1000),
	);
	return {
		days: Math.floor(totalSeconds / 86400),
		hours: Math.floor((totalSeconds % 86400) / 3600),
		minutes: Math.floor((totalSeconds % 3600) / 60),
		seconds: totalSeconds % 60,
	};
}

const countdownUnits: { label: string; key: keyof TimeLeft }[] = [
	{ label: "Days", key: "days" },
	{ label: "Hours", key: "hours" },
	{ label: "Minutes", key: "minutes" },
	{ label: "Seconds", key: "seconds" },
];

function Countdown({ settings }: { settings: SiteSettings }) {
	const target = useMemo(
		() => new Date(settings.countdownTarget),
		[settings.countdownTarget],
	);
	const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

	useEffect(() => {
		const timer = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
		return () => clearInterval(timer);
	}, [target]);

	const expired =
		timeLeft.days === 0 &&
		timeLeft.hours === 0 &&
		timeLeft.minutes === 0 &&
		timeLeft.seconds === 0;

	return (
		<section className="mx-auto max-w-4xl px-3 pb-2.5 sm:pb-6">
			<div className="text-center">
				<p className="text-xs font-semibold tracking-[0.35em] text-secondary uppercase">
					Counting down
				</p>
				<h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
					{expired ? "We said I do" : "Until we say I do"}
				</h2>
				<div className="mt-3">{divider}</div>
			</div>

			{expired ? (
				<div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
					<span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
						<Heart className="size-7 fill-current" strokeWidth={1.5} />
					</span>
					<h3 className="font-serif text-3xl">We&rsquo;re married!</h3>
					<p className="max-w-sm leading-relaxed text-muted-foreground">
						Thank you for celebrating {settings.partnerA} &amp;{" "}
						{settings.partnerB} on {settings.dateLabel} in {settings.location}.
					</p>
				</div>
			) : (
				<div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
					{countdownUnits.map((unit) => (
						<div
							key={unit.key}
							className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 text-center shadow-sm"
						>
							<span
								aria-hidden
								className="absolute inset-y-0 left-0 w-1 bg-secondary"
							/>
							<p className="font-serif text-5xl font-semibold tabular-nums text-primary sm:text-6xl">
								{String(timeLeft[unit.key]).padStart(2, "0")}
							</p>
							<p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary ">
								{unit.label}
							</p>
						</div>
					))}
				</div>
			)}
		</section>
	);
}

const scheduleIcons = {
	church: Church,
	food: UtensilsCrossed,
} as const;

const accentStyles = {
	burgundy: {
		badge: "bg-primary/10 text-primary",
		pill: "bg-primary/5 text-primary border-primary/20",
		line: "bg-primary",
	},
	navy: {
		badge: "bg-secondary/10 text-secondary",
		pill: "bg-secondary/5 text-secondary border-secondary/20",
		line: "bg-secondary",
	},
} as const;

function weddingDate(target: string, dateLabel: string) {
	try {
		const weekday = new Date(target).toLocaleDateString("en-US", {
			weekday: "long",
		});
		return `${weekday}, ${dateLabel}`;
	} catch {
		return dateLabel;
	}
}

function Schedule({ settings }: { settings: SiteSettings }) {
	return (
		<section id="programme" className="mx-auto max-w-6xl px-3 py-6 sm:py-16">
			<div className="text-center">
				<p className="text-xs font-semibold tracking-[0.35em] text-secondary uppercase">
					Programme
				</p>
				<h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
					Order of events
				</h1>
				<div className="mt-3">{divider}</div>
			</div>

			<div className="mt-8 grid items-stretch gap-3 md:grid-cols-2">
				{settings.schedule.map((item, index) => {
					const styles = accentStyles[index % 2 === 0 ? "burgundy" : "navy"];
					const Icon = scheduleIcons[item.icon];
					return (
						<article
							key={`${item.label}-${item.time}-${item.location}`}
							className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<span
									className={cn(
										"grid size-12 place-items-center rounded-full",
										styles.badge,
									)}
								>
									<Icon className="size-6" strokeWidth={1.75} />
								</span>
								<span
									className={cn(
										"rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
										styles.pill,
									)}
								>
									{item.label}
								</span>
							</div>

							<h3 className="mt-3 font-serif text-2xl">{item.title}</h3>

							<div className="mt-2 grid gap-2 text-sm text-muted-foreground">
								<p className="flex items-center gap-2.5">
									<Clock className="size-4 shrink-0 text-primary" />
									{item.time}
								</p>
								<p className="flex items-center gap-2.5">
									<MapPin className="size-4 shrink-0 text-primary" />
									{item.location}
								</p>
								<p className="flex items-center gap-2.5">
									<Calendar className="size-4 shrink-0 text-primary" />
									{weddingDate(settings.countdownTarget, settings.dateLabel)}
								</p>
							</div>

							<p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
								{item.description}
							</p>

							<span
								aria-hidden
								className={cn("absolute inset-x-0 bottom-0 h-1", styles.line)}
							/>
						</article>
					);
				})}
			</div>

			<div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
				<PartyPopper className="size-4 text-primary" />
				<p>
					{settings.schedule[0]?.label ?? "Celebrations"} start at{" "}
					{settings.schedule[0]?.time} at{" "}
					<span className="font-medium text-foreground">
						{settings.schedule[0]?.location}
					</span>
					.
				</p>
			</div>
		</section>
	);
}
