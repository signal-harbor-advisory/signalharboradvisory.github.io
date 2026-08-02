/**
 * Central site configuration.
 *
 * PLACEHOLDER INVENTORY — items required before launch:
 *   analyticsId        → configure after analytics platform decision
 *
 * Values marked TODO_PLACEHOLDER must not appear in any public-facing text.
 * They are rendered as inert elements in local review only.
 */

export const SITE = {
  /** Confirmed production domain */
  url: 'https://signalharboradvisory.com',

  /** Public-facing website brand / organization identity — use for site titles, footer masthead, metadata publisher and social preview branding */
  orgName: 'Signal Harbor Advisory',

  /** The named advisor — use for biography, authorship, contact and advisor-identification contexts */
  name: 'Arun Arunachalam',
  descriptor: 'Executive Technology Advisor',

  /** Four positioning pillars — appears in footer and OG image */
  positioningLine: 'Capital Markets · AI Transformation · Platform Modernization · Engineering Leadership',

  /** Approved public location — do not make more specific */
  location: 'New York Metropolitan Area · Select US and global engagements',
  locationShort: 'New York Metropolitan Area',

  /** Primary CTA label used throughout the site */
  primaryCta: 'Discuss an Advisory Need',

  /**
   * LinkedIn URL — TODO: supply confirmed URL before launch.
   * All links render with data-placeholder="true" when this equals '#LINKEDIN_URL_TBD'
   * so local review works without navigating to an invented address.
   */
  linkedInUrl: 'https://www.linkedin.com/in/arunarunachalam75',

  /**
   * Professional inquiry email — fallback contact path shown in the
   * form's failure state when the Worker submission fails.
   */
  professionalEmail: 'inquiries@signalharboradvisory.com',

  /**
   * Inquiry form submission endpoint — Cloudflare Worker.
   * The Worker itself owns Resend delivery, validation, rate limiting
   * and Turnstile secret-key verification; none of that lives in this
   * static site. Empty string would fall back to local simulation mode
   * in form.ts, but this is now always set to the real endpoint.
   */
  formEndpoint: 'https://signal-harbor-contact.asnarun75.workers.dev/submit',

  /**
   * Cloudflare Turnstile PUBLIC site key — supplied at build time via the
   * PUBLIC_TURNSTILE_SITE_KEY environment variable (set as a GitHub Actions
   * repository variable, not committed). Never put the Turnstile SECRET
   * key here or anywhere in this repository — it belongs only in the
   * Cloudflare Worker's own environment.
   * Empty string = Turnstile widget not rendered (e.g. local dev without
   * the env var set) and the token check is skipped.
   */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',

  /**
   * Analytics measurement ID — TODO Phase 5 after analytics platform decision.
   * Empty string = analytics script not injected.
   */
  analyticsId: '',
} as const;

/** True when a LinkedIn URL has been confirmed and supplied */
export const hasLinkedIn = (SITE.linkedInUrl as string) !== '#LINKEDIN_URL_TBD';

/** True when a professional email has been confirmed and supplied */
export const hasProfessionalEmail = (SITE.professionalEmail as string) !== '';

/** True when the form endpoint is configured for real submission */
export const hasFormEndpoint = (SITE.formEndpoint as string) !== '';

/** True when a Turnstile site key has been supplied at build time */
export const hasTurnstile = SITE.turnstileSiteKey !== '';
