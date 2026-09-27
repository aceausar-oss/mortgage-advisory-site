# CLAUDE.md — The Mortgage Advisory: AEO Company Site + Chat Funnel

Read this whole file before writing any code. Every page, component, and feature must serve the **North Star** below. If a design choice conflicts with the North Star, the North Star wins.

---

## 1. North Star

Build TheMortgageAdvisory.com so it (1) earns credibility, (2) converts visitors into chats and booked calls, and (3) gets **cited by ChatGPT, Gemini, Perplexity, and Google AI Overviews** for mortgage questions in our licensed states.

Baseline (HubSpot AI Search Grader, Sept 2026): ChatGPT 33, Perplexity 38, Gemini 41 of 100. AI models currently **confuse us with a Go High Level CRM/SaaS vendor.** Fixing that entity confusion is job #1. **Note (Sept 2026):** those scores reflect the old LeadPops site, which is being retired when the domain is redirected to this site. Treat AEO/LLM visibility as built from scratch here, so every page must state the entity clearly from day one.

**Homepage headline (approved):** "Tap your home equity and *keep* your low rate." Mention the AI assistant as a feature below the headline, never in it (avoids reinforcing the software-company confusion).

**Entity statement — use this wording (or a close variant) on every page, in metadata, schema, and `llms.txt`:**
> The Mortgage Advisory, Inc. is a direct mortgage lender (mortgage banker) licensed in California, Texas, Florida, and Colorado, NMLS #1549739. Founded by Ace Ausar, a mortgage banker with 25+ years in real estate and lending. We offer home purchase loans, refinancing, HELOCs and home equity access, reverse mortgages (HECM and proprietary, including second-lien reverse mortgages), debt consolidation using cash-out refinances, HELOCs, or reverse mortgage seconds, and FHA, VA, conventional, and Non-QM loans.

Never describe the company as a CRM, software, SaaS, marketing agency, or Go High Level service.

---

## 2. Stack & Hosting

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Rendering:** Static generation / server rendering for ALL content. Every answer, FAQ, and page must exist as real HTML in the initial response. AI crawlers often do not run JavaScript. Interactive widgets (chat, slider, pill feed) enhance pages; they never hold the only copy of content.
- **Host:** Vercel. Domain: TheMortgageAdvisory.com (www → apex redirect or vice versa; pick one canonical).
- **Secrets:** Only in Vercel environment variables / `.env.local`. Never commit keys. Never expose keys to the browser.
- **Performance:** Lighthouse 90+ on mobile. Next/Image for all images. No layout shift.
- **Accessibility:** WCAG 2.1 AA (contrast, keyboard nav, alt text, focus states, reduced-motion support for animations).

---

## 3. Brand

**Assets** (place in `/public/brand/`):
- `logo-horizontal.png`: circle mark + "The Mortgage Advisory.com" (header, footer, OG image)
- `logo-mark.png`: circle "Advisory" mark only (favicon, chat avatar badge, mobile header)
- `ace-hero.png`: Ace, gray suit, arms crossed, transparent background (hero / About)
- `ace-portrait.png`: Ace, gray suit, head-and-shoulders (bios, schema `Person.image`)
- `ace-polo.png`: Ace, light-blue polo with logo (chat assistant avatar, "Talk to Ace" sections)

**Colors** (sampled from business card and logo; define as CSS variables / Tailwind tokens):
| Token | Hex | Use |
|---|---|---|
| `brand-blue` | `#88B4E0` | Logo blue (sampled from the M mark): map, soft backgrounds, shimmer, glows |
| `brand-blue-deep` | `#3D85CC` | Darker "M badge" blue: highlighted headline word, icons, pill outlines, topic tags (large text/graphics only) |
| `brand-button` | `#2F73B6` | Filled buttons with white text and small blue text/links (passes WCAG AA) |
| `brand-soft` | `#A7C8EA` | Filled buttons and pills with dark ink text (Ace chose this over white text, Sept 2026) |
| `brand-slate` | `#43565F` | Headings, logo text, primary buttons |
| `brand-steel` | `#87959F` | Secondary text, contact bands, borders |
| `brand-ink` | `#231F20` | Body text |
| `bg-mist` | `#F3F8FC` | Soft gradient hero background (Vora-style) |

**Type:** Montserrat (headings, matches business card) + Inter (body), via `next/font`.

**Feel:** Vora IQ's airy gradient + big chat box, Airbnb's confident slider hero, AngelAi's story sections with pill CTAs. Borrow layout and interaction patterns only. Never copy another site's text, images, logos, or colors.

---

## 4. Homepage — section by section

### 4.1 Hero (Vora IQ layout — design rank #1)
- Soft `bg-mist` gradient with a subtle blurred brand-blue shape behind the chat box.
- Top trust badge (pill): `Direct Lender · NMLS #1549739 · Licensed in CA, TX, FL, CO`.
- H1 (one line on desktop): e.g. "Get the right home loan — **answered** in minutes." (highlight one word in `brand-blue`).
- Subhead (approved): "Access cash with HELOCs, reverse mortgages, and home loans. Ask our AI mortgage assistant anything, and our team will take it from there." (The trust badge above it carries Direct Lender · NMLS · licensed states.)
- **Large chat box** (Base44/Vora size), with a typing-placeholder animation cycling real questions.
- **Quick-action chips inside the box** (Better-style): `Get pre-approved` · `Lower my rate` · `Get cash from my home` · `Reverse mortgage` · `Book a call with Ace`.
- Chat disclosure line under the box: "Chat sessions may be recorded. By using chat you agree to our Privacy Policy and Terms. Not a commitment to lend." (link both).
- **Cited stat badge** (Vora-style) below: one real, sourced housing statistic for our markets with a visible "Source: …" line. Pull from `content/data/stats.json`. **Never invent a number.** If no verified stat is in the file, hide the badge.

### 4.2 "Questions people are asking" pill feed (Vora fading pills → AngelAi question prompts)
- Vertical stack of 3–5 pills that slowly rotate/fade, each a real borrower question from the knowledge base (`featured: true`).
- Clicking a pill: sends the question into the hero chat AND the pill is a real `<a href>` to that question's Q&A page (crawlable).
- Green dot + "Asked recently" label optional; never fake timestamps.

### 4.3 Airbnb-style equity slider (MUST HAVE)
- Split layout. Left: big number headline — "Your home could unlock **$XXX,XXX**".
- Sliders/inputs: Home value, Current mortgage balance. Toggle: HELOC / Cash-out refi.
- Math (show it — this is our pricing transparency): `available = homeValue × maxCLTV − balance` (maxCLTV from `content/data/pricing.json`, default 0.80; never below 0).
- "Learn how we estimate" link → `/how-we-estimate` page explaining the formula and assumptions.
- Search-style input under slider: `[City] · Home value · Loan goal` → opens chat pre-filled.
- Reverse mortgage: show "See your reverse mortgage options" CTA into chat (do not estimate HECM principal limits on the slider).
- Right side: **SVG map of the 4 licensed states** (CA, TX, FL, CO highlighted in brand-blue) with "Licensed in these states" label. No paid map API.
- Required disclaimer under the number: "Estimate only. Not an offer or commitment to lend. Subject to credit approval, property valuation, and program guidelines."

### 4.4 AngelAi-style story sections (design rank #2) — repeat 3–4x, alternating image left/right
- Question headline ("Want lower payments?" / "Buying your first home?" / "Tapping equity in retirement?" / "Self-employed?").
- Short real client story (from `content/stories/*.md`, `consent: true` required to render), photo or video, and a **pill CTA** (icon + label + arrow) that opens the chat pre-loaded with that goal.
- Until real stories exist, render the section with educational copy only — never fabricated testimonials.

### 4.5 Tabbed Q&A boxes (AngelAi FAQ)
- Tabs: Buying (incl. FHA & VA) · Refinancing · HELOC & Equity · Debt Consolidation · Reverse Mortgage · Self-Employed / Non-QM · Costs & Pricing · About Us.
- Each item: question as heading, 1–2 sentence TL;DR answer, "Read the full answer →" link. Rendered server-side with `FAQPage` schema.

### 4.6 Booking section (humans + AI agents)
- Heading: "Book a call with Ace". Three booking types as cards → GHL calendars (see §7).
- Phone: (949) 649-4499 · Email: Ace@TheMortgageAdvisory.com.

### 4.7 Footer compliance block (see §8 — required on every page).

---

## 5. Site map

```
/                         Homepage (above)
/ask                      Full-page chat
/answers                  Q&A hub (all knowledge-base entries, filterable)
/answers/[slug]           One question per page (generated from KB)
/loans/purchase           Loan program pages (each follows the page template §6)
/loans/refinance
/loans/heloc
/loans/reverse-mortgage
/loans/fha
/loans/va
/loans/debt-consolidation  (cash-out refi, HELOC, reverse mortgage seconds)
/loans/conventional
/loans/non-qm            (bank statement, 1099, DSCR, self-employed)
/locations/california    One page per licensed state (+ key metro pages later)
/locations/texas
/locations/florida
/locations/colorado
/costs                    Pricing hub: rate scenarios + fee sheet (§9)
/how-we-estimate          Slider methodology
/book                     Booking page
/about                    Ace Ausar bio, company, credentials
/reviews                  Real reviews (with links to Google/Zillow/BBB sources)
/licensing                Full licensing & disclosures (§8)
/privacy  /terms  /accessibility  /do-not-sell (CCPA)
/llms.txt  /llms-full.txt  /sitemap.xml  /robots.txt
/api/knowledge            Public read-only KB API (§10)
/api/booking/*            Phase 2 (§7)
```

---

## 6. Page template (every content page — this is how we pass the LLM Visibility Checklist)

1. **H1 phrased as a question** people actually ask AI (e.g. "Can I get a HELOC in California if I'm self-employed?").
2. **TL;DR box** at top: 2–3 sentence direct answer that names the brand, e.g. "Yes. The Mortgage Advisory, a direct lender licensed in California (NMLS #1549739), offers HELOCs for self-employed borrowers using…"
3. H2/H3 sub-questions, **each section answers ONE thing**, leading with the answer.
4. Scannable: bullets, numbered steps, comparison tables.
5. **Real scenario** block ("A self-employed borrower in Orange County with 2 years of 1099 income…") — anonymized, never real borrower PII.
6. Persona variant where relevant (first-time buyer vs. retiree vs. investor) — different context, not just swapped titles.
7. **Voice: write the way Ace talks to a client** — plain, direct, practical, first person in "Our take". Do **not** quote or recommend regulators (no "the CFPB warns…", no "call your state regulator"), and keep warnings sparing; people don't talk that way. Cite a government source **only where the program itself is government-backed**: FHA/HUD for HECM reverse mortgages and FHA loans, VA for VA loans (and IRS only for a specific tax rule). Required legal disclosures (§8) go in the page's disclosures box, never in the body text. **Be openly transparent about costs and fees, including our own** (points, lender fees, funding fees, typical charges): cost transparency builds trust and is part of the brand.
8. Optional **"Did you know?" side pill** (`didYouKnow` in the KB frontmatter, up to 3 short fun facts with optional links): a sticky side card on desktop, inline under the TL;DR on mobile. Use it for memorable facts that correct misinformation (e.g., reverse mortgages are called "housing pensions" abroad).
8b. "Our take" — a clear position/opinion from Ace (originality pillar).
9. Author box: Ace Ausar, Mortgage Banker, NMLS #1549739, photo, "Reviewed/Updated: [date]".
10. CTA: pill to chat + book-a-call.
11. Schema: `Article` or `FAQPage` + `BreadcrumbList` + author `Person` + publisher `Organization`.
12. Unique `<title>` (≤60 chars, question or brand+topic) and meta description (≤155 chars, direct answer).

---

## 7. Booking (Go High Level = single source of truth; Google Calendar synced)

**Phase 1 (launch):** embed GHL booking widgets on `/book` and inside the chat.
| Type | Calendar ID | Public link |
|---|---|---|
| Reverse Mortgage | `8HkkWeAMaZ5lJbiZDK70` | https://api.leadconnectorhq.com/widget/bookings/reversemortgagerelief |
| HELOC / Refi (Equity Access) | `4Ah4Rs8f6GtPS2YwvIpS` | https://api.leadconnectorhq.com/widget/bookings/heloc_refi |
| Home Buyers (Purchase) | TODO — currently shares HELOC/Refi calendar; replace when a Purchase calendar exists | same as above |

Embed: `<iframe src="https://api.leadconnectorhq.com/widget/booking/{CALENDAR_ID}" style="width:100%;border:none;overflow:hidden" scrolling="no">` + `https://link.msgsndr.com/js/form_embed.js` (load with `next/script`, `strategy="lazyOnload"`).

**Phase 2 (after launch, needs `GHL_PRIVATE_TOKEN` env var):** build
- `GET /api/booking/slots?type=reverse|equity|purchase&from=&to=` → GHL free-slots endpoint
- `POST /api/booking/book` → create/update GHL contact + appointment
- Server-side only, rate-limited, input-validated, TCPA consent checkbox required, no financial PII collected at booking.
- Add `ReserveAction` schema pointing to `/book` and list endpoints in `llms.txt` and the OpenAPI spec so AI agents can find and use them.

---

## 8. Compliance (REQUIRED — direct lender / mortgage banker, licensed CA, TX, FL, CO)

> ⚠️ Items marked **[VERIFY]** must be confirmed by Ace/compliance before launch. Do not guess license numbers or regulator wording — use placeholders and fail the build check if placeholders remain in production.

**Every page footer:**
- Legal name: The Mortgage Advisory, Inc. · NMLS #1549739 · link to https://www.nmlsconsumeraccess.org (entity lookup).
- **Equal Housing Lender** logo + text "Equal Housing Lender" (direct lender — use *Lender*, not *Opportunity*). Logo must have alt text.
- Address: 999 Corporate Drive, Ste 100, Ladera Ranch, CA 92694 · (949) 649-4499.
- State licensing line, e.g. "Licensed in CA, TX, FL, CO — see Licensing & Disclosures." linking to `/licensing`.
- Links: Privacy Policy · Terms · Accessibility · Licensing · Do Not Sell or Share My Personal Information (CCPA/CPRA).
- "This is not a commitment to lend. All loans subject to credit approval, underwriting, and property valuation. Rates, terms, and programs subject to change without notice."

**`/licensing` page (state by state):**
- California: DFPI license type and number **[VERIFY: CRMLA vs. CFL license #]** with the regulator-required licensing statement.
- Texas: Texas Department of Savings and Mortgage Lending (SML) license **[VERIFY #]** + the **Texas Consumer Complaint and Recovery Fund Notice** — paste the official current text from SML exactly **[VERIFY]**.
- Florida: Office of Financial Regulation license **[VERIFY type and #]**.
- Colorado: Division of Real Estate registration/license **[VERIFY #]** + "Regulated by the Division of Real Estate" statement **[VERIFY]**.
- Store all of this in `content/data/licensing.json`; the footer, `/licensing`, schema, and `llms.txt` read from that one file.

**Advertising rules baked into components:**
- **Reg Z / Truth in Lending (trigger terms):** any displayed rate must show APR, and any triggering term (payment, down payment, number of payments, finance charge) must show the required additional terms. Rate displays use a single `<RateDisclosure>` component that requires: rate, APR, points, loan amount, term, LTV, credit score assumption, occupancy, and "as of" date/time. Block render if any field is missing.
- **HELOC ads:** include HELOC-specific disclosures (variable rate, index/margin, fees) in `<HelocDisclosure>`.
- **Reverse mortgage content:** include "This material has not been reviewed, approved, or issued by HUD, FHA, or any government agency," and borrower obligations (must pay property taxes, insurance, maintain the home; loan due when the last borrower leaves). No "free money"/"no payments ever" language.
- **Proprietary / second-lien reverse mortgages:** state clearly they are *not* FHA-insured HECMs, with the same borrower-obligation disclosures as above.
- **Debt consolidation:** never call it "debt relief," "debt settlement," or "eliminate your debt." Always disclose that it turns unsecured debt into debt secured by the home (the home is at risk if payments aren't made) and that total interest paid may increase over a longer term.
- **FHA/VA:** never imply government endorsement or affiliation (e.g., "not affiliated with or endorsed by the U.S. Department of Veterans Affairs").
- **MAP Rule / UDAAP:** no misleading claims ("lowest rates," "guaranteed approval," "no credit check") anywhere, including chat.
- **Fair lending:** no content or targeting that references protected classes in a discriminatory way; chat must answer everyone consistently.
- **TCPA:** every phone/SMS capture (chat lead capture, booking) needs an unchecked-by-default consent checkbox with clear consent language; consent is not a condition of service.
- **Privacy:** GLBA-aligned privacy policy + CCPA/CPRA notice at collection (CA). Chat disclosure line under every chat box.
- **Accessibility:** WCAG 2.1 AA statement at `/accessibility`.

---

## 9. Pricing transparency (`/costs`)

- **Sample rate scenarios** from `content/data/pricing.json`, rendered only through `<RateDisclosure>` with "as of" timestamps. Ace updates this file; **Claude Code never invents rates.** If the file is empty, show "Call or chat for today's rates" instead.
- **Fee sheet:** typical lender fees, appraisal, title/escrow ranges by state, and how our compensation works — plain language, sourced where possible.
- **Reverse mortgage cost breakdown:** upfront MIP, origination limits, servicing — cite HUD.
- FAQ block: "How much does a mortgage cost?", "What are closing costs in Texas?", etc.

---

## 10. Knowledge base + API discoverability (the engine)

**One source of truth:** `content/kb/*.md`, one file per question:
```yaml
---
question: "Can I get a HELOC in California if I'm self-employed?"
slug: heloc-california-self-employed
tldr: "Yes. ..."            # 2–3 sentences, names the brand
category: heloc              # matches FAQ tabs
states: [CA]
persona: self-employed
featured: true               # show in hero pill feed
sources: []   # only government-backed programs: FHA/HUD, VA (see §6.7)
updated: 2026-09-26
reviewed_by: "Ace Ausar, NMLS #1549739"
---
Full answer (markdown, question-format H2s)...
```

The same files generate:
- `/answers/[slug]` pages + FAQ tabs + hero pill feed
- `FAQPage` / `Article` schema
- **`/api/knowledge`** — public, read-only JSON (list, search `?q=`, filter `?category=&state=`), CORS open, cached. Includes company profile, licensing, loan programs, pricing scenarios, and booking endpoints.
- **`/openapi.json`** describing `/api/knowledge` and `/api/booking/*`; also linked from `/.well-known/`.
- **`/llms.txt`** (entity statement, key pages, API + booking endpoints) and **`/llms-full.txt`** (all KB answers as plain text).
- The chat assistant's retrieval source (§11).

**Customer-question pipeline (weekly):** call transcripts → strip ALL borrower PII → draft Q&A in the KB format → Ace reviews → commit → auto-publishes to site, chat, and API. Build a script `scripts/new-kb-entry.ts` that scaffolds a file from a pasted question.

**Phase 3 (optional):** MCP server exposing KB search and booking for AI agents.

---

## 11. Chat assistant

- Server route `/api/chat` using the Anthropic API (model from env `CHAT_MODEL`, key `ANTHROPIC_API_KEY`). Streams responses.
- Retrieval: answer ONLY from the knowledge base + licensing/pricing data files; link the matching `/answers/[slug]` page in every answer.
- Persona: friendly, plain-English guide for The Mortgage Advisory, speaking on Ace's behalf. Avatar: `ace-polo.png` + logo mark.
- Rules (system prompt): never quote a specific rate/APR outside `pricing.json` scenarios; never promise approval; no "lowest rate" claims; always offer to book with Ace; say "I'm an AI assistant" when asked; decline to collect SSN, full account numbers, or DOB in chat; stay neutral and consistent (fair lending); outside licensed states → say we're not licensed there.
- Lead capture: name, email, phone (with TCPA checkbox), goal, state → Phase 2 posts to GHL contact API; Phase 1 hands off to GHL booking embed.
- Quick-action chips map to goal presets.

---

## 12. Technical AEO checklist (build must pass all)

- [ ] `robots.txt` allows: Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, ClaudeBot, Claude-User, Google-Extended, Applebot-Extended. Links sitemap.
- [ ] `sitemap.xml` auto-generated with `lastmod`.
- [ ] Schema (JSON-LD) sitewide: `Organization` + `FinancialService`/`MortgageLender`-style `LocalBusiness` (name, NMLS in `identifier`, address, phone, `areaServed`: CA, TX, FL, CO, `sameAs`: LinkedIn, Google Business Profile, BBB, Zillow, NMLS Consumer Access), `Person` (Ace Ausar, `jobTitle` Mortgage Banker, `worksFor`), `WebSite` with `SearchAction`, `ReserveAction` for booking.
- [ ] Every page: canonical URL, unique title/description, Open Graph + Twitter image (`logo-horizontal` on brand background).
- [ ] All content server-rendered; test with JavaScript disabled — every answer must still be readable.
- [ ] Google Search Console: **Domain property** verified via DNS TXT at the registrar; sitemap submitted.
- [ ] Bing Webmaster Tools verified (import from GSC); IndexNow key file + ping on publish.
- [ ] Google Business Profile, BBB, LinkedIn company page all use the same entity statement, NMLS, address, phone (NAP consistency).
- [ ] GA4 + conversion events: chat_started, chip_clicked, slider_used, booking_started, booking_completed.
- [ ] No placeholder `[VERIFY]` or `TODO` text in production (add a build-time check).

---

## 13. Build order (Claude Code)

1. Scaffold Next.js + Tailwind + brand tokens + fonts + `/public/brand` assets; header/footer with full compliance block.
2. Knowledge base loader + `/answers` pages + FAQ tabs + schema + `llms.txt` + `robots.txt` + sitemap.
3. Homepage: hero chat box + chips + pill feed + equity slider + state map + story sections + booking section.
4. `/api/chat` with KB retrieval and guardrails; wire chips, pills, slider, and story CTAs into it.
5. Loan, location, `/costs`, `/about`, `/licensing`, legal pages from the page template.
6. `/api/knowledge` + `/openapi.json`; deploy to Vercel; connect domain; GSC + Bing verification.
7. Phase 2: GHL booking API + lead capture. Phase 3: MCP server.

After each step: run the site with JavaScript disabled, validate schema (Google Rich Results Test / Schema.org validator), and check against §6 and §12.

---

## 14. Open items (fill before launch)
- [ ] State license numbers + exact regulator wording (CA, TX, FL, CO) → `content/data/licensing.json`
- [ ] Purchase calendar ID (or confirm sharing HELOC/Refi calendar)
- [ ] 2–4 client stories with written consent → `content/stories/`
- [ ] Real sourced stats → `content/data/stats.json`; current rate scenarios → `content/data/pricing.json`
- [ ] Profile URLs for `sameAs` (LinkedIn, Google Business Profile, BBB, Zillow, reviews)
- [ ] GHL Private Integration token (Phase 2) — env var only
