
import { Check, Copy, Gift, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GiftContributionProps = {
  phoneNumber?: string;
  reference?: string;
};

export function GiftContribution({
  phoneNumber = "0728 258 654",
  reference = "Elvin & Eric",
}: GiftContributionProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const steps = [
    "Go to M-PESA → Send Money",
    `Enter number: ${phoneNumber}`,
    "Enter your gift or donation amount",
    "Confirm and send",
  ];

  async function copyNumber() {
    const number = phoneNumber.replace(/\s/g, "");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(number);
      setCopied(true);

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => {
        setCopied(false);
        resetTimer.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-labelledby="gift-contribution-title"
      className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-2">
        <Gift
          aria-hidden="true"
          className="size-4 text-primary"
        />
        <h3
          id="gift-contribution-title"
          className="font-serif text-xl"
        >
          Gift Donation
        </h3>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Bless the couple with a token of love via M-PESA.
      </p>

      <div className="mt-5 rounded-xl border border-border bg-muted/50 px-4 py-5 text-center">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-primary uppercase">
          M-PESA Send Money To
        </p>

        <p className="mt-3 break-words font-serif text-2xl font-bold tracking-[0.08em] text-primary sm:text-3xl sm:tracking-[0.12em]">
          {phoneNumber}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Reference:{" "}
          <span className="font-medium text-foreground">
            {reference}
          </span>
        </p>

        <button
          type="button"
          onClick={copyNumber}
          aria-label={
            copied ? "M-PESA number copied" : "Copy M-PESA number"
          }
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {copied ? (
            <>
              <Check aria-hidden="true" className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden="true" className="size-3.5" />
              Copy number
            </>
          )}
        </button>

        <p className="sr-only" role="status" aria-live="polite">
          {copied ? "M-PESA number copied to clipboard." : ""}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Steps to send
        </p>

        <ol className="mt-3 space-y-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 text-xs text-muted-foreground"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {index + 1}
              </span>

              <span className="min-w-0 pt-0.5 leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] italic text-muted-foreground">
        <Smartphone
          aria-hidden="true"
          className="size-3 shrink-0"
        />
        Your generosity means the world to us.
      </p>
    </section>
  );
}
