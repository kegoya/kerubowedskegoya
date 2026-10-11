import { DEFAULT_SITE_SETTINGS } from "#/server/site";
import { cn } from "cn";
import { Heart, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import type { HeroProps } from "./types";
import { SectionDivider } from "./section-divider";

export function Hero({ settings,onRsvp,
    onViewProgramme, }: HeroProps) {
  
    const heroImage = settings.heroImage || DEFAULT_SITE_SETTINGS.heroImage;

    
    return (
        <section className="relative flex min-h-dvh flex-col items-center overflow-hidden px-4 pt-24 pb-14 text-center sm:justify-center sm:pt-0 sm:pb-0">
            <img
                src={heroImage}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
            />
            <img
                src={heroImage}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain opacity-70"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 bg-black/50 md:bg-black/30"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 -right-40 size-[28rem] rounded-full border border-primary/10"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -bottom-48 -left-48 size-[32rem] rounded-full border border-secondary/10"
            />

            <div className="relative z-20 flex flex-col items-center">
            
                <p className="font-serif text-2xl italic font-semibold tracking-[0.35em] uppercase">
                {settings.introTagline}
                        </p>


                <h1
                    className={cn(
                        "mt-3 font-serif leading-none tracking-tight text-primary text-5xl text-balance md:text-7xl md:whitespace-nowrap lg:text-8xl",
                    )}
                >
                    {settings.partnerA}{" "}
                    <span className="text-secondary italic">&amp;</span>{" "}
                    {settings.partnerB}
                </h1>

                <div className="mt-3">
                                  <SectionDivider />
                                </div>
               
                    
                
                <p className="font-serif mt-4 text-muted-foreground text-2xl italic font-semibold tracking-[0.35em] uppercase">
                {settings.introSubtitle}
                        </p>

                <p className="mt-3 font-serif text-5xl font-bold text-secondary sm:text-6xl">
                    {settings.dateLabel}
                </p>
                <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-5 text-primary" strokeWidth={1.75} />
                    {settings.location}
                </p>

                <Button
                    size="lg"
                    className="mt-5 h-12 rounded-full px-10 text-base shadow-lg"
                    onClick={onRsvp}
                >
                    <Heart className="fill-current" />
                    RSVP Now
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    className="mt-2 h-12 rounded-full px-10 text-base shadow-lg"
                    onClick={onViewProgramme}
                >
                    VIEW PROGRAMME
                </Button>

                <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Scroll to see the celebration
                </p>
            </div>
        </section>
    );
}