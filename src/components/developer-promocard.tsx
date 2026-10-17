
import { ArrowUpRight, Code2, MessageCircle } from "lucide-react";
import type { DeveloperSettings } from "#/server/site";

type DeveloperPromoCardProps = {
  settings: DeveloperSettings;
};

export default function DeveloperPromoCard({
  settings,
}: DeveloperPromoCardProps) {
  const whatsappLink =
    `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=` +
    encodeURIComponent(settings.whatsappMessage);

  return (
    <section
      aria-labelledby="developer-card-title"
      className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="flex h-full w-full min-w-0 flex-col items-center rounded-2xl border border-border bg-card p-5 text-center text-card-foreground shadow-sm sm:p-6">
        <div className="flex items-center justify-center gap-2">
          <Code2 aria-hidden="true" className="size-4 text-primary" />
          <h3 id="developer-card-title" className="font-serif text-xl">
            {settings.name}
          </h3>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {settings.tagline}
        </p>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {settings.description}
        </p>

        {settings.services.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {settings.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
              >
                {service}
              </span>
            ))}
          </div>
        )}

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 self-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1FBD5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          Chat on WhatsApp
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>

        {settings.note && (
          <p className="mt-3 text-[10px] italic text-muted-foreground">
            {settings.note}
          </p>
        )}
      </div>
    </section>
  );
}
