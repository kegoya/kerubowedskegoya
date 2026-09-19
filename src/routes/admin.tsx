import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import {
	CheckCircle2,
	Globe,
	Heart,
	ImagePlus,
	KeyRound,
	Loader2,
	Lock,
	LogOut,
	Palette,
	PartyPopper,
	Plus,
	RotateCcw,
	Trash2,
	UploadCloud,
	Users,
	UserX,
} from "lucide-react";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { ImageCropper } from "#/components/image-cropper";
import { ThemeToggle } from "#/components/theme-toggle";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { PasswordInput } from "#/components/ui/password-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Textarea } from "#/components/ui/textarea";
import {
	changePassword,
	getAuthStatus,
	listRsvps,
	login,
	logout,
} from "#/server/admin";
import {
	getSiteSettings,
	type SiteSettings,
	updateSiteSettings,
	uploadImage,
} from "#/server/site";

export const Route = createFileRoute("/admin")({ component: Admin });

type RsvpRecord = {
	id: number;
	name: string;
	email: string;
	attending: "yes" | "no";
	guests: number;
	message: string | null;
	createdAt: string;
};

function formatDate(value: string) {
	return new Date(value).toLocaleString("en-KE", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function Admin() {
	const [authed, setAuthed] = useState<boolean | null>(null);
	const [forceChange, setForceChange] = useState(false);
	const [passwordInput, setPasswordInput] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
	const [tab, setTab] = useState<Tab>("responses");

	const loadRsvps = useCallback(async () => {
		setStatus("loading");
		setError(null);
		try {
			const rows = await listRsvps();
			setRsvps(rows);
			setStatus("idle");
		} catch (err) {
			setStatus("error");
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
			// Session expired or was revoked.
			setAuthed(false);
		}
	}, []);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await getAuthStatus();
				if (cancelled) return;
				setAuthed(res.authed);
				setForceChange(res.forcePasswordChange);
			} catch {
				if (cancelled) return;
				setAuthed(false);
				setForceChange(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (authed && !forceChange) {
			loadRsvps();
		}
	}, [authed, forceChange, loadRsvps]);

	function handleLogin(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const pw = passwordInput.trim();
		if (!pw) return;
		setStatus("loading");
		setError(null);
		login({ data: { password: pw } })
			.then((res) => {
				setAuthed(true);
				setForceChange(res.forcePasswordChange);
				setPasswordInput("");
			})
			.catch((err) => {
				setStatus("error");
				setError(err instanceof Error ? err.message : "Failed to sign in.");
			});
	}

	function handleLogout() {
		logout()
			.catch(() => {})
			.finally(() => {
				setAuthed(false);
				setForceChange(false);
				setRsvps([]);
				setTab("responses");
				setPasswordInput("");
				setError(null);
				setStatus("idle");
			});
	}

	const attending = rsvps.filter((entry) => entry.attending === "yes");
	const totalGuests = attending.reduce((sum, entry) => sum + entry.guests, 0);

	return (
		<main className="min-h-dvh bg-background font-sans text-foreground antialiased">
			<Toaster position="bottom-right" richColors />
			{authed === null ? (
				<div className="flex items-center justify-center gap-2 py-40 text-muted-foreground">
					<Loader2 className="animate-spin" />
					Checking…
				</div>
			) : !authed ? (
				<section className="mx-auto flex max-w-sm flex-col justify-center px-4 pb-24 pt-16 sm:pt-24">
					<div className="mb-8 text-center">
						<span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
							<Lock className="size-6" strokeWidth={1.5} />
						</span>
						<h1 className="mt-6 font-serif text-3xl">Admin Sign In</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Enter the admin password to view RSVP responses.
						</p>
					</div>

					<form onSubmit={handleLogin} className="grid gap-4" noValidate>
						<div className="grid gap-2">
							<Label htmlFor="admin-password">Password</Label>
							<PasswordInput
								id="admin-password"
								autoComplete="current-password"
								placeholder="Admin password"
								value={passwordInput}
								onChange={(event) => setPasswordInput(event.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}

						<Button type="submit" size="lg" disabled={!passwordInput.trim()}>
							Sign in
						</Button>
					</form>
				</section>
			) : forceChange ? (
				<ForceChangeScreen
					onChanged={() => {
						setForceChange(false);
						setTab("responses");
					}}
				/>
			) : (
				<SidebarProvider>
					<AppSidebar
						tab={tab}
						onTabChange={setTab}
						rsvpCount={rsvps.length}
						onLogout={handleLogout}
					/>
					<SidebarInset>
						<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sm:px-6">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 data-[orientation=vertical]:h-4"
							/>
							<h1 className="flex-1 font-serif text-lg">{tabLabels[tab]}</h1>
							<ThemeToggle />
						</header>
						<div className="flex flex-1 flex-col gap-4 p-4 pb-28 md:p-6">
							{tab === "responses" && (
								<ResponsesTab
									status={status}
									error={error}
									rsvps={rsvps}
									attending={attending}
									totalGuests={totalGuests}
								/>
							)}
							{tab === "details" && <DetailsTab />}
							{tab === "security" && <SecurityTab />}
						</div>
						<MobileNavBar
							tab={tab}
							onTabChange={setTab}
							onLogout={handleLogout}
						/>
					</SidebarInset>
				</SidebarProvider>
			)}
		</main>
	);
}

type Tab = "responses" | "details" | "security";

const tabLabels: Record<Tab, string> = {
	responses: "RSVP Responses",
	details: "Invitation Details",
	security: "Security",
};

const navItems: { id: Tab; label: string; icon: typeof Users }[] = [
	{ id: "responses", label: "Responses", icon: Users },
	{ id: "details", label: "Details", icon: Globe },
	{ id: "security", label: "Security", icon: KeyRound },
];

function MobileNavBar({
	tab,
	onTabChange,
	onLogout,
}: {
	tab: Tab;
	onTabChange: (tab: Tab) => void;
	onLogout: () => void;
}) {
	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
			<ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-1.5">
				{navItems.map(({ id, label, icon: Icon }) => {
					const active = tab === id;
					return (
						<li key={id}>
							<button
								type="button"
								aria-current={active ? "page" : undefined}
								onClick={() => onTabChange(id)}
								className={cn(
									"flex min-w-16 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
									active
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<Icon className="size-5" />
								{label}
							</button>
						</li>
					);
				})}
				<li>
					<button
						type="button"
						aria-label="Log out"
						onClick={onLogout}
						className="flex min-w-16 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
					>
						<LogOut className="size-5" />
						Log out
					</button>
				</li>
			</ul>
		</nav>
	);
}

function AppSidebar({
	tab,
	onTabChange,
	rsvpCount,
	onLogout,
}: {
	tab: Tab;
	onTabChange: (tab: Tab) => void;
	rsvpCount: number;
	onLogout: () => void;
}) {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[active=true]:bg-transparent"
						>
							<div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
								<Heart className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-serif text-base">
									RSVP Admin
								</span>
								<span className="truncate text-xs text-sidebar-foreground/70">
									Elvin &amp; Eric
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Manage</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "responses"}
								onClick={() => onTabChange("responses")}
								tooltip="Responses"
							>
								<Users />
								<span>Responses</span>
								{rsvpCount > 0 && (
									<SidebarMenuBadge>{rsvpCount}</SidebarMenuBadge>
								)}
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "details"}
								onClick={() => onTabChange("details")}
								tooltip="Details"
							>
								<Globe />
								<span>Details</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={tab === "security"}
								onClick={() => onTabChange("security")}
								tooltip="Security"
							>
								<KeyRound />
								<span>Security</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={onLogout} tooltip="Log out">
							<LogOut />
							<span>Log out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function ForceChangeScreen({ onChanged }: { onChanged: () => void }) {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	function handleChangePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (next !== confirm) {
			setError("New passwords do not match.");
			setStatus("error");
			return;
		}
		setStatus("loading");
		setError(null);
		changePassword({ data: { currentPassword: current, newPassword: next } })
			.then(() => {
				setStatus("success");
				toast.success("Password updated successfully");
				setCurrent("");
				setNext("");
				setConfirm("");
			})
			.catch((err) => {
				setStatus("error");
				setError(
					err instanceof Error ? err.message : "Failed to change password.",
				);
			});
	}

	return (
		<section className="mx-auto flex max-w-sm flex-col justify-center px-4 pb-24 pt-10 sm:pt-16">
			{status === "success" ? (
				<div className="text-center">
					<span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
						<CheckCircle2 className="size-6" strokeWidth={1.5} />
					</span>
					<h1 className="mt-6 font-serif text-3xl">Password updated</h1>
					<p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
						Your new password is saved. You can now manage the invitation.
					</p>
					<Button size="lg" className="mt-8" onClick={onChanged}>
						Continue to dashboard
					</Button>
				</div>
			) : (
				<>
					<div className="mb-8 text-center">
						<span className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
							<KeyRound className="size-6" strokeWidth={1.5} />
						</span>
						<h1 className="mt-6 font-serif text-3xl">Choose a new password</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							You&apos;re signed in with a temporary password. Set a permanent
							one to continue.
						</p>
					</div>

					<form
						onSubmit={handleChangePassword}
						className="max-w-sm grid gap-4"
						noValidate
					>
						<div className="grid gap-2">
							<Label htmlFor="force-current-password">Temporary Password</Label>
							<PasswordInput
								id="force-current-password"
								autoComplete="current-password"
								placeholder="The temporary password you signed in with"
								value={current}
								onChange={(event) => setCurrent(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="force-new-password">New Password</Label>
							<PasswordInput
								id="force-new-password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								value={next}
								onChange={(event) => setNext(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="force-confirm-password">
								Confirm New Password
							</Label>
							<PasswordInput
								id="force-confirm-password"
								autoComplete="new-password"
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}

						<Button
							type="submit"
							size="lg"
							disabled={status === "loading" || !current || !next || !confirm}
						>
							{status === "loading" ? (
								<>
									<Loader2 className="animate-spin" />
									Saving…
								</>
							) : (
								"Save New Password"
							)}
						</Button>
					</form>
				</>
			)}
		</section>
	);
}

function ResponsesTab({
	status,
	error,
	rsvps,
	attending,
	totalGuests,
}: {
	status: "idle" | "loading" | "error";
	error: string | null;
	rsvps: RsvpRecord[];
	attending: RsvpRecord[];
	totalGuests: number;
}) {
	return (
		<>
			{status === "loading" && rsvps.length === 0 ? (
				<div className="flex items-center justify-center gap-2 py-32 text-muted-foreground">
					<Loader2 className="animate-spin" />
					Loading responses…
				</div>
			) : error ? (
				<p role="alert" className="py-32 text-center text-destructive">
					{error}
				</p>
			) : (
				<>
					<div className="mt-6 grid gap-4 sm:grid-cols-3">
						<Card>
							<CardContent className="flex items-center gap-4">
								<span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
									<Users className="size-5" />
								</span>
								<div>
									<p className="font-serif text-3xl tabular-nums">
										{rsvps.length}
									</p>
									<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
										Total responses
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-4">
								<span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
									<PartyPopper className="size-5" />
								</span>
								<div>
									<p className="font-serif text-3xl tabular-nums">
										{attending.length}
									</p>
									<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
										Attending
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-4">
								<span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary/10 text-secondary">
									<Users className="size-5" />
								</span>
								<div>
									<p className="font-serif text-3xl tabular-nums">
										{totalGuests}
									</p>
									<p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
										Guests expected
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{rsvps.length === 0 ? (
						<div className="py-32 text-center text-muted-foreground">
							No RSVP responses yet.
						</div>
					) : (
						<Card className="mt-6">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-12">#</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Attending</TableHead>
										<TableHead className="text-center">Guests</TableHead>
										<TableHead>Message</TableHead>
										<TableHead>Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rsvps.map((entry, index) => (
										<TableRow key={entry.id}>
											<TableCell className="tabular-nums text-muted-foreground">
												{index + 1}
											</TableCell>
											<TableCell className="font-medium">
												{entry.name}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{entry.email}
											</TableCell>
											<TableCell>
												{entry.attending === "yes" ? (
													<Badge variant="secondary">
														<PartyPopper className="size-3" />
														Attending
													</Badge>
												) : (
													<Badge variant="destructive">
														<UserX className="size-3" />
														Declined
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-center tabular-nums">
												{entry.guests}
											</TableCell>
											<TableCell className="max-w-[220px] text-muted-foreground italic">
												{entry.message ? (
													<span title={entry.message}>
														&ldquo;{entry.message}&rdquo;
													</span>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell className="whitespace-nowrap text-xs text-muted-foreground">
												{formatDate(entry.createdAt)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
					)}
				</>
			)}
		</>
	);
}

function toDateTimeLocal(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value.slice(0, 16);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const DEFAULT_PRIMARY_HEX = "#8b1e3f";
const DEFAULT_SECONDARY_HEX = "#1e3a8a";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function ColorPicker({
	id,
	label,
	value,
	fallback,
	onChange,
	hint,
}: {
	id: string;
	label: string;
	value: string;
	fallback: string;
	onChange: (hex: string) => void;
	hint: string;
}) {
	const shown = /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
	const isCustom = value !== "";

	return (
		<div className="grid gap-2">
			<Label htmlFor={id}>{label}</Label>
			<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
				<input
					id={id}
					type="color"
					value={shown}
					onChange={(event) => onChange(event.target.value)}
					className="size-10 shrink-0 cursor-pointer rounded border border-border bg-transparent p-1"
				/>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium">
						{isCustom ? "Custom color" : "Theme default"}
					</p>
					<p className="truncate text-xs text-muted-foreground">
						{isCustom ? shown : hint}
					</p>
				</div>
				{isCustom && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onChange("")}
					>
						<RotateCcw />
						Default
					</Button>
				)}
			</div>
		</div>
	);
}

function ImagePicker({
	fieldLabel,
	value,
	fallback,
	onValue,
	hint,
	cropAspect,
}: {
	fieldLabel: string;
	value: string;
	fallback: string;
	onValue: (url: string) => void;
	hint: string;
	cropAspect?: number;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [showCropper, setShowCropper] = useState(false);

	function validateFile(file: File | undefined): string | null {
		if (!file) return null;
		if (!file.type.startsWith("image/")) {
			return "Only image files are supported.";
		}
		if (file.size > MAX_IMAGE_BYTES) {
			return "Image must be 5 MB or smaller.";
		}
		return null;
	}

	async function upload(file: File) {
		setUploading(true);
		setUploadError(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await uploadImage({ data: formData });
			onValue(res.url);
		} catch (err) {
			setUploadError(
				err instanceof Error ? err.message : "Upload failed. Please try again.",
			);
		} finally {
			setUploading(false);
		}
	}

	async function handleFile(file: File | undefined) {
		const message = validateFile(file);
		if (message) {
			setUploadError(message);
			return;
		}
		if (!file) return;
		setPendingFile(file);
		setShowCropper(true);
	}

	function handleDrop(event: DragEvent<HTMLElement>) {
		event.preventDefault();
		setDragging(false);
		void handleFile(event.dataTransfer.files[0]);
	}

	const openPicker = () => inputRef.current?.click();

	return (
		<div className="grid gap-2">
			<div className="flex items-center justify-between gap-3">
				<Label>{fieldLabel}</Label>
				{value !== fallback && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="-mr-2 text-muted-foreground"
						onClick={() => onValue(fallback)}
					>
						<RotateCcw />
						Use default
					</Button>
				)}
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={openPicker}
					onDragOver={(event) => {
						event.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={handleDrop}
					className={cn(
						"flex flex-1 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-3 text-left transition-colors",
						dragging
							? "border-primary bg-primary/5"
							: "border-border bg-muted/50",
					)}
				>
					{value ? (
						<img
							src={value}
							alt=""
							className="size-20 shrink-0 rounded-lg border border-border object-cover"
						/>
					) : (
						<span className="grid size-20 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
							<UploadCloud className="size-6" />
						</span>
					)}
					<span className="min-w-0 flex-1">
						<span className="flex items-center gap-2 text-sm font-medium">
							{uploading && <Loader2 className="animate-spin" />}
							{uploading ? "Uploading…" : "Drag & drop, or use the button"}
						</span>
						<span className="mt-0.5 block text-xs text-muted-foreground">
							{hint}
						</span>
						{uploadError && (
							<span
								role="alert"
								className="mt-1 block text-xs text-destructive"
							>
								{uploadError}
							</span>
						)}
					</span>
				</button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					className="shrink-0"
					onClick={openPicker}
				>
					<ImagePlus />
					Add
				</Button>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(event) => {
						void handleFile(event.target.files?.[0]);
						event.target.value = "";
					}}
				/>
			</div>

			<Input
				value={value}
				onChange={(event) => onValue(event.target.value)}
				placeholder="…or paste a path or URL"
			/>

			<ImageCropper
				open={showCropper && pendingFile !== null}
				onOpenChange={(open) => {
					setShowCropper(open);
					if (!open) setPendingFile(null);
				}}
				file={pendingFile ?? new File([], "")}
				aspect={cropAspect}
				title={`Crop ${fieldLabel}`}
				description="Adjust the crop area, then confirm to upload."
				onConfirm={async (cropped) => {
					await upload(cropped);
					setPendingFile(null);
				}}
			/>
		</div>
	);
}

function DetailsTab() {
	const [form, setForm] = useState<SiteSettings | null>(null);
	const [status, setStatus] = useState<
		"idle" | "loading" | "saving" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getSiteSettings()
			.then((res) => {
				if (cancelled) return;
				setForm(res);
				setStatus("idle");
			})
			.catch((err) => {
				if (cancelled) return;
				setStatus("error");
				setError(
					err instanceof Error ? err.message : "Failed to load settings.",
				);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	if (form === null) {
		return status === "error" ? (
			<p role="alert" className="mt-6 text-center text-destructive">
				{error}
			</p>
		) : (
			<div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
				<Loader2 className="animate-spin" />
				Loading details…
			</div>
		);
	}

	function update(field: keyof SiteSettings, value: string) {
		setForm((prev) => prev && { ...prev, [field]: value });
	}

	function updateItem(
		index: number,
		field: keyof SiteSettings["schedule"][number],
		value: string,
	) {
		setForm(
			(prev) =>
				prev && {
					...prev,
					schedule: prev.schedule.map((item, i) =>
						i === index ? { ...item, [field]: value } : item,
					),
				},
		);
	}

	function addItem() {
		setForm(
			(prev) =>
				prev && {
					...prev,
					schedule: [
						...prev.schedule,
						{
							label: "",
							title: "",
							time: "",
							location: "",
							description: "",
							icon: "church",
						},
					],
				},
		);
	}

	function removeItem(index: number) {
		setForm(
			(prev) =>
				prev && {
					...prev,
					schedule: prev.schedule.filter((_, i) => i !== index),
				},
		);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!form || status === "saving") return;
		setStatus("saving");
		setError(null);
		try {
			const res = await updateSiteSettings({ data: form });
			setForm(res.settings);
			setStatus("success");
		} catch (err) {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Failed to save settings.");
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold">
							<Palette className="size-5 text-secondary" />
							Wedding Details
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Customize what your guests see on the invitation.
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="details-partnerA">Partner A Name</Label>
							<Input
								id="details-partnerA"
								value={form.partnerA}
								onChange={(event) => update("partnerA", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-partnerB">Partner B Name</Label>
							<Input
								id="details-partnerB"
								value={form.partnerB}
								onChange={(event) => update("partnerB", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-dateLabel">Date Label</Label>
							<Input
								id="details-dateLabel"
								placeholder="e.g. November 02, 2025"
								value={form.dateLabel}
								onChange={(event) => update("dateLabel", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-countdown">
								Countdown Date &amp; Time
							</Label>
							<Input
								id="details-countdown"
								type="datetime-local"
								value={toDateTimeLocal(form.countdownTarget)}
								onChange={(event) =>
									update(
										"countdownTarget",
										new Date(event.target.value).toISOString(),
									)
								}
							/>
							<p className="text-xs text-muted-foreground">
								Shown until the ceremony begins.
							</p>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-location">Location</Label>
							<Input
								id="details-location"
								value={form.location}
								onChange={(event) => update("location", event.target.value)}
							/>
						</div>
						<div className="grid gap-4 sm:col-span-2">
							<ImagePicker
								fieldLabel="Hero Image"
								value={form.heroImage}
								fallback="/main.png"
								hint="PNG, JPG, WebP or SVG up to 5 MB — the invitation photo shown at the top."
								onValue={(url) => update("heroImage", url)}
							/>
						</div>
						<div className="grid gap-4 sm:col-span-2">
							<ImagePicker
								fieldLabel="Favicon"
								value={form.favicon}
								fallback="/icon.png"
								hint="Small icon shown in the browser tab next to the title."
								cropAspect={1}
								onValue={(url) => update("favicon", url)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-tagline">Intro Tagline</Label>
							<Input
								id="details-tagline"
								value={form.introTagline}
								onChange={(event) => update("introTagline", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-subtitle">Intro Subtitle</Label>
							<Input
								id="details-subtitle"
								value={form.introSubtitle}
								onChange={(event) =>
									update("introSubtitle", event.target.value)
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-rsvpDeadline">RSVP Deadline</Label>
							<Input
								id="details-rsvpDeadline"
								value={form.rsvpDeadline}
								onChange={(event) => update("rsvpDeadline", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="details-siteTitle">Site Title</Label>
							<Input
								id="details-siteTitle"
								value={form.siteTitle}
								onChange={(event) => update("siteTitle", event.target.value)}
							/>
						</div>
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="details-siteDescription">Site Description</Label>
							<Textarea
								id="details-siteDescription"
								rows={2}
								value={form.siteDescription}
								onChange={(event) =>
									update("siteDescription", event.target.value)
								}
							/>
						</div>
					</div>

					<div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
						<ColorPicker
							id="details-primaryColor"
							label="Primary Color"
							value={form.primaryColor}
							fallback={DEFAULT_PRIMARY_HEX}
							hint="Themes burgundy accent — pick to override"
							onChange={(hex) => update("primaryColor", hex)}
						/>
						<ColorPicker
							id="details-secondaryColor"
							label="Secondary Color"
							value={form.secondaryColor}
							fallback={DEFAULT_SECONDARY_HEX}
							hint="Themes navy accent — pick to override"
							onChange={(hex) => update("secondaryColor", hex)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardContent className="grid gap-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<PartyPopper className="size-5 text-secondary" />
								Programme / Schedule
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Ceremony and reception events shown on the invitation.
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addItem}
							disabled={form.schedule.length >= 10}
						>
							<Plus />
							Add Event
						</Button>
					</div>

					{form.schedule.map((item, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: rows are appended/removed only, inputs are fully controlled
							key={index}
							className="grid gap-4 rounded-xl border border-border bg-muted/50 p-4"
						>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-label`}>Label</Label>
									<Input
										id={`event-${index}-label`}
										placeholder="Reception"
										value={item.label}
										onChange={(event) =>
											updateItem(index, "label", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-title`}>Title</Label>
									<Input
										id={`event-${index}-title`}
										placeholder="Reception &amp; Celebration"
										value={item.title}
										onChange={(event) =>
											updateItem(index, "title", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-time`}>Time</Label>
									<Input
										id={`event-${index}-time`}
										placeholder="1:00 PM Onwards"
										value={item.time}
										onChange={(event) =>
											updateItem(index, "time", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-location`}>Location</Label>
									<Input
										id={`event-${index}-location`}
										value={item.location}
										onChange={(event) =>
											updateItem(index, "location", event.target.value)
										}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={`event-${index}-icon`}>Icon</Label>
									<Select
										value={item.icon}
										onValueChange={(value) =>
											updateItem(
												index,
												"icon",
												value as SiteSettings["schedule"][number]["icon"],
											)
										}
									>
										<SelectTrigger
											id={`event-${index}-icon`}
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="church">Church</SelectItem>
											<SelectItem value="food">Food / Party</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid items-end gap-2 sm:col-span-2">
									<Label htmlFor={`event-${index}-description`}>
										Description
									</Label>
									<Textarea
										id={`event-${index}-description`}
										rows={2}
										value={item.description}
										onChange={(event) =>
											updateItem(index, "description", event.target.value)
										}
									/>
								</div>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="justify-self-start text-destructive"
								onClick={() => removeItem(index)}
								disabled={form.schedule.length <= 1}
							>
								<Trash2 />
								Remove Event
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			{error && (
				<p role="alert" className="mt-4 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="mt-6 flex items-center gap-4">
				<Button type="submit" size="lg" disabled={status === "saving"}>
					{status === "saving" ? (
						<>
							<Loader2 className="animate-spin" />
							Saving…
						</>
					) : (
						"Save Details"
					)}
				</Button>
				{status === "success" && (
					<span className="flex items-center gap-2 text-sm text-primary">
						<CheckCircle2 className="size-4" />
						Saved.
					</span>
				)}
			</div>
		</form>
	);
}

function SecurityTab() {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);

	function handleChangePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (next !== confirm) {
			setError("New passwords do not match.");
			setStatus("error");
			return;
		}
		setStatus("loading");
		setError(null);
		changePassword({ data: { currentPassword: current, newPassword: next } })
			.then(() => {
				setStatus("success");
				toast.success("Password updated successfully");
				setCurrent("");
				setNext("");
				setConfirm("");
			})
			.catch((err) => {
				setStatus("error");
				setError(
					err instanceof Error ? err.message : "Failed to change password.",
				);
			});
	}

	return (
		<Card className="mt-6">
			<CardContent>
				<div className="mb-6">
					<h2 className="flex items-center gap-2 text-lg font-semibold">
						<KeyRound className="size-5 text-secondary" />
						Change Password
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Update the admin password. You&apos;ll stay signed in after changing
						it.
					</p>
				</div>

				{status === "success" ? (
					<div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
						<CheckCircle2 className="size-5 shrink-0 text-primary" />
						<span>Password updated successfully.</span>
					</div>
				) : (
					<form onSubmit={handleChangePassword} className="max-w-sm grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="current-password">Current Password</Label>
							<PasswordInput
								id="current-password"
								autoComplete="current-password"
								value={current}
								onChange={(event) => setCurrent(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="new-password">New Password</Label>
							<PasswordInput
								id="new-password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								value={next}
								onChange={(event) => setNext(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirm-password">Confirm New Password</Label>
							<PasswordInput
								id="confirm-password"
								autoComplete="new-password"
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
							/>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}

						<Button
							type="submit"
							disabled={status === "loading" || !current || !next || !confirm}
						>
							{status === "loading" ? (
								<>
									<Loader2 className="animate-spin" />
									Saving…
								</>
							) : (
								"Save New Password"
							)}
						</Button>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
