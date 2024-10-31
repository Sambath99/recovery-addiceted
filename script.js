import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBfSY_sXBBvY6ehmUtoSTbRvmFz0zpInK8";
const genAI = new GoogleGenerativeAI(API_KEY);

// Create custom canvas background effect instead of particles.js
const canvas = document.createElement('canvas');
canvas.id = 'particles-js';
document.body.insertBefore(canvas, document.body.firstChild);

const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Custom particle class
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 15 + 5;
        this.baseSize = this.size;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.baseSpeedX = this.speedX;
        this.baseSpeedY = this.speedY;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        this.hue = Math.random() * 60 + 240;
        this.trail = [];
        this.trailLength = Math.floor(Math.random() * 10) + 5;
        this.shape = Math.random() > 0.5 ? 'triangle' : 'diamond';
        this.opacity = Math.random() * 0.5 + 0.3;
        this.attracted = false;
    }

    update() {
        // Mouse attraction/repulsion effect
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                const force = (mouseRadius - distance) / mouseRadius;
                
                if (mouse.pressed) {
                    // Attraction when mouse is pressed
                    this.speedX += dx * force * 0.02;
                    this.speedY += dy * force * 0.02;
                    this.size = this.baseSize * (1 + force);
                    this.attracted = true;
                } else {
                    // Repulsion when mouse is just moving
                    this.speedX -= dx * force * 0.02;
                    this.speedY -= dy * force * 0.02;
                    this.size = this.baseSize * (1 - force * 0.5);
                    this.attracted = false;
                }
                
                // Add glow effect
                this.opacity = Math.min(1, this.opacity + force * 0.5);
            } else {
                // Return to normal state
                this.speedX = this.speedX * 0.95 + this.baseSpeedX * 0.05;
                this.speedY = this.speedY * 0.95 + this.baseSpeedY * 0.05;
                this.size = this.size * 0.95 + this.baseSize * 0.05;
                this.opacity = this.opacity * 0.95 + 0.3 * 0.05;
                this.attracted = false;
            }
        }

        // Update trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.pop();
        }

        // Update position with speed limiting
        const maxSpeed = 10;
        this.speedX = Math.max(Math.min(this.speedX, maxSpeed), -maxSpeed);
        this.speedY = Math.max(Math.min(this.speedY, maxSpeed), -maxSpeed);
        
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        // Bounce off edges with damping
        if (this.x < 0 || this.x > canvas.width) {
            this.speedX *= -0.8;
            this.x = this.x < 0 ? 0 : canvas.width;
        }
        if (this.y < 0 || this.y > canvas.height) {
            this.speedY *= -0.8;
            this.y = this.y < 0 ? 0 : canvas.height;
        }
    }

    draw() {
        this.trail.forEach((pos, index) => {
            const opacity = (this.trail.length - index) / this.trail.length * this.opacity;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.rotation);
            
            // Change color based on attraction state
            const hue = this.attracted ? (this.hue + 120) % 360 : this.hue;
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${opacity})`;
            
            if (this.shape === 'triangle') {
                this.drawTriangle(this.size * (1 - index / this.trail.length));
            } else {
                this.drawDiamond(this.size * (1 - index / this.trail.length));
            }
            
            ctx.restore();
        });
    }

    drawTriangle(size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6));
        ctx.lineTo(-size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    drawDiamond(size) {
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
    }
}

// Mouse interaction setup
let mouse = { x: null, y: null, pressed: false };
let mouseRadius = 150;

// Mouse event listeners
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

canvas.addEventListener('mousedown', () => {
    mouse.pressed = true;
});

canvas.addEventListener('mouseup', () => {
    mouse.pressed = false;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    mouse.pressed = false;
});

// Touch event listeners for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mouse.pressed = true;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

canvas.addEventListener('touchend', () => {
    mouse.pressed = false;
});

// Create particles
const particles = Array.from({ length: 30 }, () => new Particle());

// Animation loop
function animate() {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0b0b3b');
    gradient.addColorStop(1, '#3a0b5c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Initialize local storage data
let data = {
    startDate: localStorage.getItem('startDate') || null,
    dayCount: parseInt(localStorage.getItem('dayCount')) || 0
};

// Get DOM elements
const dayCountElement = document.getElementById('dayCount');
const startDateElement = document.getElementById('startDate');
const motivationElement = document.getElementById('motivationText');
const countButton = document.getElementById('countButton');

// Update UI with stored data
function updateUI() {
    if (dayCountElement) dayCountElement.textContent = data.dayCount;
    if (startDateElement) {
        startDateElement.textContent = data.startDate ? 
            `Started: ${new Date(data.startDate).toLocaleDateString()}` : 
            'Not started yet';
    }
    updateAchievements();
}

// Update achievements
function updateAchievements() {
    document.querySelectorAll('.milestone').forEach(milestone => {
        const requiredDays = parseInt(milestone.dataset.days);
        if (data.dayCount >= requiredDays) {
            milestone.classList.add('achieved');
        }
    });
}

// Get motivation from Gemini AI
async function getMotivation() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Give me a short (1-2 sentences) motivational message for someone who has been clean from porn addiction for ${data.dayCount} days. Make it encouraging and positive.`;
        
        if (motivationElement) {
            motivationElement.textContent = "Getting your motivation...";
            const result = await model.generateContent(prompt);
            motivationElement.textContent = result.response.text();
        }
    } catch (error) {
        console.error('Error getting motivation:', error);
        if (motivationElement) {
            motivationElement.textContent = "Stay strong! Every day is a victory.";
        }
    }
}

// Handle button click
countButton.addEventListener('click', async () => {
    if (!data.startDate) {
        data.startDate = new Date().toISOString();
        data.dayCount = 1;
    } else {
        data.dayCount += 1;
    }
    
    localStorage.setItem('startDate', data.startDate);
    localStorage.setItem('dayCount', data.dayCount);
    
    updateUI();
    await getMotivation(); // Generate motivation only when button is clicked
});

// Initial UI update - without motivation
updateUI();

// Set initial motivation text
if (motivationElement) {
    motivationElement.textContent = "Click 'Count New Day' to start your journey...";
} 