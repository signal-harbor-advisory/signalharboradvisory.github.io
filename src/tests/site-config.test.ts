/**
 * site-config.test.ts
 * Validates the shape and placeholder logic of src/config/site.ts.
 */

import { describe, it, expect } from 'vitest';

// Import the config values we want to validate.
// Vitest runs in Node, so we import the TS module directly.
import { SITE, hasLinkedIn, hasProfessionalEmail, hasFormEndpoint, hasTurnstile } from '../config/site.ts';

describe('SITE config shape', () => {
  it('has a name string', () => {
    expect(typeof SITE.name).toBe('string');
    expect(SITE.name.length).toBeGreaterThan(0);
  });

  it('has a descriptor string', () => {
    expect(typeof SITE.descriptor).toBe('string');
    expect(SITE.descriptor.length).toBeGreaterThan(0);
  });

  it('has a positioningLine string', () => {
    expect(typeof SITE.positioningLine).toBe('string');
    expect(SITE.positioningLine.length).toBeGreaterThan(0);
  });

  it('has a location string', () => {
    expect(typeof SITE.location).toBe('string');
    expect(SITE.location.length).toBeGreaterThan(0);
  });

  it('has a primaryCta string', () => {
    expect(typeof SITE.primaryCta).toBe('string');
    expect(SITE.primaryCta.length).toBeGreaterThan(0);
  });
});

describe('SITE placeholder detection', () => {
  it('linkedInUrl is a string', () => {
    expect(typeof SITE.linkedInUrl).toBe('string');
  });

  it('hasLinkedIn is true when a real URL is configured, false for the placeholder sentinel', () => {
    if (hasLinkedIn) {
      expect(SITE.linkedInUrl).toMatch(/^https:\/\//);
    } else {
      expect(SITE.linkedInUrl).toBe('#LINKEDIN_URL_TBD');
    }
  });

  it('hasProfessionalEmail is true iff professionalEmail is a non-empty string', () => {
    expect(typeof hasProfessionalEmail).toBe('boolean');
    expect(hasProfessionalEmail).toBe((SITE.professionalEmail as string).length > 0);
  });

  it('hasFormEndpoint is true iff formEndpoint is a non-empty string', () => {
    expect(typeof hasFormEndpoint).toBe('boolean');
    expect(hasFormEndpoint).toBe((SITE.formEndpoint as string).length > 0);
  });

  it('when formEndpoint is configured it is a real https URL', () => {
    if (hasFormEndpoint) {
      expect(SITE.formEndpoint).toMatch(/^https:\/\//);
    }
  });

  it('hasTurnstile is true iff turnstileSiteKey is a non-empty string', () => {
    expect(typeof hasTurnstile).toBe('boolean');
    expect(hasTurnstile).toBe(SITE.turnstileSiteKey.length > 0);
  });
});

describe('SITE url placeholder awareness', () => {
  it('url is a string', () => {
    expect(typeof SITE.url).toBe('string');
  });

  it('url is either a valid https URL or the TBD placeholder', () => {
    const url = SITE.url as string;
    const validUrl = url.startsWith('https://') && url !== 'https://DOMAIN_TBD';
    const placeholder = url === 'https://DOMAIN_TBD';
    expect(validUrl || placeholder).toBe(true);
  });
});
