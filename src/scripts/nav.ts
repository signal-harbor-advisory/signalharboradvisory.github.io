/**
 * nav.ts
 * Mobile menu toggle with focus trap and sticky header behavior.
 * Pure DOM — no framework dependencies.
 */

(function initNav() {
  const header    = document.getElementById('site-header');
  const sentinel  = document.getElementById('nav-sentinel');
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('nav-drawer');
  const closeBtn  = document.getElementById('nav-drawer-close');
  const overlay   = document.getElementById('nav-overlay');

  if (!header || !hamburger || !drawer || !closeBtn || !overlay) return;

  // Capture non-nullable references for use inside closures.
  // TypeScript cannot narrow outer-scope const to non-null across closure boundaries,
  // so we reassign to explicitly typed locals here after the guard.
  const _header    = header    as HTMLElement;
  const _hamburger = hamburger as HTMLElement;
  const _drawer    = drawer    as HTMLElement;
  const _overlay   = overlay   as HTMLElement;

  // ── Sticky nav via IntersectionObserver ──────────────────────────────────
  if (sentinel) {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) _header.classList.toggle('is-stuck', !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
  }

  // ── Mobile drawer ────────────────────────────────────────────────────────
  function openDrawer() {
    _drawer.classList.add('is-open');
    _overlay.classList.add('is-visible');
    _drawer.removeAttribute('aria-hidden');
    _hamburger.setAttribute('aria-expanded', 'true');
    _hamburger.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';

    // Move focus into drawer
    const firstFocusable = getFocusable(_drawer)[0];
    firstFocusable?.focus();
  }

  function closeDrawer() {
    _drawer.classList.remove('is-open');
    _overlay.classList.remove('is-visible');
    _drawer.setAttribute('aria-hidden', 'true');
    _hamburger.setAttribute('aria-expanded', 'false');
    _hamburger.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
    _hamburger.focus();
  }

  function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.closest('[data-placeholder]'));
  }

  // Focus trap inside drawer
  function trapFocus(e: KeyboardEvent) {
    if (!_drawer.classList.contains('is-open')) return;
    const focusable = getFocusable(_drawer);
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last  = focusable[focusable.length - 1]!;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
    }
  }

  _hamburger.addEventListener('click', () => {
    if (_drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn.addEventListener('click', closeDrawer);
  _overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', trapFocus);
})();
