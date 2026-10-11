import { GlobeIcon, KeyRoundIcon, UsersIcon, type LucideIcon } from "lucide-react";

export type Tab = "responses" | "details" | "security";

export type RsvpRecord = {
  id: number;
  name: string;
  phone: string;
  attending: "yes" | "no";
  guests: number;
  message: string | null;
  createdAt: string;
};

export const tabLabels: Record<Tab, string> = {
  responses: "RSVP Responses",
  details: "Invitation Details",
  security: "Security",
};

export const navItems: {
  id: Tab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "responses", label: "Responses", icon: UsersIcon },
  { id: "details", label: "Details", icon: GlobeIcon },
  { id: "security", label: "Security", icon: KeyRoundIcon },
];