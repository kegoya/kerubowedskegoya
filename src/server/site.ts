import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db";
import { settings } from "../db/schema";
import { assertPasswordChanged, requireAuth } from "./admin";
import { assertSameOrigin } from "./csrf";
import { storeImage } from "./storage";

export const SETTINGS_KEY = "site_settings";

export const scheduleItemSchema = z.object({
	label: z.string().min(1, "Label is required").max(60),
	title: z.string().min(1, "Title is required").max(120),
	time: z.string().min(1, "Time is required").max(120),
	location: z.string().min(1, "Location is required").max(200),
	description: z.string().max(1000).default(""),
	icon: z.enum(["church", "food"]),
});

export const galleryItemSchema = z.object({
	name: z.string().trim().max(80, "Photo name is too long").default(""),
	image: z.string().max(1000).default(""),
	alt: z.string().trim().max(200, "Alt text is too long").default(""),
});

export const gallerySchema = z.object({
	featured: galleryItemSchema,
	items: z.array(galleryItemSchema).max(12, "Up to 12 photos").default([]),
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const venueSchema = z.object({
	name: z.string().trim().min(1, "Venue name is required").max(120),
	address: z.string().trim().min(1, "Venue address is required").max(200),
	mapsUrl: z.string().trim().max(1000).default(""),
	mapQuery: z.string().trim().max(200).default(""),
	purpose: z.string().trim().max(120).default(""),
});

export type Venue = z.infer<typeof venueSchema>;

export const siteSettingsSchema = z.object({
	siteTitle: z.string().min(1).max(120),
	siteDescription: z.string().min(1).max(300),
	partnerA: z.string().min(1, "Partner A name is required").max(60),
	partnerB: z.string().min(1, "Partner B name is required").max(60),
	introTagline: z.string().min(1).max(120),
	introSubtitle: z.string().min(1).max(160),
	dateLabel: z.string().min(1, "Date is required").max(120),
	countdownTarget: z.string().min(1, "Countdown target is required"),
	location: z.string().min(1, "Location is required").max(120),
	church: venueSchema,
	reception: venueSchema,
	whatsappNumber: z.string().trim().max(40).default(""),
	whatsappGroupLink: z.string().trim().max(1000).default(""),
	giftNumber: z.string().trim().max(40).default(""),
	heroImage: z.string().max(1000).default(""),
	favicon: z.string().max(1000).default(""),
	rsvpDeadline: z.string().min(1).max(120),
	primaryColor: z.string().max(50).default(""),
	secondaryColor: z.string().max(50).default(""),
	schedule: z
		.array(scheduleItemSchema)
		.min(1, "Add at least one event")
		.max(10),
	gallery: gallerySchema,
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
	siteTitle: "Elvin & Eric - Wedding Invitation",
	siteDescription:
		"Join Elvin and Eric as they celebrate their wedding on December 28, 2026 at Nyanchwa SDA Church in Kisii, Kenya.",
	partnerA: "Elvin",
	partnerB: "Eric",
	introTagline: "Together with their families",
	introSubtitle: "Request the pleasure of your company",
	dateLabel: "December 28, 2026",
	countdownTarget: "2026-12-28T07:00:00.000Z",
	location: "Kisii, Kenya",
	church: {
		name: "Nyanchwa SDA Church",
		address: "Nyanchwa Adventist Complex, Kisii, Kenya",
		mapsUrl:
			"https://www.google.com/maps/search/?api=1&query=Nyanchwa+SDA+Church%2C+Kisii%2C+Kenya",
		mapQuery: "Nyanchwa SDA Church",
		purpose: "Wedding ceremony",
	},
	reception: {
		name: "Kisii National Polytechnic",
		address: "Kisii, Kenya",
		mapsUrl:
			"https://www.google.com/maps/search/?api=1&query=Kisii+National+Polytechnic%2C+Kisii%2C+Kenya",
		mapQuery: "Kisii National Polytechnic",
		purpose: "Wedding reception",
	},
	whatsappNumber: "+254 728 258 654",
	whatsappGroupLink: "https://chat.whatsapp.com/YOUR_INVITE_CODE",
	giftNumber: "0728 258 654",
	heroImage: "/main.png",
	favicon: "/icon.png",
	rsvpDeadline: "December 14, 2026",
	primaryColor: "",
	secondaryColor: "",
	schedule: [
		{
			label: "Wedding Ceremony",
			title: "Church Ceremony",
			time: "10:00 AM – 12:30 PM",
			location: "Nyanchwa SDA Church",
			description:
				"Please arrive at least 30 minutes early to be seated. An intimate, sacred celebration of love before close family and friends.",
			icon: "church",
		},
		{
			label: "Reception",
			title: "Reception & Celebration",
			time: "1:00 PM Onwards",
			location: "Kisii National Polytechnic Grounds",
			description:
				"Join us for lunch, heartfelt toasts, and dancing as we kick off the festivities. The celebration continues well into the evening.",
			icon: "food",
		},
	],
	gallery: {
		featured: {
			name: "Bride & Bridegroom",
			image: "/images/gallery/couple-1.jpg",
			alt: "The bride and bridegroom together",
		},
		items: [
			{
				name: "Best Couple",
				image: "/images/gallery/couple-2.jpg",
				alt: "The couple dressed elegantly",
			},
			{
				name: "Cellin Nyaboke",
				image: "/images/gallery/couple-3.jpg",
				alt: "Portrait of Cellin Nyaboke",
			},
			{
				name: "Mwalimu Ochenge",
				image: "/images/gallery/couple-4.jpg",
				alt: "Portrait of Mwalimu Ochenge",
			},
			{
				name: "Our Memories",
				image: "/images/gallery/couple-5.jpg",
				alt: "A special wedding memory",
			},
		],
	},
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
	async () => {
		const row = await db
			.select({ value: settings.value })
			.from(settings)
			.where(eq(settings.key, SETTINGS_KEY))
			.get();

		if (!row) return DEFAULT_SITE_SETTINGS;

		try {
			const stored = JSON.parse(row.value) as Partial<SiteSettings>;
			return siteSettingsSchema.parse({ ...DEFAULT_SITE_SETTINGS, ...stored });
		} catch {
			return DEFAULT_SITE_SETTINGS;
		}
	},
);

export const updateSiteSettings = createServerFn({ method: "POST" })
	.validator(siteSettingsSchema)
	.handler(async ({ data }) => {
		assertSameOrigin();
		await requireAuth();
		await assertPasswordChanged();

		const value = JSON.stringify(data);
		await db
			.insert(settings)
			.values({ key: SETTINGS_KEY, value })
			.onConflictDoUpdate({ target: settings.key, set: { value } });

		return { success: true, settings: data };
	});

export const uploadImage = createServerFn({ method: "POST" })
	.validator((data: FormData) => data)
	.handler(async ({ data }) => {
		assertSameOrigin();
		await requireAuth();
		await assertPasswordChanged();

		const file = data.get("file");
		if (!(file instanceof File)) {
			throw new Error("No image file provided.");
		}

		return await storeImage(file);
	});
