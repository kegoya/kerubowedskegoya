import { Church, MapPin, PartyPopper, UtensilsCrossed } from "lucide-react";
import { SectionDivider } from "./section-divider";
import type { HomeSectionProps } from "./types";



export function Schedule({ settings }: HomeSectionProps) {


    const scheduleIcons = {
        church: Church,
        food: UtensilsCrossed,
    } as const;
    
    const accentStyles = {
        burgundy: {
            badge: "bg-primary/10 text-primary",
            pill: "bg-primary/5 text-primary border-primary/20",
            line: "bg-primary",
        },
        navy: {
            badge: "bg-secondary/10 text-secondary",
            pill: "bg-secondary/5 text-secondary border-secondary/20",
            line: "bg-secondary",
        },
    } as const;
    
    
    
        return (
          <section
            id="programme"
            className="mx-auto max-w-6xl scroll-mt-12 px-4 py-8 sm:px-6 sm:py-12"
          >
            <div className=" text-center">
              
              <p className="font-serif text-2xl italic text-primary  font-semibold tracking-[0.35em] uppercase">
              Programme
                        </p>



              <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                Order of events
              </h2>
                <div className="mt-3  justify-center">
                <SectionDivider />
                </div>
            </div>
      
            
      {/* Desktop: alternating cards around a centered timeline.
          Mobile: cards stack on the right of a left-side timeline. */}
      <div className="relative mt-5 md:mt-7">
        {/* Timeline */}
        <div
          aria-hidden="true"
          className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-[#D4B15F] via-[#D4B15F] to-primary md:left-1/2 md:-translate-x-1/2"
        />
      
        <div className="space-y-6 md:space-y-6">
          {settings.schedule.map((item, index) => {
            const styles =
              accentStyles[index % 2 === 0 ? "burgundy" : "navy"];
            const Icon = scheduleIcons[item.icon];
            const isLeft = index % 2 === 0;
      
            return (
              <div
                key={`${item.label}-${item.time}-${item.location}`}
                className="relative grid grid-cols-[24px_minmax(0,1fr)] items-start gap-3 md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] md:gap-3"
              >
                {/* Timeline marker */}
                <div className="relative z-10 col-start-1 mt-3 flex justify-center md:col-start-2 md:row-start-1">
                  <span className="size-2.5 rounded-full border border-[#D4B15F] bg-[#D4B15F] ring-4 ring-background" />
                </div>
      
                {/* Event card */}
                <article
                  className={[
                    "relative col-start-2 min-w-0 rounded-xl border border-[#D4B15F]/30 bg-card/5 p-4 shadow-sm transition-colors hover:border-[#D4B15F]/60",
                    "md:row-start-1",
                    isLeft
                      ? "md:col-start-1"
                      : "md:col-start-3",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-[#D4B15F] uppercase">
                    <Icon className="size-3.5 shrink-0" strokeWidth={2} />
                    <span>{item.time}</span>
                  </div>
      
                  <h3 className="mt-2 font-serif text-lg font-semibold leading-snug">
                    {item.title}
                  </h3>
      
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
      
                  <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#D4B15F]" />
                    <span className="break-words">{item.location}</span>
                  </div>
      
                  {/* Keep the alternating burgundy/navy accent */}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-4 right-4 h-px ${styles.line}`}
                  />
                </article>
      
                {/* Empty opposite column preserves true alternation */}
                <div
                  aria-hidden="true"
                  className="hidden md:block md:row-start-1"
                />
              </div>
            );
          })}
        </div>
      </div>
      
      
            <div className="mt-4 flex items-start justify-center gap-2 text-center text-sm text-muted-foreground sm:mt-5">
              <PartyPopper className="mt-0.5 size-4 shrink-0 text-[#C6A45C]" />
              <p>
                {settings.schedule[0]?.label ?? "Celebrations"} start at{" "}
                {settings.schedule[0]?.time} at{" "}
                <span className="font-medium text-foreground">
                  {settings.schedule[0]?.location}
                </span>
                .
              </p>
            </div>
          </section>
        );
      
  }