// DeepCore — 3D Animations Layer
// Additive: does not conflict with existing reveal / GSAP hero animations

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. 3D CARD TILT ────────────────────────────────────────────────────────
  // Cards rotate in 3D based on mouse position relative to card center
  const TILT_MAX = 9; // degrees

  function applyTilt(card) {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const dx  = (e.clientX - r.left - r.width  / 2) / (r.width  / 2); // -1..1
      const dy  = (e.clientY - r.top  - r.height / 2) / (r.height / 2); // -1..1
      const rx  = -dy * TILT_MAX;
      const ry  =  dx * TILT_MAX;

      // Inline-style glare position (picked up by CSS var if needed)
      card.style.setProperty('--gx', ((dx + 1) / 2 * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((dy + 1) / 2 * 100).toFixed(1) + '%');
      card.style.transition = 'box-shadow 0.15s, border-color 0.15s';
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s, border-color 0.3s';
      card.style.transform  = '';
      card.style.removeProperty('--gx');
      card.style.removeProperty('--gy');
    });
  }

  document.querySelectorAll('.svc-card, .prod-card, .pricing-card, .app-tile')
          .forEach(applyTilt);


  // ── 2. MAGNETIC BUTTONS ────────────────────────────────────────────────────
  // CTAs attract slightly toward the cursor — feels premium
  const MAGNET_STRENGTH = 0.35;

  document.querySelectorAll('.nav-cta, .btn-fill, .btn-line').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transition = 'transform 0.08s linear';
      btn.style.transform  = `translate(${dx * MAGNET_STRENGTH}px, ${dy * MAGNET_STRENGTH}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
      btn.style.transform  = '';
    });
  });


  // ── 3. HERO ORB PARALLAX ───────────────────────────────────────────────────
  // Orbs float toward the mouse — adds depth to the hero
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const orb3 = document.querySelector('.hero-orb-3');

  if (orb1 && orb2 && orb3) {
    // Pause CSS float animation; JS will drive movement
    [orb1, orb2, orb3].forEach(o => {
      o.style.animation = 'none';
      o.style.willChange = 'transform';
    });

    let tx = 0, ty = 0; // target
    let cx = 0, cy = 0; // current (lerped)
    const LERP = 0.045;

    document.addEventListener('mousemove', e => {
      const hw = window.innerWidth  / 2;
      const hh = window.innerHeight / 2;
      tx = (e.clientX - hw) / hw; // -1..1
      ty = (e.clientY - hh) / hh;
    });

    (function loop() {
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      orb1.style.transform = `translate(${cx * -50}px, ${cy * -35}px)`;
      orb2.style.transform = `translate(${cx *  35}px, ${cy *  28}px)`;
      orb3.style.transform = `translate(${cx * -22}px, ${cy *  16}px)`;
      requestAnimationFrame(loop);
    })();
  }


  // ── 4. GSAP SCROLL — section reveals with depth ────────────────────────────
  // Uses GSAP already registered in script.js (ScrollTrigger available)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

    // Pricing cards — stagger in with spring
    const pricingGrid = document.querySelector('.pricing-grid');
    if (pricingGrid) {
      gsap.fromTo(
        pricingGrid.querySelectorAll('.pricing-card'),
        { y: 60, opacity: 0, rotationY: -12, scale: 0.96 },
        {
          y: 0, opacity: 1, rotationY: 0, scale: 1,
          duration: 0.9, ease: 'back.out(1.5)', stagger: 0.14,
          scrollTrigger: { trigger: pricingGrid, start: 'top 82%' }
        }
      );
    }

    // App tiles — cascade from top-left
    const appGrid = document.querySelector('.app-grid');
    if (appGrid) {
      gsap.fromTo(
        appGrid.querySelectorAll('.app-tile'),
        { y: 45, opacity: 0, scale: 0.94 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.65, ease: 'power2.out', stagger: 0.07,
          scrollTrigger: { trigger: appGrid, start: 'top 84%' }
        }
      );
    }

    // Counters — count-up pairs with pop
    const countersGrid = document.querySelector('.counters-grid');
    if (countersGrid) {
      gsap.fromTo(
        countersGrid.querySelectorAll('.counter-item'),
        { y: 40, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.7, ease: 'back.out(1.7)', stagger: 0.12,
          scrollTrigger: { trigger: countersGrid, start: 'top 88%' }
        }
      );
    }

    // FAQ items — slide from left
    const faqList = document.querySelector('.faq-list');
    if (faqList) {
      gsap.fromTo(
        faqList.querySelectorAll('.faq-item'),
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 0.6, ease: 'power2.out', stagger: 0.09,
          scrollTrigger: { trigger: faqList, start: 'top 85%' }
        }
      );
    }

    // Roadmap items — alternate left/right
    const roadmap = document.querySelector('.roadmap-list, .roadmap');
    if (roadmap) {
      const items = roadmap.querySelectorAll('li, .roadmap-item, .rm-item');
      items.forEach((item, i) => {
        gsap.fromTo(item,
          { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
          {
            x: 0, opacity: 1,
            duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 88%' }
          }
        );
      });
    }
  }

});
