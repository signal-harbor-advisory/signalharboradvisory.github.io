/**
 * Central site configuration.
 *
 * PLACEHOLDER INVENTORY — items required before launch:
 *   professionalEmail  → supply professional inquiry email address
 *   formEndpoint       → configure in Phase 5 (Resend API route)
 *   turnstileSiteKey   → configure in Phase 5 (Cloudflare Turnstile)
 *   analyticsId        → configure in Phase 5 after analytics decision
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
   * Professional inquiry email — TODO: supply before launch.
   * Used only in the form failure state as a fallback contact path.
   * Empty string = failure state omits the email link (acceptable locally).
   */
  professionalEmail: '',

  /**
   * Form submission endpoint — TODO Phase 5: set to Resend API route.
   * Empty string triggers local simulation mode in form.ts.
   *
   * PRODUCTION BOUNDARY
   * When formEndpoint is non-empty the form posts JSON to this URL.
   * Required server-side:
   *   - RESEND_API_KEY environment variable
   *   - Input validation and sanitization
   *   - Rate limiting
   *   - No confidential content in logs
   *   - Secure response (never echo submission back to client)
   */
  formEndpoint: '',

  /**
   * Cloudflare Turnstile site key — TODO Phase 5.
   * Empty string = Turnstile widget not rendered locally.
   */
  turnstileSiteKey: '',

  /**
   * Analytics measurement ID — TODO Phase 5 after analytics platform decision.
   * Empty string = analytics script not injected.
   */
  analyticsId: '',
} as const;

/** True when a LinkedIn URL has been confirmed and supplied */
export const hasLinkedIn = (SITE.linkedInUrl as string) !== '#LINKEDIN_URL_TBD';

/** True when a professional email has been confirmed and supplied */
export const hasProfessionalEmail = SITE.professionalEmail !== '';

/** True when the form endpoint is configured for real submission */
export const hasFormEndpoint = SITE.formEndpoint !== '';
