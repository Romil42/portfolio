/* ============================================================
   ROMIL BANSAL — main.js
   Step 3: Three.js 3D scene + GSAP scroll animations
   + typewriter + tilt cards + nav interactions
   ============================================================ */

/* ── 1. THREE.JS BACKGROUND ── */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 6);

  /* --- particles --- */
  const COUNT   = 1800;
  const SPREAD  = 28;
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);

  // Two-color palette: lime #C8F135 and soft chalk #F0EDE6
  const limeCOL  = new THREE.Color('#C8F135');
  const chalkCOL = new THREE.Color('#F0EDE6');
  const coralCOL = new THREE.Color('#FF4D2E');

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;

    const r = Math.random();
    const col = r < 0.08 ? coralCOL : r < 0.22 ? limeCOL : chalkCOL;
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);

  /* --- connecting lines (sparse grid feel) --- */
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x2b2b2b,
    transparent: true,
    opacity: 0.35,
  });

  // 40 random short line segments for a circuit-board vibe
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * SPREAD;
    const y = (Math.random() - 0.5) * SPREAD;
    const z = (Math.random() - 0.5) * SPREAD;
    const len = 0.4 + Math.random() * 1.2;
    const axis = Math.floor(Math.random() * 3);

    const pts = [
      new THREE.Vector3(x, y, z),
      axis === 0 ? new THREE.Vector3(x + len, y, z)
        : axis === 1 ? new THREE.Vector3(x, y + len, z)
        : new THREE.Vector3(x, y, z + len),
    ];

    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    scene.add(new THREE.Line(lineGeo, lineMat));
  }

  /* --- mouse parallax target --- */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* --- render loop --- */
  function animate() {
    requestAnimationFrame(animate);

    // slow auto-rotation
    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.00012;

    // smooth mouse parallax on camera
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    camera.rotation.y = currentX;
    camera.rotation.x = -currentY;

    // subtle scroll-based camera drift
    camera.position.y = -window.scrollY * 0.0012;

    renderer.render(scene, camera);
  }

  animate();

  /* --- resize --- */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


/* ── 2. TYPEWRITER ── */
(function initTyped() {
  const el = document.getElementById('typed');
  if (!el) return;

  const phrases = [
    'ML Engineer',
    'Full Stack Dev',
    'Computer Vision',
    'Data Science',
    'Problem Solver',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let wait      = 0;

  function tick() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        wait = 1800; // pause before deleting
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        wait = 400;
      }
    }

    const speed = deleting ? 55 : 95;
    setTimeout(tick, wait || speed);
    wait = 0;
  }

  tick();
})();


/* ── 3. GSAP SCROLL ANIMATIONS ── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* skill bars — animate width when #skills enters view */
  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.skill-bar').forEach((bar) => {
        const w = bar.getAttribute('data-width') || '0';
        bar.style.width = w + '%';
      });
    },
  });

  /* project cards stagger */
  gsap.from('.project-card', {
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 72%',
      once: true,
    },
  });

  /* timeline cards slide in */
  gsap.from('.timeline-card', {
    x: -40,
    opacity: 0,
    duration: 0.65,
    stagger: 0.18,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#experience',
      start: 'top 72%',
      once: true,
    },
  });

  /* skill categories */
  gsap.from('.skill-category', {
    y: 30,
    opacity: 0,
    duration: 0.55,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 72%',
      once: true,
    },
  });

  /* about section */
  gsap.from('.about-grid', {
    y: 40,
    opacity: 0,
    duration: 0.75,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 75%',
      once: true,
    },
  });

  /* stats counter animation */
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      document.querySelectorAll('.stat-num').forEach((el) => {
        const target = el.textContent.replace(/[^0-9]/g, '');
        const suffix = el.textContent.replace(/[0-9]/g, '').replace('K', 'K+').includes('K+') ? 'K+' : el.textContent.replace(/[0-9.]/g, '');
        if (!target) return;
        const num = parseInt(target, 10);
        let current = 0;
        const step = Math.ceil(num / 40);
        const timer = setInterval(() => {
          current = Math.min(current + step, num);
          el.textContent = current + suffix;
          if (current >= num) clearInterval(timer);
        }, 30);
      });
    },
  });

  /* contact cards */
  gsap.from('.contact-card', {
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.09,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%',
      once: true,
    },
  });
})();


/* ── 4. GENERIC REVEAL OBSERVER ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-group');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach((el) => obs.observe(el));
})();


/* ── 5. 3D CARD TILT ── */
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(900px)
        rotateY(${x * 12}deg)
        rotateX(${-y * 10}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    });
  });
})();


/* ── 6. NAVBAR ── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');
  const burger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  /* shrink on scroll */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* active link on scroll */
  const sections = document.querySelectorAll('section[id]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach((s) => obs.observe(s));

  /* smooth scroll */
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      navLinks.classList.remove('open');
    });
  });

  /* hamburger toggle */
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
})();


/* ── 7. CURSOR GLOW (desktop only) ── */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(200,241,53,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateGlow() {
    gx += (mx - gx) * 0.1;
    gy += (my - gy) * 0.1;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
})();