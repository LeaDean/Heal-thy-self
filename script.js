// script.js - Healthy Self orbiting satellites + misty center text reveal

const satellites = document.querySelectorAll('.satellite');
const container = document.querySelector('.container');
const centerText = document.querySelector('#centerText');

const baseSpeed = 360 / 15;           // ~15s per full rotation
const slowSpeed = baseSpeed / 1.67;   // slower on hover
const verySlowSpeed = baseSpeed / 2.67; // very slow after delay

let currentSpeed = baseSpeed;
let hoverTimeout;
let lastTime = performance.now();

// Phrase mapping
const wordToPhrase = {
    'Energy': 'Boost Your Drive',
    'Focus': 'Sharpen Your Mind',
    'Purpose': 'Is purpose important?',
    'Strength': 'Build Resilience',
    'Peace': 'Inner Peace',
    'Clarity': 'Removing Doubt',
    'Harmony': 'Live in Sync',
    'Vitality': 'Thrive with Vigor',
    'Joy': 'Spark Happiness',
    'Growth': 'Evolve Every Day',
    'Challenges': 'Lessons from conflict'
};

// Set starting angles
satellites.forEach(satellite => {
    const angleOffset = parseFloat(satellite.dataset.angleOffset);
    satellite.angle = angleOffset;
});

// Main animation loop
// Add near the top of animate() function
function animate() {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    // Very gentle continuous zoom-in effect
    const zoom = 1 + Math.sin(now * 0.00008) * 0.03; // tiny oscillation
    container.style.transform = `scale(${zoom})`;

    // ... rest of your animation code ...
}
function animate() {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    satellites.forEach(satellite => {
        satellite.angle += currentSpeed * deltaTime;
        satellite.angle %= 360;

        const radius = window.innerWidth <= 480 ? 100 : 250;
        satellite.style.transform = `rotate(${satellite.angle}deg) translateX(${radius}px)`;

        const text = satellite.querySelector('.satellite-text');
        if (text) {
            text.style.transform = `translate(-50%, -50%) rotate(-${satellite.angle}deg)`;
        }
    });

    requestAnimationFrame(animate);
}

// Start orbiting
requestAnimationFrame(animate);

// Interaction handlers for each satellite
satellites.forEach(satellite => {
    // Mouse enter / hover start
    satellite.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        currentSpeed = slowSpeed;

        const word = satellite.querySelector('.satellite-text').textContent;
        centerText.textContent = wordToPhrase[word] || '';

        // Reset mist effect (important part!)
        centerText.style.transition = 'none';
        centerText.offsetHeight; // force browser reflow → resets blur/scale/opacity
        centerText.style.transition = ''; // restore smooth transition

        centerText.classList.add('show');

        hoverTimeout = setTimeout(() => {
            currentSpeed = verySlowSpeed;
        }, 2000);
    });

    // Mouse leave
    satellite.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        currentSpeed = baseSpeed;
        centerText.classList.remove('show');
        centerText.textContent = '';

        // Optional: also reset for next hover
        centerText.style.transition = 'none';
        centerText.offsetHeight;
        centerText.style.transition = '';
    });

    // Click to navigate
    satellite.addEventListener('click', () => {
        const href = satellite.dataset.href;
        if (href) window.location.href = href;
    });

    // Touch start (mobile)
    satellite.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clearTimeout(hoverTimeout);
        currentSpeed = slowSpeed;

        const word = satellite.querySelector('.satellite-text').textContent;
        centerText.textContent = wordToPhrase[word] || '';

        // Reset mist effect for fresh reveal on touch
        centerText.style.transition = 'none';
        centerText.offsetHeight;
        centerText.style.transition = '';

        centerText.classList.add('show');

        hoverTimeout = setTimeout(() => {
            currentSpeed = verySlowSpeed;
        }, 2000);
    });

    // Touch end
    satellite.addEventListener('touchend', () => {
        clearTimeout(hoverTimeout);
        currentSpeed = baseSpeed;
        centerText.classList.remove('show');
        centerText.textContent = '';

        // Reset mist
        centerText.style.transition = 'none';
        centerText.offsetHeight;
        centerText.style.transition = '';

        const href = satellite.dataset.href;
        if (href) window.location.href = href;
    });
});

