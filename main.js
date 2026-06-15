/* =========================================================
   A2manos — main.js
   ========================================================= */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- preloader ---------- */
  function reveal() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  }
  // give fonts/paint a beat, but never hang
  window.addEventListener('load', () => setTimeout(reveal, reduce ? 0 : 650));
  setTimeout(reveal, 2200); // safety net

  /* ---------- year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- stagger index on hero words ---------- */
  $$('.hero__title .word[data-stagger]').forEach((w, i) => w.style.setProperty('--i', i));

  /* ---------- hands draw-on (set dash length from real path) ---------- */
  if (!reduce) {
    $$('.hands-lockup .hand').forEach(p => {
      try {
        const len = p.getTotalLength();
        p.style.setProperty('--len', len);
        p.classList.add('draw');
      } catch (e) {}
    });
  }

  /* ---------- smooth scroll (Lenis, progressive enhancement) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // anchor handling (works with or without Lenis)
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        closeMenu();
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      lenis ? lenis.scrollTo(top) : window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- nav scrolled state ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
    nav.classList.remove('menu-open'); burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menu.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal], .step').forEach(el => io.observe(el));

  /* ---------- count-up ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1500; const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const v = target * easeOut(p);
      el.textContent = v.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- magnetic buttons ---------- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    $$('[data-magnetic]').forEach(el => {
      const strength = 22;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- form -> mailto (no backend needed) ---------- */
  const form = $('#form');
  const note = $('#formNote');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('.field', form).forEach(f => {
        const input = f.querySelector('input,textarea,select');
        if (!input) return;
        const bad = input.hasAttribute('required') && !input.value.trim();
        f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        note.textContent = 'Revisa los campos marcados, por favor.';
        note.className = 'form__note err';
        return;
      }
      const d = new FormData(form);
      const subject = `Solicitud de presupuesto — ${d.get('type') || 'A2manos'}`;
      const body =
        `Nombre: ${d.get('name')}\n` +
        `Teléfono: ${d.get('phone')}\n` +
        `Email: ${d.get('email') || '—'}\n` +
        `Tipo de trabajo: ${d.get('type')}\n\n` +
        `${d.get('msg')}`;
      window.location.href =
        `mailto:lealsapedro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Abriendo tu correo… si no se abre, escríbenos a lealsapedro@gmail.com';
      note.className = 'form__note ok';
      form.reset();
    });
  }
})();
