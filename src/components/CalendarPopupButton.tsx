"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// A single "book" button that opens one Go High Level calendar in the same full-screen window as /book (BookingPicker):
// full screen on phones, a large centered window on desktop. Used on /pros for the Financial Pro calendar (Ace, Nov 2026).
// Without JavaScript the button is a plain link to the Go High Level booking page.
// hashKey (optional): /pros#<hashKey> opens this calendar on load, so a LinkedIn post can link straight to it.
// Give it to only one button per page.
export function CalendarPopupButton({
  label,
  title,
  url,
  embedUrl,
  className,
  hashKey,
}: {
  label: string;
  title: string;
  url: string;
  embedUrl: string;
  className?: string;
  hashKey?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    if (hashKey && window.location.hash === `#${hashKey}`) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [hashKey]);

  useEffect(() => {
    if (!hashKey) return;
    const fromHash = () => {
      if (window.location.hash === `#${hashKey}`) setIsOpen(true);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [hashKey]);

  // Show or hide the window, and stop the page behind it from scrolling.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className={className}
      >
        {label}
      </a>
      <dialog
        ref={dialog}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialog.current) close(); // click on the dimmed backdrop
        }}
        aria-label={`${title}: pick a time`}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-white p-0 backdrop:bg-black/50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(calc(100dvh-2rem),900px)] sm:w-[min(calc(100vw-2rem),1100px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {isOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-brand-steel/30 px-4 py-2 sm:px-6">
              <p className="font-heading text-base font-semibold text-brand-slate sm:text-lg">{title}: pick a time</p>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-steel/40 text-2xl leading-none text-brand-ink hover:bg-mist"
              >
                ×
              </button>
            </div>
            {/* aria-label instead of title: a title shows as a hover tooltip over the calendar. */}
            <iframe src={embedUrl} aria-label={`Book a ${title}`} className="min-h-0 w-full flex-1 border-0" />
          </div>
        )}
      </dialog>
    </>
  );
}
