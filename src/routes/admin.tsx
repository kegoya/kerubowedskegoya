import { createFileRoute } from "@tanstack/react-router";
import {
	CheckCircle2,
	KeyRound,
	Loader2,
	Lock,
	LogOut,
	PartyPopper,
	Settings,
	Users,
	UserX,
} from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

import { ThemeToggle } from "#/components/theme-toggle";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { changePassword, listRsvps } from "#/server/admin";

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

const STORAGE_KEY = "wedding-admin-password";

function formatDate(value: string) {
	return new Date(value).toLocaleString("en-KE", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

type Tab = "responses" | "settings";

function Admin() {
	const [passwordInput, setPasswordInput] = useState("");
	const [password, setPassword] = useState<string | null>(() =>
		sessionStorage.getItem(STORAGE_KEY),
	);
	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
	const [tab, setTab] = useState<Tab>("responses");

	const loadRsvps = useCallback(async (pw: string) => {
		setStatus("loading");
		setError(null);
		try {
			const rows = await listRsvps({ data: { password: pw } });
			setRsvps(rows);
			setStatus("idle");
		} catch (err) {
			setStatus("error");
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
			sessionStorage.removeItem(STORAGE_KEY);
			setPassword(null);
			setPasswordInput("");
		}
	}, []);

	useEffect(() => {
		if (password) loadRsvps(password);
	}, [password, loadRsvps]);

	function handleLogin(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const pw = passwordInput.trim();
		if (!pw) return;
		sessionStorage.setItem(STORAGE_KEY, pw);
		setPassword(pw);
	}

	function handleLogout() {
		sessionStorage.removeItem(STORAGE_KEY);
		setPassword(null);
		setPasswordInput("");
		setRsvps([]);
	}

	const attending = rsvps.filter((entry) => entry.attending === "yes");
	const totalGuests = attending.reduce((sum, entry) => sum + entry.guests, 0);

	return (
		<main className="min-h-dvh bg-background font-sans text-foreground antialiased">
			<header className="flex items-center justify-between p-4 sm:p-6">
				<p className="font-serif text-xl">RSVP Admin</p>
				<div className="flex items-center gap-2">
					{password && (
						<Button variant="outline" size="sm" onClick={handleLogout}>
							<LogOut />
							Log out
						</Button>
					)}
					<ThemeToggle />
				</div>
			</header>

			{!password ? (
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
							<Input
								id="admin-password"
								type="password"
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
			) : (
				<section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
					<Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
						<TabsList className="w-full">
							<TabsTrigger value="responses" className="flex-1 gap-2">
								<Users className="size-4" />
								Responses
							</TabsTrigger>
							<TabsTrigger value="settings" className="flex-1 gap-2">
								<Settings className="size-4" />
								Settings
							</TabsTrigger>
						</TabsList>

						{tab === "responses" && (
							<ResponsesTab
								status={status}
								error={error}
								rsvps={rsvps}
								attending={attending}
								totalGuests={totalGuests}
							/>
						)}
						{tab === "settings" && <SettingsTab />}
					</Tabs>
				</section>
			)}
		</main>
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

function SettingsTab() {
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
				sessionStorage.setItem(STORAGE_KEY, next);
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
						Update the admin password. You&apos;ll stay logged in after changing
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
							<Input
								id="current-password"
								type="password"
								autoComplete="current-password"
								value={current}
								onChange={(event) => setCurrent(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="new-password">New Password</Label>
							<Input
								id="new-password"
								type="password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								value={next}
								onChange={(event) => setNext(event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirm-password">Confirm New Password</Label>
							<Input
								id="confirm-password"
								type="password"
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
