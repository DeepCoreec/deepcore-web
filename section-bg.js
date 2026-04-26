// DeepCore — Thematic Section Backgrounds
// Each section gets a canvas animation that matches its content

(function () {
  'use strict';

  const isMobile = window.innerWidth < 768;

  // ── Utility: inject canvas behind section content ──────────────────────────
  function mkCanvas(sectionEl) {
    const c = document.createElement('canvas');
    c.className = 'sec-bg-canvas';
    c.style.opacity = '0';
    c.style.transition = 'opacity 1.2s ease';
    sectionEl.insertBefore(c, sectionEl.firstChild);
    return c;
  }

  // ── Utility: activate canvas when section enters viewport ─────────────────
  function observeSection(el, callback) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
        io.disconnect();
      }
    }, { threshold: 0.05 });
    io.observe(el);
  }

  // ── Utility: pause animation when section is out of view ──────────────────
  function pauseWhenHidden(el, getAnim) {
    const io = new IntersectionObserver((entries) => {
      const anim = getAnim();
      if (!anim) return;
      if (entries[0].isIntersecting) {
        anim.running = true;
      } else {
        anim.running = false;
      }
    }, { threshold: 0 });
    io.observe(el);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 1. #servicios — PCB Circuit Board traces
  //    Red circuit lines + node dots pulsing
  // ══════════════════════════════════════════════════════════════════════════
  function initPCB() {
    const section = document.getElementById('servicios');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, nodes = [], edges = [], frame = 0;
    const anim = { running: false };

    function buildPCB() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      nodes = [];
      edges = [];

      const cols = isMobile ? 6 : 14;
      const rows = Math.ceil(H / (W / cols));
      const cellW = W / cols;
      const cellH = H / rows;

      // Create nodes at grid intersections with jitter
      for (let r = 0; r <= rows; r++) {
        for (let col = 0; col <= cols; col++) {
          if (Math.random() < 0.35) continue; // sparse
          nodes.push({
            x:    col * cellW + (Math.random() - 0.5) * cellW * 0.4,
            y:    r   * cellH + (Math.random() - 0.5) * cellH * 0.4,
            r:    Math.random() < 0.12 ? 4 : 2,
            pulse: Math.random() * Math.PI * 2,
            speed: 0.018 + Math.random() * 0.02,
            bright: Math.random() < 0.15
          });
        }
      }

      // Connect nearby nodes with L-shaped traces
      const maxDist = Math.max(cellW, cellH) * 1.9;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d  = Math.hypot(dx, dy);
          if (d < maxDist && Math.random() < 0.22) {
            edges.push({ a: i, b: j, corner: Math.random() < 0.5 });
          }
        }
      }
    }
    buildPCB();
    window.addEventListener('resize', buildPCB);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Draw traces
      ctx.lineWidth = 0.8;
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const alpha = 0.06 + 0.02 * Math.sin(frame * 0.012 + e.a * 0.3);
        ctx.strokeStyle = `rgba(255,0,34,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        if (e.corner) {
          ctx.lineTo(a.x, b.y); // L-shape: vertical then horizontal
          ctx.lineTo(b.x, b.y);
        } else {
          ctx.lineTo(b.x, a.y); // L-shape: horizontal then vertical
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        n.pulse += n.speed;
        const glow  = 0.5 + 0.5 * Math.sin(n.pulse);
        const alpha = n.bright
          ? 0.55 + 0.35 * glow
          : 0.15 + 0.12 * glow;

        if (n.bright) {
          // Glowing hub
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          g.addColorStop(0, `rgba(255,0,34,${alpha})`);
          g.addColorStop(1, 'rgba(255,0,34,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(255,0,34,${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '1';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 2. #galeria — Subtle Matrix / Code Rain
  //    Characters fall slowly, very transparent
  // ══════════════════════════════════════════════════════════════════════════
  function initCodeRain() {
    const section = document.querySelector('.showcase-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, cols, drops = [];
    const CHARS = 'ABCDEF0123456789{}[]<>/\\|_-=+*';
    const anim = { running: false };

    function buildRain() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      const fontSize = isMobile ? 10 : 13;
      cols = Math.floor(W / fontSize);
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * H / fontSize,
        speed: 0.3 + Math.random() * 0.4,
        alpha: 0.02 + Math.random() * 0.04
      }));
      ctx.font = `${fontSize}px 'Courier New', monospace`;
    }
    buildRain();
    window.addEventListener('resize', buildRain);

    let frame = 0;
    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;

      // Fade trail
      ctx.fillStyle = 'rgba(5,5,8,0.06)';
      ctx.fillRect(0, 0, W, H);

      const fontSize = isMobile ? 10 : 13;

      for (let i = 0; i < drops.length; i++) {
        if (frame % 3 !== i % 3) continue; // stagger updates
        const d = drops[i];
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = `rgba(255,0,34,${d.alpha})`;
        ctx.fillText(ch, i * fontSize, d.y * fontSize);

        // Occasional bright head
        if (Math.random() < 0.003) {
          ctx.fillStyle = `rgba(255,150,150,${d.alpha * 3})`;
          ctx.fillText(ch, i * fontSize, d.y * fontSize);
        }

        d.y += d.speed;
        if (d.y * fontSize > H) {
          d.y = 0;
          d.alpha = 0.02 + Math.random() * 0.05;
          d.speed = 0.25 + Math.random() * 0.5;
        }
      }
      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '1';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 3. #agente — Brain Waves / EEG Oscilloscope
  //    Multiple sine waves with different frequencies + glow
  //    Represents: IA neural activity
  // ══════════════════════════════════════════════════════════════════════════
  function initBrainWaves() {
    const section = document.querySelector('.agent-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const anim = { running: false };

    // Wave definitions: [amplitude, frequency, phase, speed, colorR, colorG, colorB, alpha]
    const WAVES = [
      { amp: 0.06, freq: 1.8, phase: 0,    speed: 0.012, r: 255, g: 0,   b: 34,  a: 0.18 },
      { amp: 0.04, freq: 3.5, phase: 1.2,  speed: 0.018, r: 200, g: 0,   b: 80,  a: 0.12 },
      { amp: 0.08, freq: 0.9, phase: 2.4,  speed: 0.008, r: 255, g: 30,  b: 30,  a: 0.10 },
      { amp: 0.03, freq: 6.0, phase: 0.7,  speed: 0.025, r: 180, g: 0,   b: 200, a: 0.08 },
      { amp: 0.05, freq: 2.2, phase: 3.8,  speed: 0.014, r: 255, g: 80,  b: 0,   a: 0.07 },
    ];

    function buildWaves() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
    }
    buildWaves();
    window.addEventListener('resize', buildWaves);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      for (const wave of WAVES) {
        wave.phase += wave.speed;

        // Glow pass (thick, blurred)
        ctx.save();
        ctx.filter = 'blur(8px)';
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(${wave.r},${wave.g},${wave.b},${wave.a * 0.5})`;

        for (let x = 0; x <= W; x += 3) {
          const t  = (x / W) * Math.PI * 2 * wave.freq + wave.phase;
          const y  = H * 0.5 + H * wave.amp * Math.sin(t)
                   + H * wave.amp * 0.4 * Math.sin(t * 2.3 + 1.1)
                   + H * wave.amp * 0.2 * Math.sin(t * 4.7 + 2.2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Sharp pass
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(${wave.r},${wave.g},${wave.b},${wave.a * 1.8})`;
        for (let x = 0; x <= W; x += 2) {
          const t  = (x / W) * Math.PI * 2 * wave.freq + wave.phase;
          const y  = H * 0.5 + H * wave.amp * Math.sin(t)
                   + H * wave.amp * 0.4 * Math.sin(t * 2.3 + 1.1)
                   + H * wave.amp * 0.2 * Math.sin(t * 4.7 + 2.2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Vertical scan line (EEG playhead)
      const scanX = ((frame * 1.2) % W);
      const scanGrad = ctx.createLinearGradient(scanX - 30, 0, scanX + 10, 0);
      scanGrad.addColorStop(0, 'rgba(255,0,34,0)');
      scanGrad.addColorStop(1, 'rgba(255,0,34,0.08)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 30, 0, 40, H);

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '0.9';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 4. #activar-ia — Spiral Data Particles
  //    Particles orbit in DNA-like double helix
  // ══════════════════════════════════════════════════════════════════════════
  function initDNAParticles() {
    const section = document.querySelector('.activar-ia-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const anim = { running: false };
    const COUNT = isMobile ? 30 : 60;

    // Particles ride a double-helix path
    const particles = Array.from({ length: COUNT }, (_, i) => ({
      t:      (i / COUNT) * Math.PI * 2,  // position on helix
      strand: i % 2,                       // 0 or 1 (two strands)
      speed:  0.006 + Math.random() * 0.004,
      size:   1 + Math.random() * 2,
      alpha:  0.3 + Math.random() * 0.5
    }));

    function buildDNA() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
    }
    buildDNA();
    window.addEventListener('resize', buildDNA);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const radius = Math.min(W, H) * 0.3;
      const loops  = 2.5;

      // Draw connecting rungs
      for (let i = 0; i < COUNT; i += 2) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        if (!p2) continue;
        const x1 = cx + Math.cos(p1.t * loops) * radius * 0.6;
        const y1 = H * 0.1 + (H * 0.8) * ((p1.t % (Math.PI * 2)) / (Math.PI * 2));
        const x2 = cx + Math.cos(p2.t * loops + Math.PI) * radius * 0.6;
        const y2 = H * 0.1 + (H * 0.8) * ((p2.t % (Math.PI * 2)) / (Math.PI * 2));

        ctx.strokeStyle = `rgba(255,0,34,0.06)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.t += p.speed;
        const offset = p.strand === 0 ? 0 : Math.PI;
        const x = cx + Math.cos(p.t * loops + offset) * radius * 0.6;
        const y = H * 0.1 + (H * 0.8) * ((p.t % (Math.PI * 2)) / (Math.PI * 2));
        const depth = 0.5 + 0.5 * Math.sin(p.t * loops + offset);

        const alpha = p.alpha * depth;
        const size  = p.size  * depth;

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
        g.addColorStop(0, `rgba(255,0,34,${alpha * 0.6})`);
        g.addColorStop(1, 'rgba(255,0,34,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255,${Math.floor(30 * depth)},${Math.floor(34 * depth)},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Wrap: reset to top when particle falls below bottom
        if (p.t > Math.PI * 2 * 10) p.t -= Math.PI * 2;
      }

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '0.85';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 5. #testimonios — Twinkling star field with shooting stars
  // ══════════════════════════════════════════════════════════════════════════
  function initStarField() {
    const section = document.querySelector('.testimonios-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const anim = { running: false };
    const STAR_COUNT   = isMobile ? 40 : 90;
    const SHOOT_COUNT  = 2;

    let stars = [], shoots = [];

    function buildStars() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      stars  = Array.from({ length: STAR_COUNT }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.03,
        red:   Math.random() < 0.12
      }));
      shoots = Array.from({ length: SHOOT_COUNT }, () => newShooter());
    }

    function newShooter() {
      return {
        x: Math.random() * W,
        y: Math.random() * H * 0.4,
        vx: 3 + Math.random() * 4,
        vy: 1 + Math.random() * 2,
        len: 40 + Math.random() * 60,
        alpha: 0,
        maxA: 0.3 + Math.random() * 0.3,
        life: 0,
        maxLife: 80 + Math.floor(Math.random() * 60)
      };
    }

    buildStars();
    window.addEventListener('resize', buildStars);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        s.phase += s.speed;
        const bright = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.phase));
        const color  = s.red
          ? `rgba(255,100,100,${bright * 0.7})`
          : `rgba(255,255,255,${bright * 0.55})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting stars
      for (let i = 0; i < shoots.length; i++) {
        const s = shoots[i];
        s.life++;
        s.alpha = s.life < 20
          ? (s.life / 20) * s.maxA
          : s.life > s.maxLife - 20
            ? ((s.maxLife - s.life) / 20) * s.maxA
            : s.maxA;
        s.x += s.vx;
        s.y += s.vy;

        const tail = ctx.createLinearGradient(
          s.x - s.vx * (s.len / s.vx), s.y - s.vy * (s.len / s.vx),
          s.x, s.y
        );
        tail.addColorStop(0, `rgba(255,255,255,0)`);
        tail.addColorStop(1, `rgba(255,255,255,${s.alpha})`);

        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * (s.len / s.vx), s.y - s.vy * (s.len / s.vx));
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        if (s.life >= s.maxLife) shoots[i] = newShooter();
      }

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '1';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 6. #roadmap — inject orbiting dot element + constellation JS
  // ══════════════════════════════════════════════════════════════════════════
  function initRoadmap() {
    const section = document.querySelector('.roadmap-section');
    if (!section) return;

    // Inject orbiting dot
    const dot = document.createElement('div');
    dot.className = 'rm-orbit-dot';
    section.insertBefore(dot, section.firstChild);

    // Canvas: constellation star field
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const anim = { running: false };
    const COUNT = isMobile ? 25 : 50;
    let pts = [], conns = [];

    function buildConst() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      pts = Array.from({ length: COUNT }, () => ({
        x: 50 + Math.random() * (W - 100),
        y: 50 + Math.random() * (H - 100),
        r: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.015
      }));
      conns = [];
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 120 && Math.random() < 0.3) {
            conns.push({ i, j, d });
          }
        }
      }
    }
    buildConst();
    window.addEventListener('resize', buildConst);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      for (const co of conns) {
        const a = pts[co.i], b = pts[co.j];
        const alpha = 0.04 + 0.02 * Math.sin(frame * 0.01 + co.i);
        ctx.strokeStyle = `rgba(255,0,34,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const p of pts) {
        p.phase += p.speed;
        const bright = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(p.phase));
        ctx.fillStyle = `rgba(255,${Math.floor(bright * 80)},${Math.floor(bright * 50)},${0.3 + bright * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '0.8';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 7. #gratis — Floating sparkle particles
  // ══════════════════════════════════════════════════════════════════════════
  function initSparkles() {
    const section = document.querySelector('.gratis-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const COUNT = isMobile ? 20 : 45;
    const anim = { running: false };

    let sparks = [];

    function newSpark() {
      return {
        x:     Math.random() * (W || 800),
        y:     (H || 400) + 10,
        vx:    (Math.random() - 0.5) * 1.2,
        vy:   -(0.6 + Math.random() * 1.4),
        r:     1 + Math.random() * 3,
        alpha: 0.4 + Math.random() * 0.5,
        decay: 0.004 + Math.random() * 0.004,
        hue:   Math.random() < 0.3 ? 0 : 40 // red or gold
      };
    }

    function buildSparks() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      sparks = Array.from({ length: COUNT }, newSpark).map(s => {
        s.y = Math.random() * H;
        return s;
      });
    }
    buildSparks();
    window.addEventListener('resize', buildSparks);

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.y < -20) {
          sparks[i] = newSpark();
          continue;
        }

        // Star shape (4-point)
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(frame * 0.02 + i);
        ctx.fillStyle = `hsla(${s.hue},100%,${s.hue === 0 ? 60 : 75}%,${s.alpha})`;
        ctx.beginPath();
        for (let pt = 0; pt < 4; pt++) {
          const angle = (pt / 4) * Math.PI * 2;
          const r     = pt % 2 === 0 ? s.r : s.r * 0.3;
          ctx[pt === 0 ? 'moveTo' : 'lineTo'](
            Math.cos(angle) * r,
            Math.sin(angle) * r
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '0.9';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 8. #nosotros — Floating triangles (tech/geometry feel)
  // ══════════════════════════════════════════════════════════════════════════
  function initAboutGeo() {
    const section = document.querySelector('.about-section');
    if (!section) return;
    const c = mkCanvas(section);
    const ctx = c.getContext('2d');
    let W, H, frame = 0;
    const anim = { running: false };
    const COUNT = isMobile ? 8 : 16;

    let tris = [];

    function buildTris() {
      W = c.width  = section.offsetWidth;
      H = c.height = section.offsetHeight;
      tris = Array.from({ length: COUNT }, () => ({
        x:    Math.random() * W,
        y:    Math.random() * H,
        size: 20 + Math.random() * 50,
        rot:  Math.random() * Math.PI * 2,
        vx:   (Math.random() - 0.5) * 0.3,
        vy:  -(0.1 + Math.random() * 0.25),
        vr:   (Math.random() - 0.5) * 0.005,
        alpha: 0.03 + Math.random() * 0.05,
        filled: Math.random() < 0.3
      }));
    }
    buildTris();
    window.addEventListener('resize', buildTris);

    function drawTri(x, y, size, rot, alpha, filled) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * size, Math.sin(a) * size);
      }
      ctx.closePath();
      if (filled) {
        ctx.fillStyle = `rgba(255,0,34,${alpha * 0.5})`;
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(255,0,34,${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    function drawFrame() {
      if (!anim.running) { requestAnimationFrame(drawFrame); return; }
      frame++;
      ctx.clearRect(0, 0, W, H);

      for (const t of tris) {
        t.x  += t.vx;
        t.y  += t.vy;
        t.rot += t.vr;
        if (t.y + t.size < 0) { t.y = H + t.size; t.x = Math.random() * W; }
        drawTri(t.x, t.y, t.size, t.rot, t.alpha, t.filled);
      }
      requestAnimationFrame(drawFrame);
    }

    observeSection(section, () => {
      c.style.opacity = '0.85';
      anim.running = true;
      drawFrame();
    });
    pauseWhenHidden(section, () => anim);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // INIT ALL
  // ══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    initPCB();          // servicios  — circuit board
    initCodeRain();     // galeria    — matrix code
    initBrainWaves();   // agente     — EEG waves
    initDNAParticles(); // activar-ia — DNA helix
    initStarField();    // testimonios— shooting stars
    initRoadmap();      // roadmap    — constellation
    initSparkles();     // gratis     — sparkles
    initAboutGeo();     // nosotros   — floating triangles
  });

})();
