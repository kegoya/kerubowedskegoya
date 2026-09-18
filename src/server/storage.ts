import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const IMAGE_EXT: Record<string, string> = {
	"image/png": "png",
	"image/jpeg": "jpg",
	"image/webp": "webp",
	"image/avif": "avif",
	"image/gif": "gif",
	"image/svg+xml": "svg",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function env(name: string) {
	if (typeof process === "undefined") return undefined;
	return process.env?.[name];
}

function remoteConfigured() {
	return Boolean(env("STORAGE_S3_BUCKET"));
}

async function storeRemote(
	bytes: Buffer,
	key: string,
	contentType: string,
): Promise<string> {
	const bucket = env("STORAGE_S3_BUCKET");
	const accessKeyId = env("STORAGE_S3_ACCESS_KEY_ID");
	const secretAccessKey = env("STORAGE_S3_SECRET_ACCESS_KEY");
	const publicUrl = env("STORAGE_S3_PUBLIC_URL")?.replace(/\/+$/, "");

	if (!bucket) {
		throw new Error("Object storage is not configured.");
	}
	if (!accessKeyId || !secretAccessKey) {
		throw new Error(
			"Object storage credentials are missing (STORAGE_S3_ACCESS_KEY_ID / STORAGE_S3_SECRET_ACCESS_KEY).",
		);
	}
	if (!publicUrl) {
		throw new Error(
			"STORAGE_S3_PUBLIC_URL must be set to serve uploaded images publicly.",
		);
	}

	const { PutObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
	const client = new S3Client({
		region: env("STORAGE_S3_REGION") ?? "auto",
		endpoint: env("STORAGE_S3_ENDPOINT"),
		credentials: { accessKeyId, secretAccessKey },
	});
	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: bytes,
			ContentType: contentType,
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);
	return `${publicUrl}/${key}`;
}

export async function storeImage(file: File): Promise<{ url: string }> {
	const ext = IMAGE_EXT[file.type];
	if (!ext) {
		throw new Error(
			"Unsupported image type. Use PNG, JPG, WebP, AVIF, GIF or SVG.",
		);
	}
	if (file.size > MAX_IMAGE_BYTES) {
		throw new Error("Image must be 5 MB or smaller.");
	}

	const bytes = Buffer.from(await file.arrayBuffer());
	const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

	if (remoteConfigured()) {
		return { url: await storeRemote(bytes, `uploads/${name}`, file.type) };
	}

	const uploadRoot = resolve(
		process.cwd(),
		process.env.NODE_ENV === "production" ? ".output" : "",
		"public",
		"uploads",
	);
	await mkdir(uploadRoot, { recursive: true });
	await writeFile(resolve(uploadRoot, name), bytes);
	return { url: `/uploads/${name}` };
}
