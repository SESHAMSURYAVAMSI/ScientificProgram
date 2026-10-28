
/**
 * Public conference URL:
 *   /public/<event-slug>
 *
 * Reuses the existing public agenda page so Schedule, Faculty, and Ask a
 * Question remain consistent across both /agenda/<slug> and /public/<slug>.
 */

export { default } from "@/app/agenda/[slug]/page";
