import { CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import type { RsvpSectionProps, FormState } from "./types";

export function RsvpSection({
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
  }: RsvpSectionProps) {

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

	const fieldError = (field: keyof FormState) => fieldErrors[field]?.[0];

	return (
		<section
			aria-labelledby="rsvp-title"
			className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6"
		>
			<div className="flex items-center gap-2">
				<ClipboardCheck
					aria-hidden="true"
					className="size-4 text-primary"
				/>
				<h3 id="rsvp-title" className="font-serif text-xl">
					RSVP
				</h3>
			</div>

			<p className="mt-1 text-xs text-muted-foreground">
				Kindly respond by {settings.rsvpDeadline}.
			</p>

			{status === "success" ? (
				<div className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 rounded-xl border border-border bg-muted/50 p-5 text-center">
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
				<form
					onSubmit={onSubmit}
					noValidate
					className="mt-5 flex flex-1 flex-col gap-4 rounded-xl border border-border bg-muted/50 p-4"
				>
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
						<Label htmlFor="rsvp-phone">Phone Number</Label>
						<Input
							id="rsvp-phone"
							type="tel"
							required
							autoComplete="tel"
							placeholder="07XX XXX XXX"
							aria-invalid={Boolean(fieldError("phone"))}
							value={form.phone}
							onChange={(event) => {
								setForm((prev) => ({
									...prev,
									phone: event.target.value,
								}));
								onFieldChange("phone");
							}}
						/>
						{fieldError("phone") && (
							<p role="alert" className="text-sm text-destructive">
								{fieldError("phone")}
							</p>
						)}
					</div>

					<div className="grid gap-2.5">
						<Label>Attendance</Label>
						<RadioGroup
							className="grid grid-cols-2 gap-3"
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
											"flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-2.5 transition-colors",
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
						className="mt-auto"
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
