// ===== NAVBAR =====
const hamburger = document.getElementById('hamburger');
const navbarLinks = document.getElementById('navbarLinks');
const navbar = document.getElementById('navbar');

// Hamburger toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbarLinks.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.navbar-links ul a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navbarLinks.classList.remove('open');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== STATISTICS COUNTER =====
const statNumbers = document.querySelectorAll('.stat-number');

const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const startTime = performance.now();

    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(eased * target);
        el.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    };

    requestAnimationFrame(update);
};

// Intersection Observer for stats
const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(num => {
                    const currentVal = parseInt(num.textContent, 10);
                    if (currentVal === 0) {
                        animateCounter(num);
                    }
                });
            }
        });
    }, { threshold: 0.3 });
    statsObserver.observe(statsContainer);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== KEYBOARD SUPPORT =====
document.querySelectorAll('.btn, .hamburger, .link-arrow').forEach(el => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
});

// ===== MICRO-INTERACTIONS =====

// 1. Tilt effect on domain cards (desktop only)
if (window.innerWidth > 768) {
    document.querySelectorAll('.domain-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// 2. Smooth reveal on scroll with stagger
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const children = entry.target.children;
            Array.from(children).forEach((child, i) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }
    });
}, { threshold: 0.1 });

// Apply to grid items
document.querySelectorAll('.domains-grid, .events-grid, .gallery-grid, .stats-container').forEach(grid => {
    Array.from(grid.children).forEach(child => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    revealObserver.observe(grid);
});

// 3. Parallax effect on floating symbols
document.addEventListener('mousemove', (e) => {
    const symbols = document.querySelectorAll('.floating-symbols .symbol');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    symbols.forEach((symbol, i) => {
        const speed = 0.02 + (i * 0.005);
        symbol.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// 4. Smart navbar hide on scroll down (optional)
let lastScroll = 0;
let navbarHidden = false;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 200 && currentScroll > lastScroll) {
        // Scrolling down
        if (!navbarHidden) {
            navbar.style.transform = 'translateY(-100%)';
            navbarHidden = true;
        }
    } else {
        // Scrolling up
        if (navbarHidden) {
            navbar.style.transform = 'translateY(0)';
            navbarHidden = false;
        }
    }
    lastScroll = currentScroll;
});

// 5. Keyboard shortcuts (press 'P' for particle controls)
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        const toggle = document.getElementById('controlsToggle');
        if (toggle) toggle.click();
    }
});

// 6. Performance: Reduce particles on mobile
if (window.innerWidth < 768) {
    const style = document.createElement('style');
    style.textContent = `
        #particle-controls .controls-panel {
            width: 220px;
            padding: 16px;
        }
    `;
    document.head.appendChild(style);
}

console.log('🚀 STCC website loaded successfully!');
console.log('💡 Press "P" to toggle particle controls');