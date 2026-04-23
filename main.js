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
  var navLockScrollY = 0;

  function openNav() {
    navLockScrollY = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.add('nav-open');
    document.body.style.position = 'fixed';
    document.body.style.top = -navLockScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    toggle?.setAttribute('aria-expanded', 'true');
    navPill?.classList.add('is-open');
  }
  function closeNav() {
    toggle?.setAttribute('aria-expanded', 'false');
    navPill?.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, navLockScrollY);
  }

  toggle?.addEventListener('click', function () {
    toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
  });

  const mqNavDesktop = window.matchMedia('(min-width: 721px)');
  function closeNavIfNotMobile() {
    if (mqNavDesktop.matches) closeNav();
  }
  if (typeof mqNavDesktop.addEventListener === 'function') {
    mqNavDesktop.addEventListener('change', closeNavIfNotMobile);
  } else if (typeof mqNavDesktop.addListener === 'function') {
    mqNavDesktop.addListener(closeNavIfNotMobile);
  }

  navPill?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  const galleryLightbox = document.getElementById('gallery-lightbox');
  const galleryLightboxImg = galleryLightbox?.querySelector('.lightbox__img');
  const lightboxClose = document.getElementById('lightbox-close');

  function gphotoFullSizeUrl(url) {
    if (!url || url.indexOf('lh3.googleusercontent.com') === -1) return url;
    return String(url).replace(/=w\d+$/i, '=w2560');
  }

  function openGalleryLightbox(src, alt) {
    if (!galleryLightbox || !galleryLightboxImg) return;
    galleryLightboxImg.src = gphotoFullSizeUrl(src);
    galleryLightboxImg.alt = alt || '';
    document.body.classList.add('lightbox-open');
    document.body.style.overflow = 'hidden';
    galleryLightbox.showModal();
  }

  function closeGalleryLightbox() {
    if (galleryLightbox?.open) galleryLightbox.close();
  }

  document.querySelectorAll('button[data-lightbox]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const im = btn.querySelector('img');
      if (!im) return;
      openGalleryLightbox(im.currentSrc || im.getAttribute('src') || im.src, im.getAttribute('alt') || '');
    });
  });

  // ── Photo grid: one in-grid video playing at a time
  document.querySelectorAll('.photo-tile__video').forEach(function (v) {
    v.addEventListener('play', function () {
      document.querySelectorAll('.photo-tile__video').forEach(function (o) {
        if (o !== v) o.pause();
      });
    });
  });

  // ── Project gallery: prev/next (desktop) ───────
  const photoScroll = document.getElementById('photo-gallery-scroll');
  const photoPrev   = document.getElementById('photo-gallery-prev');
  const photoNext   = document.getElementById('photo-gallery-next');
  const redMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  function photoGalleryStep() {
    if (!photoScroll) return 0;
    const first = photoScroll.querySelector('.photo-grid__item');
    if (!first) {
      return Math.max(200, Math.floor(photoScroll.clientWidth * 0.75));
    }
    const grid  = photoScroll.querySelector('.photo-grid');
    const gStr  = grid ? getComputedStyle(grid).gap : '0';
    const gap   = parseFloat(gStr) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  function updatePhotoGalleryNav() {
    if (!photoScroll || !photoPrev || !photoNext) return;
    const max   = photoScroll.scrollWidth - photoScroll.clientWidth;
    const atStart = photoScroll.scrollLeft <= 1;
    const atEnd   = photoScroll.scrollLeft >= max - 1;
    if (max <= 0) {
      photoPrev.disabled = true;
      photoNext.disabled = true;
    } else {
      photoPrev.disabled = atStart;
      photoNext.disabled = atEnd;
    }
  }

  if (photoScroll && photoPrev && photoNext) {
    const scrollOpts = function (dir) {
      return { left: dir * photoGalleryStep(), behavior: redMotionMQ.matches ? 'auto' : 'smooth' };
    };
    photoPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      if (photoPrev.disabled) return;
      photoScroll.scrollBy(scrollOpts(-1));
    });
    photoNext.addEventListener('click', function (e) {
      e.stopPropagation();
      if (photoNext.disabled) return;
      photoScroll.scrollBy(scrollOpts(1));
    });
    photoScroll.addEventListener('scroll', updatePhotoGalleryNav, { passive: true });
    window.addEventListener('resize', updatePhotoGalleryNav, { passive: true });
    if (window.ResizeObserver) {
      var roP = new ResizeObserver(updatePhotoGalleryNav);
      roP.observe(photoScroll);
    }
    updatePhotoGalleryNav();
    window.addEventListener('load', updatePhotoGalleryNav, { passive: true });
  }

  lightboxClose?.addEventListener('click', function () { closeGalleryLightbox(); });
  galleryLightbox?.addEventListener('click', function (e) {
    if (e.target === galleryLightbox) closeGalleryLightbox();
  });
  galleryLightbox?.addEventListener('close', function () {
    document.body.classList.remove('lightbox-open');
    if (!navPill?.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
    if (galleryLightboxImg) {
      galleryLightboxImg.removeAttribute('src');
      galleryLightboxImg.alt = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !navPill?.classList.contains('is-open')) return;
    closeNav();
    toggle?.focus();
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
    var offset = header ? header.offsetHeight + 24 : 120;
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - offset) current = s.id;
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
          '.services__grid, .process__grid, .stats__grid, .why-us__text, .why-us__list, .projects__grid, .photo-grid, .contact__card'
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
