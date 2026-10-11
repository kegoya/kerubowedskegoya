import type { FormState, RsvpFieldErrors } from "./types";

export function parseFieldErrors(err: unknown): RsvpFieldErrors | null {
  if (!(err instanceof Error)) return null;

  try {
    const issues = JSON.parse(err.message) as {
      path?: (string | number)[];
      message?: string;
    }[];

    if (!Array.isArray(issues)) return null;

    const fields: RsvpFieldErrors = {};
    let found = false;

    for (const issue of issues) {
      const field = issue.path?.[0];

      if (
        typeof field !== "string" ||
        !issue.message ||
        !Object.prototype.hasOwnProperty.call(
          {} as FormState,
          field,
        )
      ) {
        // Validate the field name below instead.
      }

      if (
        typeof field !== "string" ||
        !issue.message ||
        !["name", "phone", "attending", "guests", "message"].includes(field)
      ) {
        continue;
      }

      const key = field as keyof FormState;
      found = true;

      if (fields[key]) {
        fields[key].push(issue.message);
      } else {
        fields[key] = [issue.message];
      }
    }

    return found ? fields : null;
  } catch {
    return null;
  }
}