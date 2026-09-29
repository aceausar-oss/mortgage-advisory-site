"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Photo that drifts slower than the page inside its (rounded) frame. The image is taller than the frame and is
// nudged up/down as the frame crosses the screen. Only runs while visible; stays still for reduced motion.
export function ParallaxImage({
  src,
  alt,
  sizes,
  className = "",
  strength = 0.12, // share of the frame height the photo can travel either way
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  strength?: number;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    const img = layer.current;
    if (!el || !img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 when the frame is just below the screen, +1 when just above it.
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)));
      img.style.transform = `translate3d(0, ${(p * strength * r.height).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) update();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div ref={layer} className="absolute inset-x-0 will-change-transform" style={{ top: `-${strength * 100}%`, bottom: `-${strength * 100}%` }}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-[50%_65%]" />
      </div>
    </div>
  );
}
