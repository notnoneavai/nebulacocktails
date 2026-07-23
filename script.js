/* ==========================================================================
   NEBULA COCKTAILS - Fullscreen 100vh Snap Navigation & Ambient Smoke
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dry Ice Smoke Canvas Ambient Effect
  const canvas = document.getElementById('smokeCanvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });

  class SmokeParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.radius = Math.random() * 120 + 60;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.alpha = Math.random() * 0.09 + 0.02;
      this.maxAlpha = this.alpha;
      this.life = 0;
      this.maxLife = Math.random() * 320 + 220;
      // Dark crimson red color spectrum variations
      const hue = Math.floor(Math.random() * 20 + 345);
      this.color = `hsla(${hue}, 80%, 35%, `;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      if (this.life < 60) {
        this.alpha = (this.life / 60) * this.maxAlpha;
      } else if (this.life > this.maxLife - 60) {
        this.alpha = ((this.maxLife - this.life) / 60) * this.maxAlpha;
      }

      if (this.life >= this.maxLife || this.y < -150) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, `${this.color}${this.alpha})`);
      gradient.addColorStop(0.5, `rgba(120, 0, 25, ${this.alpha * 0.25})`);
      gradient.addColorStop(1, 'rgba(5, 0, 2, 0)');

      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Dark Crimson Embers / Subtle Party Sparkles
  class PartyEmber {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.size = Math.random() * 2 + 0.8;
      this.speedY = Math.random() * 1.0 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset();
    }

    draw() {
      ctx.save();
      ctx.fillStyle = `rgba(210, 70, 95, ${this.opacity * 0.7})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const particles = [];
  for (let i = 0; i < 28; i++) {
    particles.push(new SmokeParticle());
  }

  const embers = [];
  for (let i = 0; i < 35; i++) {
    embers.push(new PartyEmber());
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    embers.forEach((e) => {
      e.update();
      e.draw();
    });
    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // 2. Smart Animated Navbar (Scroll direction, idle fade, Section 1 always visible)
  const navbarContainer = document.querySelector('.pill-navbar-container');
  const sections = document.querySelectorAll('.snap-section');
  const navLinks = document.querySelectorAll('.nav-link');
  let lastScrollY = window.scrollY;
  let idleTimeout = null;

  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    const heroSection = document.getElementById('hero');
    const heroHeight = heroSection ? heroSection.offsetHeight - 120 : 450;

    // Active Navbar Link Highlight
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (currentScrollY >= sectionTop - window.innerHeight / 3) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Clear idle timeout on scroll event
    if (idleTimeout) clearTimeout(idleTimeout);

    // RULE 1: Section 1 (Hero) -> ALWAYS VISIBLE
    if (currentScrollY < heroHeight) {
      if (navbarContainer) navbarContainer.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // RULE 2: Scrolling DOWN -> Hide Navbar
    if (currentScrollY > lastScrollY + 5) {
      if (navbarContainer) navbarContainer.classList.add('nav-hidden');
    }
    // RULE 3: Scrolling UP -> Show Navbar & start idle timer to hide smoothly if still
    else if (currentScrollY < lastScrollY - 5) {
      if (navbarContainer) navbarContainer.classList.remove('nav-hidden');

      // RULE 4: Idle fade out after 2.5 seconds of no scrolling
      idleTimeout = setTimeout(() => {
        if (window.scrollY > heroHeight && navbarContainer) {
          navbarContainer.classList.add('nav-hidden');
        }
      }, 2500);
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
});
