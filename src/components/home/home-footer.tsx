
import { Heart, Phone } from "lucide-react";
import type { HomeSectionProps } from "./types";

export function HomeFooter({ settings }: HomeSectionProps) {
  const links = [
    { label: "Countdown", href: "#countdown" },
    { label: "Programme", href: "#programme" },
    { label: "Venue", href: "#venue" },
    { label: "RSVP", href: "#rsvp" },
    { label: "Gifts and Contributions", href: "#rsvp" },
    { label: "Find Us", href: "#venue" },
  ];

  return (
    <footer className="border-t border-border bg-background px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Couple introduction */}
        <div className="text-center">
          <Heart
            aria-hidden="true"
            className="mx-auto mb-4 size-6 fill-primary text-gold"
          />

          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
            {settings.partnerA} &amp; {settings.partnerB}
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            Two hearts, one love, and a lifetime of memories begins here.
            Thank you for being part of our beautiful journey.
          </p>
        </div>

        {/* Footer navigation and details */}
        <div className="mt-5 grid gap-9 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Quick links */}
          <div>
            <h3 className="font-serif text-xl">Quick Links</h3>

            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="text-gold" aria-hidden="true">
                        →
                      </span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Event details */}
          <div>
            <h3 className="font-serif text-xl">Event Details</h3>

            <div className="mt-4 space-y-5 text-sm">
              <div>
                <p className="font-semibold text-gold">
                  {settings.dateLabel || "December, 2026"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Starting at 10:00 AM
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  {settings.location || "Kisii, Kenya"}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Venue details shared on RSVP
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-xl">Get in Touch</h3>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              For questions about the celebration, please contact us.
            </p>

            <a
              href={`tel:${(settings.whatsappNumber || "+254728258654").replace(/\D/g, "")}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Phone aria-hidden="true" className="size-4" />
              {settings.whatsappNumber || "+254 728 258 654"}
            </a>

            <p className="mt-1 text-xs text-muted-foreground">
              For inquiries
            </p>
          </div>
        </div>

        {/* Copyright and developer credit */}
        <div className="mt-5 flex flex-col items-center gap-3 border-t border-border pt-3 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} {settings.partnerA} &amp;{" "}
            {settings.partnerB} Wedding. All rights reserved.
          </p>

          <p>
            Developed by{" "}
            <a
              href="https://wa.me/254712405172"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Kegs Info Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
