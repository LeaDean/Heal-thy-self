// ── Lightweight star field ──────────────────────────────────────────
(function () {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const STAR_COUNT = 120;
    const SPEED = 0.012;
    let stars = [], W, H;
    let starRafId = null;
    let paused = false;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x:            Math.random() * W,
                y:            Math.random() * H,
                r:            Math.random() * 1.2 + 0.3,
                alpha:        Math.random() * 0.55 + 0.08,
                twinkleSpeed: Math.random() * 0.015 + 0.004,
                twinklePhase: Math.random() * Math.PI * 2,
                dx:           (Math.random() - 0.5) * SPEED,
                dy:           (Math.random() - 0.5) * SPEED,
            });
        }
    }

    function draw(time) {
        if (paused) return;
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
            const a = Math.max(0, Math.min(1,
                s.alpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.18));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 230, 255, ${a})`;
            ctx.fill();
            s.x = (s.x + s.dx + W) % W;
            s.y = (s.y + s.dy + H) % H;
        }
        starRafId = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            paused = true;
            if (starRafId) { cancelAnimationFrame(starRafId); starRafId = null; }
        } else {
            paused = false;
            starRafId = requestAnimationFrame(draw);
        }
    });

    window.addEventListener('resize', () => { resize(); initStars(); });
    resize();
    initStars();
    starRafId = requestAnimationFrame(draw);
})();

// ── Nav links scroll fade ────────────────────────────────────────────
(function () {
    const links = document.querySelector('.links');
    if (!links) return;

    const FADE_AFTER = 80;
    let ticking = false;

    function update() {
        if (window.scrollY > FADE_AFTER) {
            links.classList.add('nav-hidden');
        } else {
            links.classList.remove('nav-hidden');
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
})();
