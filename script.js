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
      // Built once at full strength; draw() applies the real alpha via
      // ctx.globalAlpha instead of rebuilding this gradient every frame.
      this.gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      this.gradient.addColorStop(0, `hsla(${hue}, 80%, 35%, 1)`);
      this.gradient.addColorStop(0.5, 'rgba(120, 0, 25, 0.25)');
      this.gradient.addColorStop(1, 'rgba(5, 0, 2, 0)');
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
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.fillStyle = this.gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
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

  let rafId = null;

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
    rafId = requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // Stop burning CPU/battery on a tab nobody is looking at.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animateCanvas();
    }
  });

  // 2. Smart Animated Navbar (Scroll direction, idle fade, Section 1 always visible)
  const navbarContainer = document.querySelector('.pill-navbar-container');
  const sections = document.querySelectorAll('.snap-section');
  const navLinks = document.querySelectorAll('.nav-link');
  let lastScrollY = window.scrollY;
  let idleTimeout = null;

  // Only the very top of the page guarantees no content below the fixed
  // navbar — the Hero's own height is not a safe proxy for that: on short
  // viewports the Hero grows taller than 100vh, and keeping the navbar
  // pinned "visible" for its entire height made it sit on top of the
  // collage while the user scrolled through it.
  const NAVBAR_TOP_THRESHOLD = 20;

  function handleNavbarScroll() {
    const currentScrollY = window.scrollY;

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

    // RULE 1: At the very top of the page -> ALWAYS VISIBLE
    if (currentScrollY < NAVBAR_TOP_THRESHOLD) {
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
        if (window.scrollY > NAVBAR_TOP_THRESHOLD && navbarContainer) {
          navbarContainer.classList.add('nav-hidden');
        }
      }, 2500);
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // 3. Lazy-load video sources: don't fetch the .mp4 files until their
  // section is about to enter the viewport (they're several MB each).
  const lazyVideos = document.querySelectorAll('video.nebula-video');
  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      const source = video.querySelector('source[data-src]');
      if (source) {
        source.src = source.dataset.src;
        video.load();
        video.play().catch(() => {});
      }
      observer.unobserve(video);
    });
  }, { rootMargin: '200px' });

  lazyVideos.forEach((video) => videoObserver.observe(video));

  // 4. Scroll-reveal entrance animation for Equipo & Métodos de Pago cards
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  // 5. Assets Gallery Carousel & Lightbox Interactivity
  const track = document.getElementById('galleryTrack');
  const cards = Array.from(track.querySelectorAll('.gallery-card'));
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsContainer = document.getElementById('galleryDots');

  let currentIndex = 0;
  let itemsPerView = getItemsPerView();
  let autoplayInterval = null;

  function getItemsPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Generate dots
  function setupDots() {
    dotsContainer.innerHTML = '';
    const dotsCount = Math.max(1, cards.length - getItemsPerView() + 1);
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('gallery-dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    const itemsCount = cards.length;
    itemsPerView = getItemsPerView();
    const maxIndex = Math.max(0, itemsCount - itemsPerView);
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const gap = 20; // Matches CSS gap
    const cardWidth = cards[0].getBoundingClientRect().width;
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update buttons state
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;

    // Update dots
    const dots = Array.from(dotsContainer.querySelectorAll('.gallery-dot'));
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // Play/Pause videos in view
    cards.forEach((card, index) => {
      const video = card.querySelector('video');
      if (video) {
        if (index >= currentIndex && index < currentIndex + itemsPerView) {
          // Play video if it is in viewport
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      const maxIndex = Math.max(0, cards.length - getItemsPerView());
      if (currentIndex >= maxIndex) {
        currentIndex = 0; // Loop back
      } else {
        currentIndex++;
      }
      updateCarousel();
    }, 3500);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      resetAutoplay();
    }
  });

  nextBtn.addEventListener('click', () => {
    const maxIndex = Math.max(0, cards.length - getItemsPerView());
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
      resetAutoplay();
    }
  });

  // Pause on hover
  const carouselWrapper = document.querySelector('.gallery-carousel-wrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);
  }

  window.addEventListener('resize', () => {
    setupDots();
    updateCarousel();
  });

  // Lightbox Functionality
  const lightbox = document.getElementById('lightboxModal');
  const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  let activeLightboxIndex = 0;

  function openLightbox(index) {
    stopAutoplay(); // Stop autoplay when viewing in full screen
    activeLightboxIndex = index;
    lightbox.classList.add('active');
    loadLightboxMedia();
    document.body.style.overflow = 'hidden'; // Stop page scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxMediaContainer.innerHTML = '';
    document.body.style.overflow = ''; // Restore page scrolling
    startAutoplay(); // Resume autoplay when closing lightbox
  }

  function loadLightboxMedia() {
    lightboxMediaContainer.innerHTML = '';
    const selectedCard = cards[activeLightboxIndex];
    const mediaType = selectedCard.dataset.type;
    const mediaSrc = selectedCard.dataset.src;

    let mediaElement;
    if (mediaType === 'video') {
      mediaElement = document.createElement('video');
      mediaElement.src = mediaSrc;
      mediaElement.controls = true;
      mediaElement.autoplay = true;
      mediaElement.loop = true;
      mediaElement.className = 'lightbox-media';
    } else {
      mediaElement = document.createElement('img');
      mediaElement.src = mediaSrc;
      mediaElement.alt = `Nebula Asset ${activeLightboxIndex + 1}`;
      mediaElement.className = 'lightbox-media';
    }

    mediaElement.addEventListener('load', () => {
      mediaElement.classList.add('loaded');
    });
    if (mediaType === 'video') {
      mediaElement.addEventListener('loadeddata', () => {
        mediaElement.classList.add('loaded');
      });
    }

    lightboxMediaContainer.appendChild(mediaElement);
    lightboxCounter.textContent = `${activeLightboxIndex + 1} / ${cards.length}`;
  }

  function navigateLightbox(direction) {
    activeLightboxIndex += direction;
    if (activeLightboxIndex < 0) {
      activeLightboxIndex = cards.length - 1;
    } else if (activeLightboxIndex >= cards.length) {
      activeLightboxIndex = 0;
    }
    loadLightboxMedia();
  }

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // Close lightbox on click outside the media
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // Initial setup
  setupDots();
  setTimeout(() => {
    updateCarousel();
    startAutoplay();
  }, 100);
});
