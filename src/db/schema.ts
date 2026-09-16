import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rsvps = sqliteTable("rsvps", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	attending: text("attending", { enum: ["yes", "no"] }).notNull(),
	guests: integer("guests").notNull().default(1),
	message: text("message"),
	createdAt: text("created_at")
		.notNull()
		.default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const settings = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});
