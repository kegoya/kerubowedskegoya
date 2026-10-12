
import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";

import { SectionDivider } from "#/components/home/section-divider";
import { submitRsvp } from "#/server/rsvp";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettings,
} from "#/server/site";
import { Countdown } from "@/components/home/countdown";
import { GiftContribution } from "@/components/home/gift-contribution";
import { Hero } from "@/components/home/hero";
import { HomeFooter } from "@/components/home/home-footer";
import { RsvpSection } from "@/components/home/rsvp-section";
import { Schedule } from "@/components/home/schedule";
import type {
  FormState,
  RsvpFieldErrors,
} from "@/components/home/types";
import { parseFieldErrors } from "@/components/home/validation";
import { VenueLocation } from "@/components/home/venue-location";
import { ThemeToggle } from "@/components/theme-toggle";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import Gallery from "#/components/home/gallery";

const initialForm: FormState = {
  name: "",
  phone: "",
  attending: "yes",
  guests: "1",
  message: "",
};

export const Route = createFileRoute("/")({
  loader: async () => ({
    settings: await getSiteSettings(),
  }),

  head: ({ loaderData }) => {
    const settings = loaderData?.settings ?? DEFAULT_SITE_SETTINGS;

    const siteUrl = (
      (typeof process !== "undefined"
        ? process.env?.PUBLIC_SITE_URL
        : undefined) ||
      (import.meta.env?.VITE_PUBLIC_SITE_URL as string | undefined) ||
      ""
    ).replace(/\/+$/, "");

    const image = settings.heroImage || DEFAULT_SITE_SETTINGS.heroImage;
    const absoluteImage =
      /^[a-z][a-z0-9+.-]*:\/\//i.test(image)
        ? image
        : siteUrl
          ? `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`
          : image;

    return {
      meta: [
        { title: settings.siteTitle },
        { name: "description", content: settings.siteDescription },
        { property: "og:title", content: settings.siteTitle },
        { property: "og:description", content: settings.siteDescription },
        { property: "og:type", content: "website" },
        { property: "og:image", content: absoluteImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: absoluteImage },
      ],
      links: [
        { rel: "icon", href: settings.favicon || "/icon.png" },
      ],
    };
  },

  component: Home,
});

function Home() {
  const { settings } = Route.useLoaderData();

  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RsvpFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearFieldError(field: keyof FormState) {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") return;

    setStatus("submitting");
    setError(null);
    setFieldErrors({});

    try {
      const response = await submitRsvp({
        data: {
          name: form.name,
          phone: form.phone,
          attending: form.attending,
          guests: Number(form.guests),
          message: form.message,
        },
      });

      setSuccessMessage(response.message);
      setStatus("success");
    } catch (err) {
      setStatus("error");

      // Move your existing parseFieldErrors() helper into
      // rsvp-section.tsx or a shared validation utility.
      const issues =
        err instanceof Error ? parseFieldErrors(err) : null;

      if (issues) {
        setFieldErrors(issues);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        );
      }
    }
  }

  return (
    <main className="min-h-dvh bg-background font-sans text-foreground antialiased">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
        <Hero
          settings={settings}
          onRsvp={() => scrollToSection("rsvp")}
          onViewProgramme={() => scrollToSection("programme")}
        />

        <Countdown settings={settings} />

        <Schedule settings={settings} />

        <Gallery settings={settings} />

        <section
          id="rsvp"
          className="scroll-mt-24 px-4 py-8 sm:py-12"
        >
          
          <div className="text-center">
                        <p className="font-serif text-2xl italic text-primary  font-semibold tracking-[0.35em] uppercase">
                          Join Us
                        </p>
            
                        <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                        RSVP & Contributions
                        </h2>
                          <div className="mt-3 mb-4">
                          <SectionDivider />
                          </div>
                      </div>

          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-10">
            <div className="min-w-0">
              <RsvpSection
                settings={settings}
                form={form}
                setForm={setForm}
                status={status}
                error={error}
                fieldErrors={fieldErrors}
                onFieldChange={clearFieldError}
                successMessage={successMessage}
                onSubmit={handleSubmit}
                onReset={() => {
                  setForm(initialForm);
                  setStatus("idle");
                  setError(null);
                  setFieldErrors({});
                  setSuccessMessage("");
                }}
              />
            </div>

            <div className="min-w-0">
              <GiftContribution
                phoneNumber={settings.giftNumber || undefined}
                reference={`${settings.partnerA} & ${settings.partnerB}`}
              />
            </div>
          </div>
        </section>

        <VenueLocation
          dateLabel={settings.dateLabel}
          countdownTarget={settings.countdownTarget}
          phone={settings.whatsappNumber || undefined}
          church={settings.church}
          reception={settings.reception}
        />


        <HomeFooter settings={settings} />

        <WhatsAppFloat
          groupLink={settings.whatsappGroupLink}
          number={settings.whatsappNumber}
        />
    </main>
  );
}
