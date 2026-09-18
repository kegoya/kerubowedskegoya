import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "./schema.ts";

const databaseUrl =
	(typeof process !== "undefined"
		? process.env?.TURSO_DATABASE_URL
		: undefined) ?? "file:local.db";
const authToken =
	typeof process !== "undefined" ? process.env?.TURSO_AUTH_TOKEN : undefined;

export type Db = LibSQLDatabase<typeof schema>;

let cachedDb: Db | null = null;

function getDb(): Db {
	if (!cachedDb) {
		const client = createClient({ url: databaseUrl, authToken });
		cachedDb = drizzle(client, { schema });
	}
	return cachedDb;
}

export function getDatabase(): Db {
	return getDb();
}

// Lazily initialized on first access so importing this module has no side
// effects in the client bundle (the browser cannot open "file:" databases).
export const db = new Proxy({} as Db, {
	get(_target, prop) {
		const instance = getDb();
		const value = Reflect.get(instance, prop, instance);
		return typeof value === "function" ? value.bind(instance) : value;
	},
});
