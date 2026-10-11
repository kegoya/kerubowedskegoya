
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Label } from "#/components/ui/label";
import { PasswordInput } from "#/components/ui/password-input";
import { changePassword } from "#/server/admin";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function SecurityTab() {
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