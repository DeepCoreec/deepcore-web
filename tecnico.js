// =============================================
// DeepCore — Lux Chibi v6.0 — WebP animado
// =============================================

const FRASES = [
  "¡Revisando sistemas! 🔧",
  "Todo funcionando ✅",
  "¡Sin errores! 💻",
  "¡DeepCore al 100%! 🔴",
  "Diagnóstico OK ✔️",
  "¡Tu equipo está seguro! 🛡️",
  "Optimizando... ⚡",
  "¡Reparación completada! 🌟",
];

// ── Construye el personaje ──
function buildTecnico() {
  const wrap = document.createElement('div');
  wrap.id = 'tecnico-wrap';
  wrap.innerHTML = `
    <div class="tec-burbuja" id="tecBurbuja"></div>
    <img class="tec-img" id="tecImg" src="lux_walk.webp" alt="Lux DeepCore"/>
  `;
  document.body.appendChild(wrap);

  // Precarga todos los WebP
  ['lux_walk.webp','lux_work.webp','lux_ulti.webp','lux_walkout.webp']
    .forEach(s => { const i = new Image(); i.src = s; });
}

// Cambia la animación activa
function setAnim(src) {
  const img = document.getElementById('tecImg');
  if (!img) return;
  img.src = src + '?t=' + Date.now(); // fuerza reload para reiniciar
}

// ── Timers ──
let _timers = [];
function later(fn, ms) { _timers.push(setTimeout(fn, ms)); }
function cancelAll()   { _timers.forEach(clearTimeout); _timers = []; }

// ── ANIMACIÓN PRINCIPAL ──
function animarTecnico() {
  const wrap    = document.getElementById('tecnico-wrap');
  const burbuja = document.getElementById('tecBurbuja');
  const laser   = document.getElementById('tec-laser');
  const flash   = document.getElementById('tec-flash');
  if (!wrap) return;

  cancelAll();
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)];

  // 1. ENTRA caminando
  setAnim('lux_walk.webp');
  wrap.classList.remove('sale');
  wrap.classList.add('entra');

  // 2. TRABAJA
  later(() => {
    setAnim('lux_work.webp');
    burbuja.textContent = frase;
    burbuja.classList.add('visible');
  }, 1000);

  // 3. LISTO
  later(() => {
    burbuja.textContent = '¡Listo! ✨';
  }, 4200);

  // 4. ULTI
  later(() => {
    setAnim('lux_ulti.webp');
    burbuja.textContent = '⚡ ¡FINALEM! ⚡';
  }, 4900);

  // 5. LASER
  later(() => {
    laser.classList.add('disparando');
    flash.classList.add('flash-activo');
    setTimeout(() => flash.classList.remove('flash-activo'), 200);
  }, 5200);

  // 6. SE VA
  later(() => {
    burbuja.classList.remove('visible');
    laser.classList.remove('disparando');
    setAnim('lux_walkout.webp');
    wrap.classList.remove('entra');
    wrap.classList.add('sale');
  }, 6500);
}

// ── 30 segundos de inactividad ──
document.addEventListener('DOMContentLoaded', () => {
  buildTecnico();

  const laser = document.createElement('div');
  laser.id = 'tec-laser';
  document.body.appendChild(laser);

  const flash = document.createElement('div');
  flash.id = 'tec-flash';
  document.body.appendChild(flash);

  let inactivityTimer = null;
  let activo = false;

  function resetTimer() {
    clearTimeout(inactivityTimer);
    if (activo) {
      cancelAll();
      const wrap = document.getElementById('tecnico-wrap');
      if (wrap) {
        document.getElementById('tecBurbuja').classList.remove('visible');
        document.getElementById('tec-laser').classList.remove('disparando');
        wrap.classList.remove('entra');
        wrap.classList.add('sale');
      }
      activo = false;
    }
    inactivityTimer = setTimeout(() => {
      activo = true;
      animarTecnico();
      setTimeout(() => { activo = false; }, 10000);
    }, 20000);
  }

  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keydown',   resetTimer);
  document.addEventListener('click',     resetTimer);
  document.addEventListener('scroll',    resetTimer);
  resetTimer();
});
