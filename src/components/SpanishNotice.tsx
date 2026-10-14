"use client";

import { useEffect, useState } from "react";
import { LANG_COOKIE } from "@/lib/i18n";

// On English pages: if the visitor chose Spanish earlier, say this page is English only and point back to the Spanish
// site. (English pages that have a Spanish version never show this; src/proxy.ts sends those visitors there first.)
export function SpanishNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Read once after load: the cookie only exists in the visitor's browser, so this can't run on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(document.cookie.split("; ").includes(`${LANG_COOKIE}=es`));
  }, []);
  if (!show) return null;
  return (
    <div lang="es" className="border-b border-brand-blue/40 bg-mist px-4 py-2 text-center text-sm text-brand-ink sm:px-6">
      Esta página solo está disponible en inglés por ahora.{" "}
      <a href="/es" className="font-semibold text-brand-button underline underline-offset-4">
        Volver al sitio en español
      </a>{" "}
      ·{" "}
      <a href="/es/book" className="font-semibold text-brand-button underline underline-offset-4">
        Hablar con un asesor en español
      </a>
    </div>
  );
}
