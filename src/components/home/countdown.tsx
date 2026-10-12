import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionDivider } from "./section-divider";
import type { HomeSectionProps } from "./types";


export function Countdown({ settings }: HomeSectionProps) {

    
    type TimeLeft = {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
    
    function getTimeLeft(target: Date = new Date()): TimeLeft {
        const totalSeconds = Math.max(
            0,
            Math.floor((target.getTime() - Date.now()) / 1000),
        );
        return {
            days: Math.floor(totalSeconds / 86400),
            hours: Math.floor((totalSeconds % 86400) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60,
        };
    }
    
    const countdownUnits: { label: string; key: keyof TimeLeft }[] = [
        { label: "Days", key: "days" },
        { label: "Hours", key: "hours" },
        { label: "Minutes", key: "minutes" },
        { label: "Seconds", key: "seconds" },
    ];
  
    const target = useMemo(
        () => new Date(settings.countdownTarget),
        [settings.countdownTarget],
    );
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
        return () => clearInterval(timer);
    }, [target]);

    const expired =
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0;

    return (
        <section className="mx-auto max-w-4xl px-3 pb-3 sm:pb-6">
            <div className="text-center">
                

                <p className="font-serif text-2xl italic text-primary  font-semibold tracking-[0.35em] uppercase">
                Counting down
                        </p>




                <h2 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                    {expired ? "We said I do" : "Until we say I do"}
                </h2>
                <div className="mt-3">
                  <SectionDivider />
                </div>
            </div>

            {expired ? (
                <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                    <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
                        <Heart className="size-7 fill-current" strokeWidth={1.5} />
                    </span>
                    <h3 className="font-serif text-3xl">We&rsquo;re married!</h3>
                    <p className="max-w-sm leading-relaxed text-muted-foreground">
                        Thank you for celebrating {settings.partnerA} &amp;{" "}
                        {settings.partnerB} on {settings.dateLabel} in {settings.location}.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {countdownUnits.map((unit) => (
                        <div
                            key={unit.key}
                            className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 text-center shadow-sm"
                        >
                            <span
                                aria-hidden
                                className="absolute inset-y-0 left-0 w-1 bg-secondary"
                            />
                            <p className="font-serif text-5xl font-semibold tabular-nums text-primary sm:text-6xl">
                                {String(timeLeft[unit.key]).padStart(2, "0")}
                            </p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary ">
                                {unit.label}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
