
import { ImageCropper } from "#/components/image-cropper";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { uploadImage } from "#/server/site";
import { cn } from "cn";
import { ImagePlus, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { MAX_SOURCE_IMAGE_BYTES, toImageUrl } from "../shared/admin-utils";

import type { DragEvent } from "react";

export default function ImagePicker({
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
		if (file.size > MAX_SOURCE_IMAGE_BYTES) {
			return "Image must be 25 MB or smaller.";
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
				onChange={(event) => onValue(toImageUrl(event.target.value))}
				placeholder="…or paste a path, URL or Google Drive share link"
			/>
			<p className="text-xs text-muted-foreground">
				Google Drive links (
				<span className="font-medium text-foreground">
					drive.google.com/file/d/…
				</span>
				) are converted automatically. Make sure the file is shared with{" "}
				<span className="font-medium text-foreground">
					&ldquo;Anyone with the link&rdquo;
				</span>
				.
			</p>

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