// Answers that have a Spanish twin in content/es/kb/ (rendered at /es/answers/[slug]). Kept as a plain list so the
// language toggle and proxy (which can't read the file system) know which answer pages exist in Spanish.
// The kb loader checks this list against content/es/kb/ at build time.
export const ES_ANSWER_SLUGS = ["can-you-lose-your-home-with-a-reverse-mortgage"] as const;
