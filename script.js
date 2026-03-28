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

// ── CANVAS HERO — Red neuronal estilo DeepCore ──
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initNodes(); });

class Node {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 1.8 + 0.8;
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.02;
    if (this.x < 0 || this.x > W) this.vx *= -1;
    if (this.y < 0 || this.y > H) this.vy *= -1;
  }
  draw() {
    const glow = 0.7 + 0.3 * Math.sin(this.pulse);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,0,34,${glow})`;
    ctx.fill();
    // Halo
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,0,34,${glow * 0.15})`;
    ctx.fill();
  }
}

function initNodes() {
  const count = Math.floor((W * H) / 14000);
  nodes = Array.from({ length: Math.min(count, 120) }, () => new Node());
}
initNodes();

function drawPerspectiveGrid() {
  // Sin cuadrícula
}

function animCanvas() {
  ctx.clearRect(0, 0, W, H);
  drawPerspectiveGrid();
  nodes.forEach(n => { n.update(); n.draw(); });
  // Conexiones entre nodos cercanos
  const maxDist = 160;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < maxDist) {
        const alpha = 0.6 * (1 - d / maxDist);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,0,34,${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animCanvas);
}
animCanvas();

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ──
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
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

// ── REVEAL SCROLL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

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
