// Free reverse mortgage guide (lead magnet, Ace Oct 2026). Sign-ups go to Go High Level through an Inbound Webhook
// workflow (GHL_GUIDE_WEBHOOK_URL, server only). The popup and sign-up box only show on the live site once that is set;
// on test links they always show, and sign-ups there are accepted without being sent anywhere.
export const GUIDE_PDF = { en: "/guides/reverse-mortgage-guide.pdf", es: "/guides/guia-hipoteca-inversa.pdf" } as const;

export const guideEnabled = () => !!process.env.GHL_GUIDE_WEBHOOK_URL || process.env.VERCEL_ENV !== "production";
