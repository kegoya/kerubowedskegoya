"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, {
	type Crop,
	centerCrop,
	cropToCanvas,
	makeAspectCrop,
	type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, Loader2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

const ASPECT_PRESETS = [
	{ label: "Free", value: undefined as number | undefined },
	{ label: "1:1", value: 1 },
	{ label: "4:3", value: 4 / 3 },
	{ label: "3:2", value: 3 / 2 },
	{ label: "16:9", value: 16 / 9 },
];

async function fileToDataUrl(file: File): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () =>
			reject(reader.error ?? new Error("Could not read the image."));
		reader.readAsDataURL(file);
	});
}

function toPercentCrop(
	crop: { x: number; y: number; width: number; height: number },
	containerWidth: number,
	containerHeight: number,
): import("react-image-crop").PercentCrop {
	return {
		unit: "%",
		x: (crop.x / containerWidth) * 100,
		y: (crop.y / containerHeight) * 100,
		width: (crop.width / containerWidth) * 100,
		height: (crop.height / containerHeight) * 100,
	};
}

function toPercentCropFromPixel(
	pixel: {
		x: number;
		y: number;
		width: number;
		height: number;
	},
	containerWidth: number,
	containerHeight: number,
): import("react-image-crop").PercentCrop {
	return toPercentCrop(pixel, containerWidth, containerHeight);
}

async function cropToFile(
	image: HTMLImageElement,
	crop: PixelCrop,
	originalName: string,
): Promise<File> {
	const canvas = document.createElement("canvas");
	await cropToCanvas(image, canvas, crop);
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, "image/png"),
	);
	const ext = originalName.includes(".")
		? originalName.slice(originalName.lastIndexOf("."))
		: ".png";
	return new File(
		[blob ?? new Blob()],
		`${originalName.replace(/\.[^.]+$/, "")}-crop${ext}`,
		{ type: "image/png" },
	);
}

export function ImageCropper({
	open,
	onOpenChange,
	file,
	aspect: initialAspect,
	title = "Crop image",
	description,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	file: File;
	aspect?: number;
	title?: string;
	description?: string;
	onConfirm: (croppedFile: File) => void | Promise<void>;
}) {
	const imgRef = useRef<HTMLImageElement>(null);
	const [src, setSrc] = useState<string>("");
	const [aspect, setAspect] = useState<number | undefined>(initialAspect);
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open || !file) return;
		let objectUrl: string | null = null;
		void fileToDataUrl(file).then((dataUrl) => {
			if (dataUrl) {
				objectUrl = dataUrl;
				setSrc(dataUrl);
			}
		});
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [open, file]);

	function handleImageLoad() {
		const image = imgRef.current;
		if (!image) return;
		const { width, height } = image;
		if (aspect) {
			const next = makeAspectCrop(
				{ unit: "px", width: Math.floor(width * 0.9) },
				aspect,
				width,
				height,
			);
			setCrop(centerCrop(next, width, height));
		} else {
			const size = Math.min(width, height) * 0.8;
			setCrop(
				toPercentCropFromPixel(
					{
						x: (width - size) / 2,
						y: (height - size) / 2,
						width: size,
						height: size,
					},
					width,
					height,
				),
			);
		}
		setCompletedCrop(null);
	}

	function handleAspectChange(next: number | undefined) {
		setAspect(next);
	}

	async function handleConfirm() {
		const image = imgRef.current;
		const cropIdx = completedCrop;
		if (!image || !cropIdx || cropIdx.width < 1 || cropIdx.height < 1) {
			setError("Please draw a crop area before confirming.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const cropped = await cropToFile(image, cropIdx, file.name);
			await onConfirm(cropped);
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Could not crop the image.",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<div className="grid gap-4">
					{src && (
						<ReactCrop
							crop={crop}
							onChange={(_, percentCrop) => setCrop(percentCrop)}
							onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
							aspect={aspect}
							ruleOfThirds
							keepSelection
							className="!rounded-xl overflow-hidden border border-border"
						>
							<img
								ref={imgRef}
								src={src}
								alt=""
								onLoad={handleImageLoad}
								className="max-h-[60dvh] w-full object-contain"
							/>
						</ReactCrop>
					)}

					{aspect && (
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground">
								Aspect:
							</span>
							{ASPECT_PRESETS.map((preset) => (
								<Button
									key={preset.label}
									type="button"
									size="sm"
									variant={aspect === preset.value ? "default" : "outline"}
									onClick={() => handleAspectChange(preset.value)}
								>
									{preset.label}
								</Button>
							))}
						</div>
					)}

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => void handleConfirm()}
						disabled={saving}
					>
						{saving ? <Loader2 className="animate-spin" /> : <Check />}
						{saving ? "Saving…" : "Crop & continue"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
