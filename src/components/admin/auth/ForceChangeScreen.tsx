import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { changePassword } from "#/server/admin";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { FormEvent } from "react";
import { toast } from "sonner";




export default function ForceChangeScreen({ onChanged }: { onChanged: () => void }) {
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