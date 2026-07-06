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

  /* ---------- form -> envío real (FormSubmit AJAX, fallback mailto) ---------- */
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/lealsapedro@gmail.com';
  const form = $('#form');
  const note = $('#formNote');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      $$('.field', form).forEach(f => {
        const input = f.querySelector('input,textarea,select');
        if (!input) return;
        let bad = false;
        if (input.type === 'checkbox') bad = input.hasAttribute('required') && !input.checked;
        else bad = input.hasAttribute('required') && !input.value.trim();
        f.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        note.textContent = 'Revisa los campos marcados, por favor.';
        note.className = 'form__note err';
        return;
      }
      const d = new FormData(form);
      if (d.get('company')) return; // honeypot: bots fuera

      const subject = `Solicitud de presupuesto — ${d.get('type') || 'A2manos'}`;
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      note.textContent = 'Enviando…';
      note.className = 'form__note';
      try {
        const r = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            Nombre: d.get('name'),
            Teléfono: d.get('phone'),
            Email: d.get('email') || '—',
            'Tipo de trabajo': d.get('type'),
            Mensaje: d.get('msg'),
            _subject: subject,
            _template: 'table',
            _captcha: 'false'
          })
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !(j.success === true || j.success === 'true')) throw new Error(j.message || 'send failed');
        note.textContent = '¡Solicitud enviada! Te contactamos muy pronto.';
        note.className = 'form__note ok';
        form.reset();
      } catch (err) {
        // fallback: abrir el correo del visitante con todo relleno
        const body =
          `Nombre: ${d.get('name')}\nTeléfono: ${d.get('phone')}\nEmail: ${d.get('email') || '—'}\n` +
          `Tipo de trabajo: ${d.get('type')}\n\n${d.get('msg')}`;
        window.location.href =
          `mailto:lealsapedro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        note.textContent = 'No se pudo enviar automáticamente. Te abrimos el correo — o llámanos al 623 067 554.';
        note.className = 'form__note err';
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
