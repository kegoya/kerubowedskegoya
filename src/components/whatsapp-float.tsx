
import { useState } from "react";

type WhatsAppFloatProps = {
  groupLink: string;
  number?: string;
};

export function WhatsAppFloat({ groupLink, number }: WhatsAppFloatProps) {
  const [showMessage, setShowMessage] = useState(true);

  const href = groupLink
    ? groupLink
    : number
      ? `https://wa.me/${number.replace(/\D/g, "")}`
      : "#";

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex items-center gap-3 sm:bottom-7 sm:right-7">
      {/* Popping message */}
      {showMessage && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-pop relative rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#172033] shadow-xl ring-1 ring-black/5 transition hover:-translate-y-1"
        >
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="size-2 rounded-full bg-[#25D366]" />
            Join WhatsApp Group
          </span>

          {/* Bubble pointer */}
          <span className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rotate-45 bg-white" />
        </a>
      )}

      {/* WhatsApp floating button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our wedding WhatsApp group"
        title="Join WhatsApp Group"
        onMouseEnter={() => setShowMessage(true)}
        className="whatsapp-float-pulse relative flex size-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition duration-300 hover:scale-110 hover:bg-[#1FBD5B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:size-16"
      >
        {/* WhatsApp logo */}
        <svg
          viewBox="0 0 32 32"
          className="size-8 sm:size-9"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.04 3C8.87 3 3.04 8.76 3.04 15.85c0 2.27.6 4.49 1.74 6.43L3 29l6.92-1.8a13.1 13.1 0 0 0 6.12 1.52h.01c7.16 0 13-5.76 13-12.85 0-3.44-1.36-6.67-3.83-9.1A12.97 12.97 0 0 0 16.04 3Zm0 23.54h-.01a10.9 10.9 0 0 1-5.47-1.47l-.39-.23-4.1 1.07 1.1-3.98-.26-.41a10.56 10.56 0 0 1-1.63-5.67c0-5.9 4.83-10.7 10.77-10.7 2.87 0 5.57 1.11 7.6 3.13a10.57 10.57 0 0 1 3.16 7.57c0 5.9-4.83 10.69-10.77 10.69Zm5.91-8.01c-.32-.16-1.9-.93-2.2-1.03-.3-.11-.52-.16-.74.16-.22.32-.85 1.03-1.04 1.24-.19.22-.38.24-.7.08-.33-.16-1.38-.5-2.63-1.6-.97-.85-1.62-1.9-1.81-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.49-.57.16-.19.22-.32.33-.54.11-.21.05-.4-.03-.56-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.1-1.14 2.68 0 1.59 1.17 3.12 1.33 3.34.16.21 2.3 3.48 5.57 4.87.78.33 1.39.53 1.86.68.78.24 1.49.21 2.05.13.63-.1 1.9-.77 2.17-1.52.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.62-.38Z" />
        </svg>

        {/* Small online indicator */}
        <span className="absolute right-0 top-0 size-3.5 rounded-full border-2 border-white bg-[#D4B15F]" />
      </a>
    </div>
  );
}
