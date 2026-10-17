import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, SPANISH_PATHS, toEs } from "@/lib/i18n";

// Remembers the visitor's language (Ace, Oct 2026). Visiting any /es page saves "es"; the English button on Spanish
// pages links with ?lang=en, which saves "en". A visitor who chose Spanish and then opens an English page that has a
// Spanish twin (a shared link, a link inside an English answer) is sent to the Spanish page. Search engines and AI
// crawlers don't keep cookies, so they always get the page they asked for. Pages stay static: this runs before them.
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const saved = request.cookies.get(LANG_COOKIE)?.value;
  const remember = (res: NextResponse, lang: "en" | "es") => {
    if (saved !== lang) res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: YEAR, sameSite: "lax" });
    return res;
  };

  if (pathname === "/es" || pathname.startsWith("/es/")) return remember(NextResponse.next(), "es");

  // Chose English with the header button: save it, then show the clean address.
  if (searchParams.get("lang") === "en") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    return remember(NextResponse.redirect(url, 307), "en");
  }

  if (saved === "es" && SPANISH_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = toEs(pathname);
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

// Only pages that exist in both languages (constants, as Next.js requires).
export const config = {
  matcher: ["/", "/ask", "/book", "/qualify", "/pre-approval", "/loans/:slug", "/es", "/es/:path*"],
};
