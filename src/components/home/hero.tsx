
import { DEFAULT_SITE_SETTINGS } from "#/server/site";
import { cn } from "cn";
import { ChevronDown, Heart, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { SectionDivider } from "./section-divider";
import type { HeroProps } from "./types";

export function Hero({
    settings,
    onRsvp,
    onViewProgramme,
}: HeroProps) {
    const heroImage =
        settings.heroImage || DEFAULT_SITE_SETTINGS.heroImage;

    return (
        <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0b1023] px-5 py-16 text-center sm:px-8 sm:py-20">
            {/* Blurred background fills the entire hero */}
            <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
            />

            {/* Main photograph */}
            <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                
className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[center_30%] sm:object-[center_20%] lg:object-[center_8%]"

            />

            {/* Cinematic overlay for legibility */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,10,29,0.48)_0%,rgba(9,10,29,0.30)_35%,rgba(9,10,29,0.58)_72%,rgba(9,10,29,0.88)_100%)]"
            />

            {/* Soft burgundy ambient accents */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[26rem] rounded-full border border-rose-200/10"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[30rem] rounded-full border border-amber-100/10"
            />

            {/* Hero content */}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
                <p className="text-[15px] font-medium uppercase tracking-[0.28em] text-white sm:text-xs sm:tracking-[0.4em] md:text-sm">
                    {settings.introTagline}
                </p>

                
                    <h1
                        className={cn(
                            "mt-5 flex max-w-full flex-col items-center font-serif text-5xl font-medium leading-[1.08] tracking-[-0.045em] text-white text-balance sm:flex-row sm:justify-center sm:text-7xl md:text-8xl lg:text-8xl",
                        )}
                    >
                        <span>{settings.partnerA}</span>

                        <span className="my-1 inline-block font-light italic text-primary sm:mx-4 sm:my-0">
                            &amp;
                        </span>

                        <span>{settings.partnerB}</span>
                    </h1>


                <div className="mt-5">
                    <SectionDivider />
                </div>

                <p className="mt-5 max-w-3xl font-serif text-[10px] italic uppercase leading-7 tracking-[0.22em] text-white/90 sm:text-3xl sm:tracking-[0.32em] md:text-3xl">
                    {settings.introSubtitle}
                </p>

                <p className="mt-5 font-serif text-3xl font-semibold tracking-tight text-white sm:mt-6 sm:text-4xl md:text-5xl">
                    {settings.dateLabel}
                </p>

                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-white/80 sm:text-base">
                    <MapPin
                        className="size-4 shrink-0 text-[#e8b9c3]"
                        strokeWidth={1.8}
                    />
                    {settings.location}
                </p>

                <div className="mt-7 flex w-full max-w-sm flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:max-w-none sm:justify-center">
                    <Button
                        size="lg"
                        className="h-12 w-full rounded-full border border-rose-200/20 bg-primary px-8 text-sm font-medium text-white shadow-[0_8px_30px_rgba(120,15,49,0.28)] transition hover:bg-primary sm:w-auto"
                        onClick={onRsvp}
                    >
                        <Heart className="size-4 fill-current" />
                        RSVP Now
                    </Button>

                    <Button
                        
                        size="lg"
                        className="h-12 w-full rounded-full border-white/45 bg-secondary px-8 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white hover:bg-secondary/15 hover:text-white sm:w-auto"
                        onClick={onViewProgramme}
                    >
                        View Programme
                    </Button>
                </div>

                <div className="mt-9 flex flex-col items-center gap-2 text-gold sm:mt-12">
                    <span className="text-[18px] font-medium uppercase tracking-[0.24em] sm:text-[20px] sm:tracking-[0.3em]">
                        Scroll to discover
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className="size-4 animate-bounce"
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </section>
    );
}