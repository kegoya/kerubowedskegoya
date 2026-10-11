import AppSidebar from "#/components/admin/layout/AppSidebar";
import MobileNavBar from "#/components/admin/layout/MobileNavBar";
import { tabLabels, type RsvpRecord, type Tab } from "#/components/admin/shared/admin-types";
import DetailsTab from "#/components/admin/tabs/DetailsTab";
import ResponsesTab from "#/components/admin/tabs/ResponsesTab";
import SecurityTab from "#/components/admin/tabs/SecurityTab";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { PasswordInput } from "#/components/ui/password-input";
import { Separator } from "#/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger
} from "#/components/ui/sidebar";
import {
	getAuthStatus,
	listRsvps,
	login,
	logout
} from "#/server/admin";
import ForceChangeScreen from "@/components/admin/auth/ForceChangeScreen";
import { createFileRoute } from "@tanstack/react-router";
import {
	Loader2,
	Lock
} from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";

export const Route = createFileRoute("/admin")({ component: Admin });




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





















