import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { RotateCcw } from "lucide-react";

export default function ColorPicker({
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