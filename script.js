// ── Lightweight star field ──────────────────────────────────────────
(function () {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return; // safety guard — exit if no canvas on page

    const ctx = canvas.getContext('2d');
    const STAR_COUNT = 120;       // reduced from 160
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
        if (paused) return;                    // stop drawing when tab hidden
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

    // Pause when tab is hidden — major crash/battery fix
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
// ────────────────────────────────────────────────────────────────────


// ── Orbiting satellites (index.html only) ───────────────────────────
(function () {
    const satellites = document.querySelectorAll('.satellite');
    if (!satellites.length) return; // exit cleanly on non-orbit pages

    const container  = document.querySelector('.container');
    const centerText = document.querySelector('#centerText');

    const baseSpeed     = 360 / 15;
    const slowSpeed     = baseSpeed / 1.67;
    const verySlowSpeed = baseSpeed / 2.67;

    let currentSpeed = baseSpeed;
    let hoverTimeout;
    let lastTime     = performance.now();
    let orbitRafId   = null;
    let orbitPaused  = false;

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

    // Cache radius — recalculate only on resize, not every frame
    let radius = window.innerWidth <= 480 ? 100 : 250;
    window.addEventListener('resize', () => {
        radius = window.innerWidth <= 480 ? 100 : 250;
    });

    satellites.forEach(sat => {
        sat.angle = parseFloat(sat.dataset.angleOffset);
    });

    function animate() {
        if (orbitPaused) return;

        const now       = performance.now();
        const deltaTime = (now - lastTime) / 1000;
        lastTime        = now;

        satellites.forEach(sat => {
            sat.angle = (sat.angle + currentSpeed * deltaTime) % 360;
            sat.style.transform = `rotate(${sat.angle}deg) translateX(${radius}px)`;

            const text = sat.querySelector('.satellite-text');
            if (text) {
                text.style.transform = `translate(-50%, -50%) rotate(-${sat.angle}deg)`;
            }
        });

        orbitRafId = requestAnimationFrame(animate);
    }

    // Pause orbit when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            orbitPaused = true;
            if (orbitRafId) { cancelAnimationFrame(orbitRafId); orbitRafId = null; }
        } else {
            orbitPaused = false;
            lastTime    = performance.now(); // reset to avoid deltaTime spike on resume
            orbitRafId  = requestAnimationFrame(animate);
        }
    });

    orbitRafId = requestAnimationFrame(animate);

    // ── Mist helper ─────────────────────────────────────────────────
    function resetMist() {
        centerText.style.transition = 'none';
        centerText.offsetHeight;
        centerText.style.transition = '';
    }

    // ── Interaction handlers ─────────────────────────────────────────
    satellites.forEach(sat => {

        sat.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            currentSpeed = slowSpeed;
            centerText.textContent = wordToPhrase[sat.querySelector('.satellite-text').textContent] || '';
            resetMist();
            centerText.classList.add('show');
            hoverTimeout = setTimeout(() => { currentSpeed = verySlowSpeed; }, 2000);
        });

        sat.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            currentSpeed = baseSpeed;
            centerText.classList.remove('show');
            centerText.textContent = '';
            resetMist();
        });

        sat.addEventListener('click', () => {
            const href = sat.dataset.href;
            if (href) window.location.href = href;
        });

        sat.addEventListener('touchstart', (e) => {
            e.preventDefault();
            clearTimeout(hoverTimeout);
            currentSpeed = slowSpeed;
            centerText.textContent = wordToPhrase[sat.querySelector('.satellite-text').textContent] || '';
            resetMist();
            centerText.classList.add('show');
            hoverTimeout = setTimeout(() => { currentSpeed = verySlowSpeed; }, 2000);
        }, { passive: false });

        sat.addEventListener('touchend', () => {
            clearTimeout(hoverTimeout);
            currentSpeed = baseSpeed;
            centerText.classList.remove('show');
            centerText.textContent = '';
            resetMist();
            const href = sat.dataset.href;
            if (href) window.location.href = href;
        });
    });

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
