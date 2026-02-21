/* ================================================================
   content-script.js  —  all pages except index.html
   Star field + nav fade only
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

    function drawStars() {
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

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { stopStars(); } else { startStars(); }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resizeCanvas(); initStars(); }, 150);
    });

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

    // ── Start ────────────────────────────────────────────────────
    resizeCanvas();
    initStars();
    startStars();

})();
