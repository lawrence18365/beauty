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
       Contact Form
       ========================================= */
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Thanks for your message. I'll be back to you soon.");
            form.reset();
        });
    }


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
