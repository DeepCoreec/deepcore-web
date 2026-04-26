// DeepCore v3 — Scripts






// ── CURSOR PERSONALIZADO ──
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

function animateFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.left = fx + 'px';
  follower.style.top  = fy + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

document.querySelectorAll('a, button, .svc-card, .prod-card, .cinfo').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '14px';
    cursor.style.height = '14px';
    follower.style.width = '48px';
    follower.style.height = '48px';
    follower.style.borderColor = 'rgba(255,0,34,0.7)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '8px';
    cursor.style.height = '8px';
    follower.style.width = '32px';
    follower.style.height = '32px';
    follower.style.borderColor = 'rgba(255,0,34,0.4)';
  });
});

// ── CANVAS HERO — Red neuronal avanzada ──
// Three.js (scene3d.js) takes over when available — 2D canvas is fallback
const canvas = document.getElementById('heroCanvas');
const ctx = typeof THREE === 'undefined' ? canvas.getContext('2d') : null;
let W, H, nodes = [], pulses = [];

function resizeCanvas() {
  if (!ctx) return;
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); if (ctx) initNodes(); });

// Paleta: rojo profundo + blanco tenue — sobre fondo negro DeepCore
const C_NODE      = [255, 0, 34];
const C_NODE_DIM  = [180, 0, 20];
const C_LINE      = [255, 0, 34];
const C_PULSE     = [255, 255, 255];

class Node {
  constructor(depth) {
    this.depth = depth || (Math.random() * 0.7 + 0.3); // 0.3 → 1.0 (perspectiva)
    this.reset();
  }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.vx    = (Math.random() - 0.5) * 0.35 * this.depth;
    this.vy    = (Math.random() - 0.5) * 0.35 * this.depth;
    this.r     = this.depth * 2.2 + 0.5;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.018 + Math.random() * 0.015;
    // Algunos nodos son "hubs" más grandes
    this.isHub = Math.random() < 0.08;
    if (this.isHub) this.r *= 2.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += this.pulseSpeed;
    if (this.x < -50) this.x = W + 50;
    if (this.x > W + 50) this.x = -50;
    if (this.y < -50) this.y = H + 50;
    if (this.y > H + 50) this.y = -50;
  }
  draw() {
    const glow = 0.55 + 0.45 * Math.sin(this.pulse);
    const [r, g, b] = this.isHub ? [255, 60, 60] : C_NODE;
    // Halo exterior
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 6);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${glow * 0.35})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Núcleo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${glow})`;
    ctx.fill();
    // Centro blanco brillante
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${glow * 0.9})`;
    ctx.fill();
  }
}

// Pulso de datos viajando por las líneas
class DataPulse {
  constructor(a, b) {
    this.a   = a;
    this.b   = b;
    this.t   = 0;
    this.spd = 0.012 + Math.random() * 0.016;
    this.alive = true;
  }
  update() {
    this.t += this.spd;
    if (this.t >= 1) this.alive = false;
  }
  draw() {
    const x = this.a.x + (this.b.x - this.a.x) * this.t;
    const y = this.a.y + (this.b.y - this.a.y) * this.t;
    const fade = Math.sin(this.t * Math.PI);
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${fade * 0.9})`;
    ctx.fill();
    // Cola
    const tx2 = this.a.x + (this.b.x - this.a.x) * Math.max(0, this.t - 0.08);
    const ty2 = this.a.y + (this.b.y - this.a.y) * Math.max(0, this.t - 0.08);
    ctx.beginPath();
    ctx.moveTo(tx2, ty2);
    ctx.lineTo(x, y);
    ctx.strokeStyle = `rgba(255,200,200,${fade * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function initNodes() {
  if (!ctx) return;
  const count = Math.min(Math.floor((W * H) / 11000), 150);
  nodes = Array.from({ length: count }, () => new Node());
  pulses = [];
}
initNodes();

// Generar pulsos periódicamente
setInterval(() => {
  if (!ctx || pulses.length > 25) return;
  const maxDist = 200;
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const candidates = nodes.filter(b => b !== a && Math.hypot(a.x-b.x, a.y-b.y) < maxDist);
  if (candidates.length) {
    const b = candidates[Math.floor(Math.random() * candidates.length)];
    pulses.push(new DataPulse(a, b));
  }
}, 180);

function animCanvas() {
  if (!ctx) return;
  // Fade trail — fondo con alpha bajo para efecto de estela
  ctx.fillStyle = 'rgba(5,5,8,0.18)';
  ctx.fillRect(0, 0, W, H);

  const maxDist = 185;

  // Conexiones
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < maxDist) {
        const depthAlpha = (a.depth + b.depth) / 2;
        const alpha = depthAlpha * 0.55 * (1 - d / maxDist);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${C_LINE[0]},${C_LINE[1]},${C_LINE[2]},${alpha})`;
        ctx.lineWidth = depthAlpha * 0.9;
        ctx.stroke();
      }
    }
  }

  // Nodos
  nodes.forEach(n => { n.update(); n.draw(); });

  // Pulsos de datos
  pulses.forEach(p => { p.update(); p.draw(); });
  pulses = pulses.filter(p => p.alive);

  requestAnimationFrame(animCanvas);
}
if (ctx) animCanvas();

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ──
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
  });
});

// Mobile nav open style
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links.open {
      display: flex !important; flex-direction: column;
      position: absolute; top: 60px; left: 0; right: 0;
      background: rgba(5,5,8,0.98); border-bottom: 1px solid rgba(255,255,255,0.07);
      padding: 20px 24px; gap: 20px; backdrop-filter: blur(20px);
    }
  }
`;
document.head.appendChild(style);

// ── REVEAL SCROLL — Emil Kowalski: ease-out, 300-400ms, no blocking ──
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // Stagger max 40ms per item — Emil: keep stagger under 50ms
      setTimeout(() => e.target.classList.add('visible'), i * 40);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── FAQ ──
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── CONTADOR ANIMADO ──
function animateCount(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current) + suffix;
  }, 16);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const val = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      animateCount(el, parseFloat(val), suffix);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ── FORMULARIO ──
function enviarFormulario(e) {
  e.preventDefault();
  const nombre   = document.getElementById('nombre').value;
  const email    = document.getElementById('email').value;
  const servicio = document.getElementById('servicio').value;
  const mensaje  = document.getElementById('mensaje').value;
  const texto = `Hola DeepCore! Soy ${nombre} (${email}). Servicio: ${servicio || 'consulta general'}. ${mensaje}`;
  window.open(`https://wa.me/593986225038?text=${encodeURIComponent(texto)}`, '_blank');
}

// ── GSAP — Animaciones staggered ─────────────────────────────────────────────
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // Hero entrance staggered
  gsap.from('.hero-pill',    { opacity: 0, y: 20, duration: 0.7, delay: 0.2, ease: 'power3.out' });
  gsap.from('.line-text',    { opacity: 0, y: 60, duration: 0.9, delay: 0.4, stagger: 0.15, ease: 'power3.out' });
  gsap.from('.hero-body',    { opacity: 0, y: 30, duration: 0.7, delay: 0.75, ease: 'power3.out' });
  gsap.from('.btn-fill, .btn-line', { opacity: 0, y: 20, duration: 0.6, delay: 0.9, stagger: 0.1, ease: 'power3.out' });
  gsap.from('.hstat',        { opacity: 0, y: 20, duration: 0.5, delay: 1.1, stagger: 0.1, ease: 'power3.out' });
}

// ── Palabras scramble — se acomodan al entrar en viewport ────────────────────
const wordsContainer = document.getElementById('scrambleWords');
if (wordsContainer) {
  const words = wordsContainer.querySelectorAll('span');

  // Distribuir delays escalonados
  words.forEach((w, i) => {
    w.style.transitionDelay = `${i * 0.06}s`;
  });

  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        wordsContainer.classList.add('animated');
        scrambleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  scrambleObserver.observe(wordsContainer);
}

// ── Text scramble en el título de la sección scramble ───────────────────────
const scrambleTitle = document.getElementById('scrambleTitle');
if (scrambleTitle && typeof gsap !== 'undefined') {
  ScrollTrigger.create({
    trigger: scrambleTitle,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.from(scrambleTitle, {
        opacity: 0, y: 50, duration: 1,
        ease: 'power3.out'
      });
    }
  });
}

// ── fade-up con IntersectionObserver ────────────────────────────────────────
document.querySelectorAll('.fade-up').forEach(el => {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { el.classList.add('visible'); }
  }, { threshold: 0.15 }).observe(el);
});

// ── AGENT MOCKUP ANIMATION — ease-out entrances, 300ms, no layout thrash ──
(function() {
  const steps = document.querySelectorAll('#agentMockup .amk-step');
  const progressBar = document.getElementById('agentProgress');
  if (!steps.length || !progressBar) return;

  // Respect prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = 0;
  const total  = steps.length;
  // Step interval: 1800ms gives enough read time between reveals
  const STEP_MS = 1800;

  function showStep(idx) {
    steps.forEach((s, i) => {
      // Deactivate previous — ease-in for exit (faster than entrance)
      s.classList.toggle('amk-step-active', i === idx);
    });
    // Smooth progress — uses CSS var(--ease-out) via transition
    progressBar.style.width = ((idx + 1) / total * 100) + '%';
  }

  function tick() {
    current = (current + 1) % total;
    if (current === 0) {
      // Reset progress bar without animation, then re-enable
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      // One rAF ensures the no-transition reset is painted before restore
      requestAnimationFrame(() => requestAnimationFrame(() => {
        progressBar.style.transition = '';
        showStep(0);
      }));
    } else {
      showStep(current);
    }
  }

  if (reduced) {
    // Show all steps at once for reduced-motion users
    steps.forEach(s => s.classList.add('amk-step-active'));
    progressBar.style.width = '100%';
  } else {
    showStep(0);
    setInterval(tick, STEP_MS);
  }
})();
