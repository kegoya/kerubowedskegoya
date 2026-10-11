
import { CalendarDays, MapPin, Navigation, Phone } from "lucide-react";

type WeddingVenue = {
  name: string;
  address: string;
  mapsUrl: string;
  mapQuery: string;
  purpose: string;
};

type VenueLocationProps = {
  dateLabel: string;
  countdownTarget: string;
  phone?: string;
  church: WeddingVenue;
  reception: WeddingVenue;
};

export function VenueLocation({
  dateLabel,
  countdownTarget,
  phone = "+254 728 258 654",
  church,
  reception,
}: VenueLocationProps) {
  const date = new Date(countdownTarget);

  const eventDate = Number.isNaN(date.getTime())
    ? dateLabel
    : `${date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      })}, ${date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Nairobi",
      })}`;

  const venues = [
    {
      ...church,
      label: "Wedding Ceremony",
      number: "01",
    },
    {
      ...reception,
      label: "Wedding Reception",
      number: "02",
    },
  ];

  const mapUrl =
    `https://www.google.com/maps?output=embed&q=${encodeURIComponent(
      `${church.mapQuery || church.name} Kisii Kenya`,
    )}&z=12`;

  const directionsUrl = (venue: WeddingVenue) =>
    venue.mapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${venue.mapQuery || venue.name} Kisii Kenya`,
    )}&travelmode=driving`;

  return (
    <section
      id="venue"
      className="bg-background px-4 py-14 text-foreground sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <header className="text-center">
        <p className="font-serif text-2xl italic text-primary  font-semibold tracking-[0.35em] uppercase">
                          Find Us
                        </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl md:text-5xl">
            Two Places, One Celebration
          </h2>

          <p className="mx-auto mt-3 max-w-xl font-serif text-md italic text-muted-foreground sm:text-base">
            Join us at the church for our ceremony, then continue
            the celebration at our reception venue.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-primary sm:w-20" />
            <MapPin
              aria-hidden="true"
              className="size-4 fill-primary text-primary"
            />
            <span className="h-px w-12 bg-primary sm:w-20" />
          </div>
        </header>

        {/* Wedding date and contact */}
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <CalendarDays aria-hidden="true" className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Wedding Date
              </p>
              <p className="mt-1 break-words font-serif font-semibold">
                {eventDate}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Phone aria-hidden="true" className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Inquiries
              </p>

              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-1 block break-words font-serif font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {phone}
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:mt-10">
          <iframe
            title="Map of the wedding ceremony area in Kisii"
            src={mapUrl}
            className="h-[280px] w-full sm:h-[360px] md:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Select a venue below to open directions in Google Maps.
        </p>

        {/* Venue cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {venues.map((venue) => (
            <article
              key={venue.number}
              className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-shadow hover:shadow-md sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/20 font-serif text-lg font-semibold">
                  {venue.number}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {venue.label}
                  </p>

                  <h3 className="mt-2 font-serif text-xl font-semibold sm:text-2xl">
                    {venue.name}
                  </h3>

                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    <span>{venue.address}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={directionsUrl(venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <Navigation aria-hidden="true" className="size-4" />
                  Get Directions
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
