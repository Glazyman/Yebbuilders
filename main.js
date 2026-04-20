(function () {
  'use strict';

  // ── Scrolled header ──────────────────────────────
  const header = document.getElementById('header');
  function onScroll() {
    header?.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile nav ───────────────────────────────────
  const toggle  = document.getElementById('nav-toggle');
  const navPill = document.getElementById('nav-pill');

  function openNav() {
    toggle?.setAttribute('aria-expanded', 'true');
    navPill?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    toggle?.setAttribute('aria-expanded', 'false');
    navPill?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', function () {
    toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
  });

  navPill?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navPill?.classList.contains('is-open')) {
      closeNav();
      toggle?.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (navPill?.classList.contains('is-open') &&
        !navPill.contains(e.target) && !toggle?.contains(e.target)) {
      closeNav();
    }
  });

  // ── Active nav link on scroll ────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  function highlightNav() {
    let current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 110) current = s.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('nav__link--active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  // ── Scroll-reveal ────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  const noMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (noMotion) {
    revealEls.forEach(el => el.classList.add('revealed'));
  } else {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const container = entry.target.closest(
          '.services__grid, .process__grid, .stats__grid, .why-us__text, .why-us__list, .projects__grid, .contact__card'
        );
        if (container) {
          const siblings = Array.from(container.querySelectorAll('.reveal:not(.revealed)'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.max(idx, 0) * 70 + 'ms';
        }
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

})();
