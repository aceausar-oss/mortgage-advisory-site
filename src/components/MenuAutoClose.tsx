"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Drop inside a <details> menu: closes it when a link inside is tapped, when tapping outside it, on scroll, on Escape,
// and when the page changes (Ace, Oct 2026: menus should close on their own). Without JavaScript the <details> still
// opens and closes with its own button.
export function MenuAutoClose() {
  const marker = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const menu = marker.current?.closest("details");
    if (menu) menu.open = false;
  }, [pathname]);

  useEffect(() => {
    const menu = marker.current?.closest("details");
    if (!menu) return;
    const close = () => {
      if (menu.open) menu.open = false;
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest("a")) close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!menu.contains(e.target as Node)) close();
    };
    let startY = 0;
    const onToggle = () => (startY = window.scrollY);
    const onScroll = () => {
      if (menu.open && Math.abs(window.scrollY - startY) > 40) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    menu.addEventListener("click", onClick);
    menu.addEventListener("toggle", onToggle);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      menu.removeEventListener("click", onClick);
      menu.removeEventListener("toggle", onToggle);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return <span ref={marker} hidden />;
}
