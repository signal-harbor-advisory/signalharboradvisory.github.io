/**
 * form.ts
 * Inquiry form — client-side state machine.
 *
 * States: idle → submitting → success | failure
 *
 * LOCAL REVIEW MODE (formEndpoint is empty):
 *   Submission is simulated with a 1 200 ms delay.
 *   Add ?preview=failure to the /contact URL to preview the failure state.
 *
 * PRODUCTION BOUNDARY
 * ─────────────────────────────────────────────────────────────────────────
 * Replace simulateSubmit() with a real fetch() POST to SITE.formEndpoint.
 * Required before launch:
 *   - RESEND_API_KEY          → Astro server endpoint (never expose client-side)
 *   - TURNSTILE_SITE_KEY      → PUBLIC_TURNSTILE_SITE_KEY in .env (client-visible)
 *   - TURNSTILE_SECRET_KEY    → TURNSTILE_SECRET_KEY in .env (server only)
 *   - Server-side validation  → sanitize all fields; reject missing required fields
 *   - Rate limiting           → per-IP and per-email (Cloudflare Workers or middleware)
 *   - No raw form content in logs — log submission receipt only
 *   - On success: send notification to PROFESSIONAL_EMAIL via Resend
 *   - Never echo raw submission back to the client response
 * ─────────────────────────────────────────────────────────────────────────
 */

type FormState = 'idle' | 'submitting' | 'success' | 'failure';

const SIMULATE_DELAY_MS = 1200;

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

  // Determine if we should simulate failure (local review aid)
  const previewFailure =
    new URLSearchParams(window.location.search).get('preview') === 'failure';

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
      _submitBtn.textContent = 'Sending\u2026';
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
        submitting: 'Sending your inquiry\u2026',
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
  async function simulateSubmit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATE_DELAY_MS));
    if (previewFailure) throw new Error('Simulated failure (preview mode)');
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (currentState === 'submitting') return;
    if (!validateForm()) return;

    setState('submitting');

    try {
      // PRODUCTION BOUNDARY: replace simulateSubmit() with real fetch
      await simulateSubmit();
      setState('success');
    } catch {
      setState('failure');
    }
  }

  form.addEventListener('submit', handleSubmit);

  // Try-again button resets to idle
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
