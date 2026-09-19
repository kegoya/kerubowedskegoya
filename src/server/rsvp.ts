import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "../db";
import { rsvps } from "../db/schema";
import { assertSameOrigin } from "./csrf";
import { rateLimitRsvp } from "./rate-limit";

export const rsvpSchema = z.object({
	name: z.string().trim().min(1, "Please enter your full name").max(120),
	email: z.string().trim().email("Please enter a valid email address").max(200),
	attending: z.enum(["yes", "no"], {
		message: "Please select whether you will attend",
	}),
	guests: z.coerce
		.number()
		.int()
		.min(1, "Please include at least 1 guest")
		.max(5, "Maximum of 5 guests"),
	message: z
		.string()
		.trim()
		.max(1000, "Please keep your note under 1000 characters")
		.optional()
		.transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export type RsvpResponse = {
	success: true;
	message: string;
};

export const submitRsvp = createServerFn({ method: "POST" })
	.validator((input: RsvpInput) => {
		const result = rsvpSchema.safeParse(input);
		if (!result.success) {
			throw new Error(JSON.stringify(result.error.issues));
		}
		return result.data;
	})
	.handler(async ({ data }) => {
		assertSameOrigin();
		rateLimitRsvp();
		await db.insert(rsvps).values(data);

		return {
			success: true,
			message: `Thank you, ${data.name}! Your RSVP has been received.`,
		} satisfies RsvpResponse;
	});
