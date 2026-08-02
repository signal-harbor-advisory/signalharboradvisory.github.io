/**
 * form.ts
 * Inquiry form — client-side state machine.
 *
 * States: idle → submitting → success | failure
 *
 * Submits to the Cloudflare Worker at SITE.formEndpoint. The Worker owns
 * Resend delivery, server-side validation, rate limiting and Turnstile
 * secret-key verification — none of that lives in this static site.
 *
 * Local/preview aid: add ?preview=failure to the /contact URL to force
 * the failure state without calling the Worker.
 */
import { SITE, hasTurnstile } from '../config/site';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
    onSignalHarborTurnstileLoad?: () => void;
  }
}

type FormState = 'idle' | 'submitting' | 'success' | 'failure';

interface InquiryPayload {
  name: string;
  email: string;
  organization: string;
  message: string;
  website: string;
  turnstileToken: string;
}

let turnstileToken = '';
let turnstileWidgetId: string | undefined;

function initInquiryForm() {
  const form     = document.getElementById('inquiry-form')  as HTMLFormElement | null;
  const submitBtn= document.getElementById('form-submit')   as HTMLButtonElement | null;
  const statuses = {
    idle:       document.getElementById('form-state-idle'),
    submitting: document.getElementById('form-state-submitting'),
    success:    document.getElementById('form-state-success'),
    failure:    document.getElementById('form-state-failure'),
  };

  if (!form || !submitBtn) return;

  // Capture non-nullable references for closures.
  // TypeScript cannot narrow outer-scope const to non-null across closure boundaries.
  const _form      = form      as HTMLFormElement;
  const _submitBtn = submitBtn as HTMLButtonElement;

  // Determine if we should simulate failure (local/preview QA aid)
  const previewFailure =
    new URLSearchParams(window.location.search).get('preview') === 'failure';

  // Any explicit ?preview=... param marks an intentional testing visit,
  // not a real prospective client filling out the form.
  const isExplicitPreview = new URLSearchParams(window.location.search).has('preview');
  const isTestingContext = import.meta.env.DEV || isExplicitPreview;

  // PRODUCTION SAFEGUARD: the Worker requires a valid Turnstile token and
  // will reject any submission without one. If this build somehow doesn't
  // have Turnstile configured (hasTurnstile false) and we're not in a
  // local-dev or explicit-preview testing context, do not let visitors
  // attempt a submission that is guaranteed to fail server-side — disable
  // the button up front and point them to the direct email fallback
  // instead of a silent/late failure after they've filled out the form.
  const submissionBlocked = !hasTurnstile && !isTestingContext;

  if (submissionBlocked) {
    _submitBtn.disabled = true;
    _submitBtn.setAttribute('aria-disabled', 'true');
    document.getElementById('submission-unavailable-notice')?.removeAttribute('hidden');
  }

  let currentState: FormState = 'idle';

  function setState(next: FormState) {
    currentState = next;

    // Show the correct state panel
    (Object.keys(statuses) as FormState[]).forEach((key) => {
      const el = statuses[key];
      if (!el) return;
      const isActive = key === next;
      el.hidden = !isActive;
      el.setAttribute('aria-hidden', String(!isActive));
    });

    // Manage form interactivity
    if (next === 'submitting') {
      setFormDisabled(true);
      _submitBtn.textContent = 'Sending…';
      _submitBtn.setAttribute('aria-busy', 'true');
    } else if (next === 'idle') {
      setFormDisabled(false);
      _submitBtn.textContent = 'Send Inquiry';
      _submitBtn.removeAttribute('aria-busy');
    }

    // Announce state to screen readers
    const announcer = document.getElementById('form-announcer');
    if (announcer) {
      announcer.textContent = {
        idle:       '',
        submitting: 'Sending your inquiry…',
        success:    'Your inquiry has been received.',
        failure:    'Your inquiry could not be sent. Please try again.',
      }[next];
    }

    // Move focus to the new content region
    if (next === 'success') {
      statuses.success?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
    } else if (next === 'failure') {
      statuses.failure?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
    }
  }

  function setFormDisabled(disabled: boolean) {
    const controls = _form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>(
      'input, select, textarea, button'
    );
    controls.forEach((el) => { el.disabled = disabled; });
  }

  // ── Turnstile ──────────────────────────────────────────────────────────
  // The widget only exists in the DOM when hasTurnstile is true (see
  // InquiryForm.astro). window.onSignalHarborTurnstileLoad is called by
  // Cloudflare's script once it has loaded, via the ?onload= callback param.
  const turnstileContainer = document.getElementById('turnstile-widget');

  if (hasTurnstile && turnstileContainer) {
    window.onSignalHarborTurnstileLoad = function () {
      if (!window.turnstile) return;
      turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: SITE.turnstileSiteKey,
        callback: (token: string) => {
          turnstileToken = token;
          clearTurnstileError();
        },
        'expired-callback': () => {
          turnstileToken = '';
        },
        'error-callback': () => {
          turnstileToken = '';
        },
      });
    };
  }

  function showTurnstileError(message: string) {
    const errorEl = document.getElementById('turnstile-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearTurnstileError() {
    showTurnstileError('');
  }

  // ── Validation ─────────────────────────────────────────────────────────
  function validateField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
    if (field.required && !field.value.trim()) {
      return field.dataset.errorRequired ?? 'This field is required.';
    }
    if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      return 'Please enter a valid business email address.';
    }
    if (field.type === 'checkbox' && !(field as HTMLInputElement).checked && field.required) {
      return field.dataset.errorRequired ?? 'You must acknowledge this before submitting.';
    }
    return '';
  }

  function showFieldError(field: HTMLElement, message: string) {
    const errorId = `${field.id}-error`;
    let errorEl = document.getElementById(errorId);
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.id = errorId;
      errorEl.className = 'field-error';
      errorEl.setAttribute('role', 'alert');
      field.parentNode?.appendChild(errorEl);
    }
    errorEl.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby',
      [field.getAttribute('aria-describedby') ?? '', errorId].filter(Boolean).join(' ')
    );
  }

  function clearFieldError(field: HTMLElement) {
    const errorId = `${field.id}-error`;
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function validateForm(): boolean {
    let firstError: HTMLElement | null = null;
    let valid = true;

    const fields = _form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input[required], select[required], textarea[required], input[type="checkbox"][required]'
    );

    fields.forEach((field) => {
      const message = validateField(field);
      if (message) {
        showFieldError(field, message);
        if (!firstError) firstError = field;
        valid = false;
      } else {
        clearFieldError(field);
      }
    });

    // Turnstile token is a separate required condition, only when the
    // widget is actually configured (see hasTurnstile above).
    if (hasTurnstile && !turnstileToken) {
      showTurnstileError('Please complete the verification challenge before submitting.');
      if (!firstError) firstError = turnstileContainer;
      valid = false;
    } else {
      clearTurnstileError();
    }

    if (firstError) (firstError as HTMLElement).focus();
    return valid;
  }

  // Clear errors on interaction
  form.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (target && target.id) clearFieldError(target);
  });
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target && target.id) clearFieldError(target);
  });

  // ── Submission ──────────────────────────────────────────────────────────
  function buildPayload(): InquiryPayload {
    const data = new FormData(_form);
    const field = (key: string) => String(data.get(key) ?? '').trim();

    const message = [
      `Role: ${field('role')}`,
      `Nature of inquiry: ${field('nature')}`,
      `Preferred timing: ${field('timing') || 'No preference'}`,
      `Referral: ${field('referral') || 'Not specified'}`,
      '',
      field('description'),
    ].join('\n');

    return {
      name: field('name'),
      email: field('email'),
      organization: field('organization'),
      message,
      website: field('website'), // honeypot — must stay empty for legitimate users
      turnstileToken,
    };
  }

  async function submitInquiry(payload: InquiryPayload): Promise<void> {
    const response = await fetch(SITE.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data: { success?: boolean } = {};
    try {
      data = await response.json();
    } catch {
      // Non-JSON or empty response body — treated as failure below.
    }

    if (response.status !== 200 || data.success !== true) {
      throw new Error(`Inquiry submission failed (status ${response.status})`);
    }
  }

  function resetAfterSuccess() {
    _form.reset();
    turnstileToken = '';
    if (hasTurnstile && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // Defense in depth: the disabled submit button already prevents this
    // in practice, but a disabled button doesn't stop every path that can
    // fire a form "submit" event (e.g. pressing Enter in a text field).
    if (submissionBlocked) return;
    if (currentState === 'submitting') return;
    if (!validateForm()) return;

    setState('submitting');

    try {
      if (previewFailure) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        throw new Error('Simulated failure (preview mode)');
      }
      await submitInquiry(buildPayload());
      setState('success');
      resetAfterSuccess();
    } catch {
      setState('failure');
    }
  }

  form.addEventListener('submit', handleSubmit);

  // Try-again button resets to idle without clearing the user's entries
  const retryBtn = document.getElementById('form-retry');
  retryBtn?.addEventListener('click', () => {
    setState('idle');
    _form.querySelector<HTMLElement>('input:not([disabled])')?.focus();
  });
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInquiryForm);
} else {
  initInquiryForm();
}
