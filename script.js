/* ================================================================
   script.js  —  index.html only
   Star field + satellite orbit
   ================================================================ */

(function () {
    'use strict';

    // ── Star field ───────────────────────────────────────────────
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const STAR_COUNT = 100;
    const SPEED = 0.012;
    let stars = [], W, H;
    let starRafId = null;

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.0 + 0.3,
                a: Math.random() * 0.5 + 0.1,
                dx: (Math.random() - 0.5) * SPEED,
                dy: (Math.random() - 0.5) * SPEED,
            });
        }
    }

    function drawStars(time) {
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,230,255,${s.a})`;
            ctx.fill();
            s.x = (s.x + s.dx + W) % W;
            s.y = (s.y + s.dy + H) % H;
        }
        starRafId = requestAnimationFrame(drawStars);
    }

    function startStars() {
        if (starRafId !== null) return;
        starRafId = requestAnimationFrame(drawStars);
    }

    function stopStars() {
        if (starRafId !== null) {
            cancelAnimationFrame(starRafId);
            starRafId = null;
        }
    }

    // ── Orbit ────────────────────────────────────────────────────
    const satellites  = document.querySelectorAll('.satellite');
    const centerText  = document.getElementById('centerText');
    const hasSats     = satellites.length > 0;

    const BASE_SPEED  = 360 / 15;
    const SLOW_SPEED  = BASE_SPEED / 1.67;
    const VSLOW_SPEED = BASE_SPEED / 2.67;

    let currentSpeed = BASE_SPEED;
    let hoverTimeout = null;
    let lastTime     = 0;
    let orbitRafId   = null;

    const wordToPhrase = {
        'Energy':     'Boost Your Drive',
        'Focus':      'Sharpen Your Mind',
        'Purpose':    'Is purpose important?',
        'Strength':   'Build Resilience',
        'Peace':      'Inner Peace',
        'Clarity':    'Removing Doubt',
        'Harmony':    'Live in Sync',
        'Vitality':   'Thrive with Vigor',
        'Joy':        'Spark Happiness',
        'Growth':     'Evolve Every Day',
        'Challenges': 'Lessons from conflict'
    };

    let radius = window.innerWidth <= 480 ? 130 : window.innerWidth <= 768 ? 150 : 250;

    // Detect touch device — disables hover text on mobile
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (hasSats) {
        satellites.forEach(sat => {
            sat.angle = parseFloat(sat.dataset.angleOffset) || 0;
        });
    }

    function animateOrbit(timestamp) {
        if (lastTime === 0) lastTime = timestamp;
        const delta = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        satellites.forEach(sat => {
            sat.angle = (sat.angle + currentSpeed * delta) % 360;
            sat.style.transform = `rotate(${sat.angle}deg) translateX(${radius}px)`;
            const txt = sat.querySelector('.satellite-text');
            if (txt) txt.style.transform = `translate(-50%,-50%) rotate(-${sat.angle}deg)`;
        });

        orbitRafId = requestAnimationFrame(animateOrbit);
    }

    function startOrbit() {
        if (!hasSats) return;
        if (orbitRafId !== null) return;
        lastTime = 0;
        orbitRafId = requestAnimationFrame(animateOrbit);
    }

    function stopOrbit() {
        if (orbitRafId !== null) {
            cancelAnimationFrame(orbitRafId);
            orbitRafId = null;
        }
    }

    // ── Visibility — pause both loops when tab hidden ────────────
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopStars();
            stopOrbit();
        } else {
            startStars();
            startOrbit();
        }
    });

    // ── Resize ───────────────────────────────────────────────────
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            initStars();
            radius = window.innerWidth <= 480 ? 130 : window.innerWidth <= 768 ? 150 : 250;
        }, 150);
    });

    // ── Mist helper ──────────────────────────────────────────────
    function resetMist() {
        if (!centerText) return;
        centerText.style.transition = 'none';
        centerText.offsetHeight;
        centerText.style.transition = '';
    }

    // ── Satellite interactions ───────────────────────────────────
    if (hasSats && centerText) {
        satellites.forEach(sat => {
            const label = sat.querySelector('.satellite-text');

            // Mouse hover — desktop only, skipped on touch devices
            if (!isTouch) {
                sat.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    currentSpeed = SLOW_SPEED;
                    centerText.textContent = wordToPhrase[label?.textContent] || '';
                    resetMist();
                    centerText.classList.add('show');
                    hoverTimeout = setTimeout(() => { currentSpeed = VSLOW_SPEED; }, 2000);
                });

                sat.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimeout);
                    currentSpeed = BASE_SPEED;
                    centerText.classList.remove('show');
                    centerText.textContent = '';
                    resetMist();
                });

                sat.addEventListener('click', () => {
                    if (sat.dataset.href) window.location.href = sat.dataset.href;
                });
            }

            // Touch — navigate directly, no center text
            sat.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (sat.dataset.href) window.location.href = sat.dataset.href;
            }, { passive: false });

        });
    }

    // ── Nav scroll fade ──────────────────────────────────────────
    const navLinks = document.querySelector('.links');
    const navTitle = document.querySelector('.title');
    const FADE_AFTER = 80;
    let scrollTicking = false;

    function updateNav() {
        const hidden = window.scrollY > FADE_AFTER;
        if (navLinks) navLinks.classList.toggle('nav-hidden', hidden);
        if (navTitle) navTitle.classList.toggle('nav-hidden', hidden);
        scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateNav);
            scrollTicking = true;
        }
    }, { passive: true });

    // ── Start everything ─────────────────────────────────────────
    resizeCanvas();
    initStars();
    startStars();
    startOrbit();

})();

// Injected separately — burger menu (runs on index.html)
(function () {
    const burger     = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', () => {
        const isOpen = burger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
})();
