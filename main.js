document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       Preloader
       ========================================= */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        if (sessionStorage.getItem('cd_preloader')) {
            preloader.remove();
        } else {
            document.body.classList.add('preloader-active');
            sessionStorage.setItem('cd_preloader', '1');

            setTimeout(() => {
                preloader.classList.add('preloader-exit');
                document.body.classList.remove('preloader-active');

                preloader.addEventListener('animationend', () => {
                    preloader.remove();
                });
            }, 2100);
        }
    }


    /* =========================================
       Mobile Menu
       ========================================= */
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    /* =========================================
       Scroll Reveal (Intersection Observer)
       ========================================= */
    const revealTargets = document.querySelectorAll('.fade-up, .stagger');

    if (revealTargets.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealTargets.forEach(el => revealObserver.observe(el));
    }


    /* =========================================
       Header Hide on Scroll Down
       ========================================= */
    const header = document.querySelector('header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        if (currentY > lastScrollY && currentY > 80) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScrollY = currentY;
    });


    /* =========================================
       Active Nav Link on Scroll
       ========================================= */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    const updateActiveLink = () => {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    let scrollTick = false;
    window.addEventListener('scroll', () => {
        if (!scrollTick) {
            requestAnimationFrame(() => {
                updateActiveLink();
                scrollTick = false;
            });
            scrollTick = true;
        }
    });


    /* =========================================
       Smooth Scroll for Anchor Links
       ========================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* =========================================
       Studio Letters POPUP — modal email capture
       Triggers (whichever fires first):
         · 15s on page
         · 50% scroll
         · exit intent (mouse to top of viewport, desktop only)
       Frequency:
         · suppressed for 14 days after dismiss
         · suppressed forever after successful subscribe
         · suppressed on mobile past 75% scroll (Google interstitial policy)
       ========================================= */
    (function studioLettersPopup() {
        const SEEN_KEY = 'cdba.letters.seen';
        const DONE_KEY = 'cdba.letters.subscribed';
        const SUPPRESS_DAYS = 14;
        const TIME_TRIGGER_MS = 15000;
        const SCROLL_TRIGGER_PCT = 0.50;
        const MOBILE_BLOCK_PCT = 0.75;
        const MOBILE_BREAKPOINT = 768;

        const now = Date.now();
        const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

        // Bail conditions
        if (localStorage.getItem(DONE_KEY) === '1') return;
        const seenAt = parseInt(localStorage.getItem(SEEN_KEY) || '0', 10);
        if (seenAt && (now - seenAt) < SUPPRESS_DAYS * 24 * 60 * 60 * 1000) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
            // motion is fine
        }

        // Build popup HTML once
        const html = `
<dialog class="studio-popup" aria-labelledby="studio-popup-heading">
  <div class="studio-popup-card">
    <button type="button" class="studio-popup-close" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
        <path d="M5 5l14 14M19 5L5 19"/>
      </svg>
    </button>
    <span class="studio-popup-kicker">— A letter, monthly</span>
    <h2 id="studio-popup-heading">Stay close to the <em>chair</em>.</h2>
    <p class="studio-popup-lede">First in line for course dates and studio openings — sent only when there's something worth telling.</p>
    <form
      class="studio-letters-form"
      action="https://assets.mailerlite.com/jsonp/2210035/forms/182519995998143979/subscribe"
      method="post"
      novalidate>
      <input type="hidden" name="ml-submit" value="1">
      <input type="hidden" name="anticsrf" value="true">
      <input type="hidden" name="groups[]" value="186036534247426015">
      <div class="studio-letters-row">
        <label for="studio-popup-name" class="visually-hidden">First name</label>
        <input type="text" id="studio-popup-name" name="fields[name]" placeholder="First name" required autocomplete="given-name" maxlength="80">
      </div>
      <div class="studio-letters-field">
        <label for="studio-popup-email" class="visually-hidden">Email address</label>
        <input type="email" id="studio-popup-email" name="fields[email]" placeholder="your.email@example.com" required autocomplete="email" spellcheck="false">
        <button type="submit" class="studio-letters-submit">
          <span class="studio-letters-submit-label">Join the list</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">
            <path d="M4 12h16M14 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
      <label class="studio-letters-consent">
        <input type="checkbox" name="consent" value="yes" required>
        <span class="studio-letters-consent-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        </span>
        <span class="studio-letters-consent-text">I'd like to hear about course dates &amp; studio news.</span>
      </label>
      <p class="studio-letters-note">No spam. Never shared. Unsubscribe anytime.</p>
      <p class="studio-letters-error" role="alert" hidden></p>
      <div class="studio-letters-success" role="status" aria-live="polite" hidden>
        <span class="studio-letters-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        </span>
        <p><em>Almost there.</em> Check your inbox to confirm — first letter on its way after.</p>
      </div>
    </form>
    <button type="button" class="studio-popup-decline">No thanks, maybe later</button>
  </div>
</dialog>`;

        let dialog = null;
        let opened = false;
        let timer = null;
        let scrollHandler = null;
        let exitHandler = null;

        function getScrollPct() {
            const doc = document.documentElement;
            const scrolled = window.scrollY || doc.scrollTop;
            const max = doc.scrollHeight - window.innerHeight;
            return max > 0 ? scrolled / max : 0;
        }

        function teardownTriggers() {
            if (timer) clearTimeout(timer);
            if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
            if (exitHandler) document.removeEventListener('mouseleave', exitHandler);
            timer = null; scrollHandler = null; exitHandler = null;
        }

        function open() {
            if (opened) return;
            opened = true;
            teardownTriggers();

            // Inject if not already
            if (!dialog) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html.trim();
                dialog = wrapper.firstElementChild;
                document.body.appendChild(dialog);
                bindDialog(dialog);
            }
            // showModal handles focus trap + Esc + ::backdrop
            if (typeof dialog.showModal === 'function') {
                dialog.showModal();
            } else {
                dialog.setAttribute('open', '');
            }
        }

        function dismiss() {
            try { localStorage.setItem(SEEN_KEY, String(Date.now())); } catch {}
            if (dialog && dialog.open) dialog.close();
        }

        function bindDialog(d) {
            d.addEventListener('close', () => {
                // Cookie-style: record seen timestamp on any close
                try {
                    if (!localStorage.getItem(DONE_KEY)) {
                        localStorage.setItem(SEEN_KEY, String(Date.now()));
                    }
                } catch {}
            });
            d.querySelector('.studio-popup-close')?.addEventListener('click', dismiss);
            d.querySelector('.studio-popup-decline')?.addEventListener('click', dismiss);
            // Click on backdrop closes (clicks land on the dialog itself, not the card)
            d.addEventListener('click', (e) => {
                if (e.target === d) dismiss();
            });

            // Wire form to MailerLite via the same submit handler used by inline forms
            wireSubmit(d.querySelector('.studio-letters-form'));
        }

        function armTriggers() {
            timer = setTimeout(open, TIME_TRIGGER_MS);

            scrollHandler = () => {
                if (isMobile && getScrollPct() >= MOBILE_BLOCK_PCT) {
                    // User is deep in content on mobile — don't interrupt now
                    teardownTriggers();
                    return;
                }
                if (getScrollPct() >= SCROLL_TRIGGER_PCT) open();
            };
            window.addEventListener('scroll', scrollHandler, { passive: true });

            if (!isMobile) {
                exitHandler = (e) => {
                    if (e.clientY <= 0) open();
                };
                document.addEventListener('mouseleave', exitHandler);
            }
        }

        // Wait until preloader is gone before arming
        if (document.readyState === 'complete') {
            armTriggers();
        } else {
            window.addEventListener('load', () => setTimeout(armTriggers, 800));
        }

        // Expose a manual opener so a "Letters" footer link can re-open it
        window.openStudioLetters = open;

        // ----- Submit handler (shared with any in-page form too) -----
        function wireSubmit(letterForm) {
            if (!letterForm) return;
            const nameInput = letterForm.querySelector('input[name="fields[name]"]');
            const emailInput = letterForm.querySelector('input[type="email"]');
            const consentInput = letterForm.querySelector('input[name="consent"]');
            const submitBtn = letterForm.querySelector('.studio-letters-submit');
            const submitLabel = letterForm.querySelector('.studio-letters-submit-label');
            const errorEl = letterForm.querySelector('.studio-letters-error');
            const successEl = letterForm.querySelector('.studio-letters-success');
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const setError = (msg) => {
                if (!errorEl) return;
                if (msg) { errorEl.textContent = msg; errorEl.hidden = false; }
                else { errorEl.textContent = ''; errorEl.hidden = true; }
            };

            letterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                setError('');
                const name = (nameInput?.value || '').trim();
                const email = (emailInput?.value || '').trim();
                const consent = consentInput?.checked;
                if (!name) { nameInput?.focus(); setError('Pop your first name in.'); return; }
                if (!email || !emailRe.test(email)) { emailInput?.focus(); setError('That email looks off — mind double-checking?'); return; }
                if (!consent) { consentInput?.focus(); setError('Tick the consent box to join.'); return; }

                const originalLabel = submitLabel?.textContent;
                submitBtn.disabled = true;
                if (submitLabel) submitLabel.textContent = 'Sending';

                try {
                    const body = new URLSearchParams();
                    body.append('fields[name]', name);
                    body.append('fields[email]', email);
                    body.append('groups[]', '186036534247426015');
                    body.append('ml-submit', '1');
                    body.append('anticsrf', 'true');
                    const res = await fetch(letterForm.action, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body,
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok && data.success) {
                        letterForm.classList.add('is-success');
                        if (successEl) successEl.hidden = false;
                        try { localStorage.setItem(DONE_KEY, '1'); } catch {}
                    } else {
                        setError("Couldn't sign you up just now — try again in a moment.");
                        submitBtn.disabled = false;
                        if (submitLabel) submitLabel.textContent = originalLabel;
                    }
                } catch {
                    setError("Couldn't reach the server — check your connection and try again.");
                    submitBtn.disabled = false;
                    if (submitLabel) submitLabel.textContent = originalLabel;
                }
            });
        }
    })();


    /* =========================================
       Studio Letters — email capture (MailerLite)
       Posts to MailerLite's public JSONP subscribe endpoint via fetch.
       Endpoint is rate-limited (~10/min/IP) and CORS-open.
       ========================================= */
    document.querySelectorAll('.studio-letters-form').forEach((letterForm) => {
        const nameInput = letterForm.querySelector('input[name="fields[name]"]');
        const emailInput = letterForm.querySelector('input[type="email"]');
        const consentInput = letterForm.querySelector('input[name="consent"]');
        const submitBtn = letterForm.querySelector('.studio-letters-submit');
        const submitLabel = letterForm.querySelector('.studio-letters-submit-label');
        const errorEl = letterForm.querySelector('.studio-letters-error');
        const successEl = letterForm.querySelector('.studio-letters-success');
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const setError = (msg) => {
            if (!errorEl) return;
            if (msg) {
                errorEl.textContent = msg;
                errorEl.hidden = false;
            } else {
                errorEl.textContent = '';
                errorEl.hidden = true;
            }
        };

        letterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setError('');

            const name = (nameInput?.value || '').trim();
            const email = (emailInput?.value || '').trim();
            const consent = consentInput?.checked;

            if (!name) {
                nameInput?.focus();
                setError('Pop your first name in.');
                return;
            }
            if (!email || !emailRe.test(email)) {
                emailInput?.focus();
                setError('That email looks off — mind double-checking?');
                return;
            }
            if (!consent) {
                consentInput?.focus();
                setError('Tick the consent box to join.');
                return;
            }

            const originalLabel = submitLabel?.textContent;
            submitBtn.disabled = true;
            if (submitLabel) submitLabel.textContent = 'Sending';

            try {
                const body = new URLSearchParams();
                body.append('fields[name]', name);
                body.append('fields[email]', email);
                body.append('groups[]', '186036534247426015');
                body.append('ml-submit', '1');
                body.append('anticsrf', 'true');

                const res = await fetch(letterForm.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body,
                });
                const data = await res.json().catch(() => ({}));

                if (res.ok && data.success) {
                    letterForm.classList.add('is-success');
                    if (successEl) successEl.hidden = false;
                } else {
                    setError("Couldn't sign you up just now — try again in a moment.");
                    submitBtn.disabled = false;
                    if (submitLabel) submitLabel.textContent = originalLabel;
                }
            } catch (err) {
                setError("Couldn't reach the server — check your connection and try again.");
                submitBtn.disabled = false;
                if (submitLabel) submitLabel.textContent = originalLabel;
            }
        });
    });

});
