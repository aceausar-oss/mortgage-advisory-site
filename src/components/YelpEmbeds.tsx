"use client";

import { useEffect } from "react";

// Loads Yelp's official review-embed script (Ace, Nov 2026) only when the reviews come near the screen, so the
// homepage stays fast. The script turns each <span class="yelp-review"> into Yelp's own review box; without it,
// the span's text link to the review on Yelp still works.
export function YelpEmbedLoader({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const load = () => {
      if (document.querySelector('script[data-yelp-embed]')) return;
      const s = document.createElement("script");
      s.src = "https://www.yelp.com/embed/widgets.js";
      s.async = true;
      s.dataset.yelpEmbed = "1";
      document.body.appendChild(s);
    };
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && (load(), io.disconnect()), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);
  return null;
}
