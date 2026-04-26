// DeepCore — Animation Layer v2
// GSAP + custom micro-interactions for premium feel

document.addEventListener('DOMContentLoaded', () => {

  const GSAP = typeof gsap !== 'undefined';
  const ST   = GSAP && typeof ScrollTrigger !== 'undefined';
  if (GSAP && ST) gsap.registerPlugin(ScrollTrigger);

  // ── 1. HERO CANVAS FADE-IN AFTER THREE.JS LOADS ────────────────────────────
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    setTimeout(() => heroCanvas.classList.add('loaded'), 400);
  }


  // ── 2. HERO HEADING — manual char split ────────────────────────────────────
  // Splits .hero-heading into individual <span class="char"> elements
  // then animates them in with GSAP stagger
  function splitAndAnimate() {
    const heading = document.querySelector('.hero-heading');
    if (!heading || !GSAP) return;

    // Collect text from .line-text spans
    const lineTexts = heading.querySelectorAll('.line-text');
    lineTexts.forEach(lt => {
      const raw = lt.textContent;
      lt.textContent = '';
      lt.setAttribute('aria-hidden', 'true');

      // Keep aria on parent
      heading.setAttribute('aria-label', heading.innerText || raw);

      [...raw].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'char' + (ch === ' ' ? ' space' : '');
        span.textContent = ch === ' ' ? ' ' : ch;
        lt.appendChild(span);
      });
    });

    // Animate chars in
    const chars = heading.querySelectorAll('.char:not(.space)');
    gsap.fromTo(chars,
      { opacity: 0, y: '0.4em', rotationX: -30, transformOrigin: '50% 100%' },
      {
        opacity: 1, y: 0, rotationX: 0,
        duration: 0.7,
        ease: 'back.out(1.6)',
        stagger: 0.028,
        delay: 0.25
      }
    );
  }
  splitAndAnimate();


  // ── 3. HERO ELEMENTS — staggered entrance ──────────────────────────────────
  if (GSAP) {
    const heroItems = [
      '.hero-pill',
      '.hero-body',
      '.hero-cta',
      '.hero-ai-badges',
      '.hero-stats',
      '.hero-scroll',
      '.hero-data-chip'
    ];

    heroItems.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 + i * 0.09 }
      );
    });
  }


  // ── 4. 3D CARD TILT ────────────────────────────────────────────────────────
  const TILT_MAX = 8;

  function applyTilt(card) {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      card.style.setProperty('--gx', ((dx + 1) / 2 * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((dy + 1) / 2 * 100).toFixed(1) + '%');
      card.style.transition = 'box-shadow 0.1s, border-color 0.1s';
      card.style.transform  = `perspective(900px) rotateX(${-dy * TILT_MAX}deg) rotateY(${dx * TILT_MAX}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s, border-color 0.3s';
      card.style.transform  = '';
      card.style.removeProperty('--gx');
      card.style.removeProperty('--gy');
    });
  }

  document.querySelectorAll('.svc-card, .prod-card, .pricing-card, .app-tile, .showcase-card')
          .forEach(applyTilt);


  // ── 5. MAGNETIC BUTTONS ────────────────────────────────────────────────────
  document.querySelectorAll('.nav-cta, .btn-fill, .btn-line, .dl-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transition = 'transform 0.08s linear';
      btn.style.transform  = `translate(${dx * 0.3}px, ${dy * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
      btn.style.transform  = '';
    });
  });


  // ── 6. HERO ORB PARALLAX ───────────────────────────────────────────────────
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const orb3 = document.querySelector('.hero-orb-3');

  if (orb1 && orb2 && orb3) {
    [orb1, orb2, orb3].forEach(o => {
      o.style.animation  = 'none';
      o.style.willChange = 'transform';
    });

    let tx = 0, ty = 0, cx = 0, cy = 0;
    const LERP = 0.05;

    document.addEventListener('mousemove', e => {
      tx = (e.clientX / window.innerWidth  - 0.5);
      ty = (e.clientY / window.innerHeight - 0.5);
    });

    (function loop() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      orb1.style.transform = `translate(${cx * -55}px, ${cy * -40}px)`;
      orb2.style.transform = `translate(${cx *  40}px, ${cy *  32}px)`;
      orb3.style.transform = `translate(${cx * -25}px, ${cy *  18}px)`;
      requestAnimationFrame(loop);
    })();
  }


  // ── 7. GSAP SCROLL REVEALS ─────────────────────────────────────────────────
  if (GSAP && ST) {

    // ── 7a. COUNTERS — number count-up ──────────────────────────────────────
    const countersGrid = document.querySelector('.counters-grid');
    if (countersGrid) {
      gsap.fromTo(
        countersGrid.querySelectorAll('.counter-item'),
        { y: 50, opacity: 0, scale: 0.88 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.8, ease: 'back.out(1.8)', stagger: 0.13,
          scrollTrigger: { trigger: countersGrid, start: 'top 86%', once: true }
        }
      );
    }

    // ── 7b. SERVICE CARDS — split left/right ────────────────────────────────
    const svcGrid = document.querySelector('.svc-grid');
    if (svcGrid) {
      const cards = svcGrid.querySelectorAll('.svc-card');
      cards.forEach((card, i) => {
        const fromX = i === 0 ? -60 : i % 2 === 0 ? -40 : 40;
        gsap.fromTo(card,
          { x: fromX, opacity: 0, rotationY: i === 0 ? -6 : 0 },
          {
            x: 0, opacity: 1, rotationY: 0,
            duration: 0.75, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true }
          }
        );
      });
    }

    // ── 7c. PRICING CARDS — 3D flip-in ──────────────────────────────────────
    const pricingGrid = document.querySelector('.pricing-grid');
    if (pricingGrid) {
      gsap.fromTo(
        pricingGrid.querySelectorAll('.pricing-card'),
        { y: 70, opacity: 0, rotationX: -15, scale: 0.94 },
        {
          y: 0, opacity: 1, rotationX: 0, scale: 1,
          duration: 0.9, ease: 'back.out(1.4)', stagger: 0.15,
          scrollTrigger: { trigger: pricingGrid, start: 'top 82%', once: true }
        }
      );
    }

    // ── 7d. APP TILES — cascade ─────────────────────────────────────────────
    const appGrid = document.querySelector('.app-grid');
    if (appGrid) {
      gsap.fromTo(
        appGrid.querySelectorAll('.app-tile'),
        { y: 40, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.6, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: { trigger: appGrid, start: 'top 84%', once: true }
        }
      );
    }

    // ── 7e. SHOWCASE CARDS — alternating sides ───────────────────────────────
    document.querySelectorAll('.showcase-card').forEach((card, i) => {
      gsap.fromTo(card,
        { x: i % 2 === 0 ? -80 : 80, opacity: 0, rotationY: i % 2 === 0 ? 8 : -8 },
        {
          x: 0, opacity: 1, rotationY: 0,
          duration: 1.0, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%', once: true }
        }
      );
    });

    // ── 7f. SECTION HEADINGS — eyebrow + h2 ─────────────────────────────────
    document.querySelectorAll('.section-head').forEach(head => {
      const eyebrow = head.querySelector('.eyebrow');
      const h2      = head.querySelector('.section-h');
      const p       = head.querySelector('.section-p');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: head, start: 'top 85%', once: true }
      });

      if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
      if (h2)      tl.fromTo(h2,      { opacity: 0, y:  24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.25');
      if (p)       tl.fromTo(p,       { opacity: 0, y:  16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35');
    });

    // ── 7g. FAQ ITEMS — slide from left with stagger ─────────────────────────
    const faqList = document.querySelector('.faq-list');
    if (faqList) {
      gsap.fromTo(
        faqList.querySelectorAll('.faq-item'),
        { x: -45, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 0.55, ease: 'power2.out', stagger: 0.09,
          scrollTrigger: { trigger: faqList, start: 'top 84%', once: true }
        }
      );
    }

    // ── 7h. ROADMAP — alternate left/right ──────────────────────────────────
    const roadmap = document.querySelector('.roadmap-list, .roadmap, [class*="roadmap"]');
    if (roadmap) {
      roadmap.querySelectorAll('li, .roadmap-item, .rm-item, [class*="rm-"]').forEach((item, i) => {
        gsap.fromTo(item,
          { x: i % 2 === 0 ? -55 : 55, opacity: 0, scale: 0.95 },
          {
            x: 0, opacity: 1, scale: 1,
            duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true }
          }
        );
      });
    }

    // ── 7i. HERO DATA CHIP — slide in from right ─────────────────────────────
    const chip = document.querySelector('.hero-data-chip');
    if (chip) {
      gsap.fromTo(chip,
        { x: 60, opacity: 0, rotationY: 15 },
        { x: 0, opacity: 1, rotationY: 0, duration: 1.0, ease: 'power3.out', delay: 1.0 }
      );
    }

    // ── 7j. GENERAL REVEALS ──────────────────────────────────────────────────
    document.querySelectorAll('.reveal').forEach(el => {
      // Skip if already handled by more specific rules
      const handled = el.closest('.svc-grid, .pricing-grid, .app-grid, .section-head, .faq-list');
      if (handled) return;

      gsap.fromTo(el,
        { y: 35, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    // ── 7k. ABOUT SECTION — metrics pop ─────────────────────────────────────
    const metrics = document.querySelectorAll('.metric, .about-metric');
    if (metrics.length) {
      gsap.fromTo(metrics,
        { y: 25, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.6, ease: 'back.out(1.5)', stagger: 0.1,
          scrollTrigger: { trigger: metrics[0], start: 'top 85%', once: true }
        }
      );
    }

    // ── 7l. SECTION ACCENT LINES — draw from left ────────────────────────────
    document.querySelectorAll('.section-accent-line').forEach(line => {
      gsap.fromTo(line,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: line, start: 'top 90%', once: true }
        }
      );
    });

    // ── 7m. FOOTER REVEAL ────────────────────────────────────────────────────
    const footer = document.querySelector('footer, .footer');
    if (footer) {
      gsap.fromTo(footer,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: footer, start: 'top 95%', once: true }
        }
      );
    }
  }


  // ── 8. EYEBROW TRACKING ANIMATION ─────────────────────────────────────────
  // Triggers the CSS letter-spacing animation on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.eyebrow').forEach(el => io.observe(el));


  // ── 9. CURSOR EXPANSION ON INTERACTIVE ELEMENTS ───────────────────────────
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower) {
    document.querySelectorAll('.svc-card, .prod-card, .showcase-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        follower.style.width  = '64px';
        follower.style.height = '64px';
        follower.style.borderColor = 'rgba(255,0,34,0.5)';
        follower.style.backdropFilter = 'blur(4px)';
      });
      el.addEventListener('mouseleave', () => {
        follower.style.width  = '32px';
        follower.style.height = '32px';
        follower.style.borderColor = 'rgba(255,0,34,0.4)';
        follower.style.backdropFilter = '';
      });
    });
  }


  // ── 10. DATA CHIP COUNTERS — live-ish numbers ────────────────────────────
  function animateChipStat() {
    const statEls = document.querySelectorAll('.hdc-value[data-count]');
    statEls.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      let current  = 0;
      const step   = Math.ceil(target / 25);
      const iv     = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = el.dataset.prefix
          ? el.dataset.prefix + current
          : current + (el.dataset.suffix || '');
        if (current >= target) clearInterval(iv);
      }, 45);
    });
  }
  setTimeout(animateChipStat, 1200);

});
