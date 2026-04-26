// DeepCore — Three.js 3D Hero Scene
// Neural network of floating nodes that responds to mouse movement

(function () {
  'use strict';

  let renderer, scene, camera, group, lineMat, animId;
  let mouseX = 0, mouseY = 0;
  let targetRotY = 0, targetRotX = 0;
  let currentRotY = 0, currentRotX = 0;
  let canvas, W, H;

  const NODE_COUNT  = 72;
  const CONN_DIST   = 38;
  const BASE_ROTATE_Y = 0.0008;
  const BASE_ROTATE_X = 0.0003;

  function init() {
    if (typeof THREE === 'undefined') return;

    canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    // Disable 2D canvas from script.js — we own it now
    canvas._deepcore3d = true;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);
    camera.position.z = 140;

    // ── Build node positions ──
    const nodePos = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Distribute on a squished sphere
      const u     = Math.random();
      const v     = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      const r     = 38 + Math.random() * 28;
      nodePos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.55,
        r * Math.cos(phi) * 0.45
      );
    }

    // ── Edges (connect nearby nodes) ──
    const edgeVerts = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const xi = nodePos[i * 3], yi = nodePos[i * 3 + 1], zi = nodePos[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = xi - nodePos[j * 3];
        const dy = yi - nodePos[j * 3 + 1];
        const dz = zi - nodePos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < CONN_DIST * CONN_DIST) {
          edgeVerts.push(xi, yi, zi, nodePos[j * 3], nodePos[j * 3 + 1], nodePos[j * 3 + 2]);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgeVerts, 3));
    lineMat = new THREE.LineBasicMaterial({ color: 0xFF1133, transparent: true, opacity: 0.13 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);

    // ── Points ──
    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));

    // Vary sizes
    const sizes = new Float32Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) sizes[i] = 1.2 + Math.random() * 2.2;
    pointGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const pointMat = new THREE.PointsMaterial({
      color: 0xFF2244, size: 2, transparent: true, opacity: 0.55,
      sizeAttenuation: true
    });
    const points = new THREE.Points(pointGeo, pointMat);

    // ── Hub nodes (brighter, bigger) ──
    const hubPos = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      if (Math.random() < 0.1) {
        hubPos.push(nodePos[i * 3], nodePos[i * 3 + 1], nodePos[i * 3 + 2]);
      }
    }
    const hubGeo = new THREE.BufferGeometry();
    hubGeo.setAttribute('position', new THREE.Float32BufferAttribute(hubPos, 3));
    const hubMat = new THREE.PointsMaterial({
      color: 0xFF0022, size: 4, transparent: true, opacity: 0.85,
      sizeAttenuation: true
    });
    const hubs = new THREE.Points(hubGeo, hubMat);

    // ── Distant particle field ──
    const bgCount = 120;
    const bgPos   = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      bgPos[i * 3]     = (Math.random() - 0.5) * 280;
      bgPos[i * 3 + 1] = (Math.random() - 0.5) * 180;
      bgPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.14 });
    const bgPoints = new THREE.Points(bgGeo, bgMat);

    group = new THREE.Group();
    group.add(lines, points, hubs);
    scene.add(group, bgPoints);

    resize();
    window.addEventListener('resize', resize);

    // Mouse handler — only on hero section
    document.addEventListener('mousemove', onMouse);

    animate(0);
  }

  function resize() {
    if (!canvas || !renderer || !camera) return;
    const parent = canvas.parentElement || document.body;
    W = parent.clientWidth;
    H = parent.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function onMouse(e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }

  let frame = 0;
  function animate(t) {
    animId = requestAnimationFrame(animate);
    frame++;

    // Slow auto-rotation
    targetRotY = mouseX * 0.4 + frame * BASE_ROTATE_Y;
    targetRotX = mouseY * 0.25 + frame * BASE_ROTATE_X;

    // Lerp toward target (smooth follow)
    currentRotY += (targetRotY - currentRotY) * 0.025;
    currentRotX += (targetRotX - currentRotX) * 0.025;

    if (group) {
      group.rotation.y = currentRotY;
      group.rotation.x = currentRotX;
    }

    // Pulse line opacity
    if (lineMat) {
      lineMat.opacity = 0.10 + 0.05 * Math.sin(frame * 0.025);
    }

    renderer.render(scene, camera);
  }

  // Init after Three.js is available (it loads async)
  function tryInit() {
    if (typeof THREE !== 'undefined') {
      init();
    } else {
      setTimeout(tryInit, 100);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Short delay to let Three.js script execute
    setTimeout(tryInit, 80);
  });
})();
