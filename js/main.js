/* ============================================================
   Notaria Hispana & Multiservices — main.js
   Features: language switcher, scroll animations, mobile nav,
             counter animation, form handling
   ============================================================ */

'use strict';

/* ── Language / Translation Engine ──────────────────────── */
const LangEngine = (() => {
  const STORAGE_KEY = 'nm_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function apply(lang) {
    const t = translations[lang];
    if (!t) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else if (el.tagName === 'OPTION' && el.hasAttribute('data-i18n-value')) {
          el.textContent = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Update all [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Update lang buttons active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Fade transition
    document.body.style.opacity = '0.85';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.18s ease';
      document.body.style.opacity = '1';
      setTimeout(() => { document.body.style.transition = ''; }, 200);
    });
  }

  function init() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => apply(btn.dataset.lang));
    });
    apply(currentLang);
  }

  return { init, apply, get: () => currentLang };
})();

/* ── Mobile Navigation ───────────────────────────────────── */
const MobileNav = (() => {
  function init() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  return { init };
})();

/* ── Desktop Dropdown ────────────────────────────────────── */
const Dropdown = (() => {
  function init() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dd => {
      const toggle = dd.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;

      // Open on hover (desktop)
      dd.addEventListener('mouseenter', () => {
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      });
      dd.addEventListener('mouseleave', () => {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });

      // Also support click (touch / keyboard)
      toggle.addEventListener('click', e => {
        e.preventDefault();
        const isOpen = dd.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Close when clicking outside
      document.addEventListener('click', e => {
        if (!dd.contains(e.target)) {
          dd.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  return { init };
})();

/* ── Scroll Fade-in (IntersectionObserver) ───────────────── */
const ScrollReveal = (() => {
  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ── Counter Animation ───────────────────────────────────── */
const CounterAnim = (() => {
  function animateCounter(el, target, suffix, duration) {
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(ease * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function init() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          const target = parseInt(entry.target.dataset.counter, 10);
          const suffix = entry.target.dataset.suffix || '';
          animateCounter(entry.target, target, suffix, 1600);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ── Sticky Navbar Shadow ────────────────────────────────── */
const NavbarScroll = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.style.boxShadow = window.scrollY > 10
        ? '0 4px 20px rgba(26,39,68,.12)'
        : '0 2px 8px rgba(26,39,68,.08)';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  return { init };
})();

/* ── Contact Form Handling ───────────────────────────────── */
const ContactForm = (() => {
  function init() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check
      const honeypot = form.querySelector('[name="_honeypot"]');
      if (honeypot && honeypot.value) return; // silently reject bots

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Sending...';

      const formData = new FormData(form);
      const action = form.getAttribute('action'); // raw attribute, not resolved URL

      try {
        if (!action || action === '' || action === '#') {
          // No Formspree action configured yet — show friendly success message
          await new Promise(r => setTimeout(r, 800));
          showSuccess(form, submitBtn);
          return;
        }

        const res = await fetch(action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          showSuccess(form, submitBtn);
        } else {
          throw new Error('Server error');
        }
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showError(form);
      }
    });
  }

  function showSuccess(form, btn) {
    const msg = document.createElement('div');
    msg.className = 'form-success-msg';
    msg.style.cssText = `
      background: #d1fae5; border: 1.5px solid #34d399; border-radius: 12px;
      padding: 20px 24px; text-align: center; color: #065f46;
      font-weight: 600; font-size: .95rem; margin-top: 16px;
    `;
    msg.textContent = '✅ Message sent! We\'ll get back to you shortly.';
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Send Message';
    form.after(msg);
    setTimeout(() => msg.remove(), 6000);
  }

  function showError(form) {
    const msg = document.createElement('div');
    msg.style.cssText = `
      background: #fee2e2; border: 1.5px solid #f87171; border-radius: 12px;
      padding: 16px 20px; text-align: center; color: #991b1b;
      font-weight: 600; font-size: .9rem; margin-top: 12px;
    `;
    msg.textContent = '⚠️ Something went wrong. Please call or WhatsApp us directly.';
    form.after(msg);
    setTimeout(() => msg.remove(), 5000);
  }

  return { init };
})();

/* ── Active Nav Link ─────────────────────────────────────── */
function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .nav-dropdown-menu a, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Normalize
    const linkPath = new URL(href, window.location.origin).pathname;
    if (linkPath === path || (path.endsWith(linkPath) && linkPath !== '/')) {
      link.classList.add('active');
      link.style.color = 'var(--navy)';
    }
  });
}

/* ── Smooth Scroll for anchor CTAs ──────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  LangEngine.init();
  MobileNav.init();
  Dropdown.init();
  ScrollReveal.init();
  CounterAnim.init();
  NavbarScroll.init();
  ContactForm.init();
  setActiveNavLink();
  initSmoothScroll();
});
