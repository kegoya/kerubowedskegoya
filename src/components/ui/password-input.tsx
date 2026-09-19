import { cn } from "cn";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Input } from "#/components/ui/input";

function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<div className="relative">
			<Input
				data-slot="password-input"
				{...props}
				type={showPassword ? "text" : "password"}
				className={cn("pe-9", className)}
			/>
			<button
				type="button"
				aria-label={showPassword ? "Hide password" : "Show password"}
				aria-pressed={showPassword}
				onClick={() => setShowPassword((prev) => !prev)}
				className="absolute inset-y-0 right-0 flex size-9 items-center justify-center rounded-e-md text-muted-foreground outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 hover:text-foreground"
			>
				{showPassword ? (
					<EyeOff className="size-4" />
				) : (
					<Eye className="size-4" />
				)}
			</button>
		</div>
	);
}

export { PasswordInput };
