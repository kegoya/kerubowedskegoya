
import type { Dispatch, SetStateAction } from "react";
import type { SiteSettings } from "#/server/site";

export type FormState = {
  name: string;
  phone: string;
  attending: "yes" | "no";
  guests: string;
  message: string;
};

export type RsvpFieldErrors = Partial<
  Record<keyof FormState, string[]>
>;

export type RsvpStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export type HomeSectionProps = {
  settings: SiteSettings;
};

export type HeroProps = HomeSectionProps & {
  onRsvp: () => void;
  onViewProgramme: () => void;
};

export type RsvpSectionProps = {
  settings: SiteSettings;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  status: RsvpStatus;
  error: string | null;
  fieldErrors: RsvpFieldErrors;
  onFieldChange: (field: keyof FormState) => void;
  successMessage: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};
