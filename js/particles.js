// ===== COMMON PARTICLE SYSTEM =====
// Clean appearance - fewer particles on mobile only
// Size and connection distance SAME on all devices

(function() {
    'use strict';

    // ===== DEFAULT SETTINGS (DESKTOP) =====
    const DESKTOP_SETTINGS = {
        count: 20,               // Desktop count
        speed: 6.0,              // Original speed
        size: 8.0,               // Original size (KEPT)
        connectionDistance: 350, // Original connection (KEPT)
        mouseRadius: 200,        // Original mouse radius
        opacity: 1.0,            // Original opacity
        color: '#0ED100',        // Original color
        glowIntensity: 1.0,      // Original glow
        lineThickness: 1.2       // Original line thickness
    };

    // ===== DEFAULT SETTINGS (MOBILE) =====
    const MOBILE_SETTINGS = {
        count: 20,               // REDUCED on mobile only
        speed: 6.0,              // SAME speed
        size: 8.0,               // SAME size (KEPT)
        connectionDistance: 350, // SAME connection (KEPT)
        mouseRadius: 200,        // SAME mouse radius
        opacity: 1.0,            // SAME opacity
        color: '#0ED100',        // SAME color
        glowIntensity: 1.0,      // SAME glow
        lineThickness: 1.2       // SAME line thickness
    };

    // ===== STORAGE KEYS (SEPARATE FOR MOBILE/DESKTOP) =====
    const STORAGE_KEY_DESKTOP = 'stcc-particle-settings-desktop';
    const STORAGE_KEY_MOBILE = 'stcc-particle-settings-mobile';

    // ===== PRIVATE STATE =====
    let settings = null;
    let particles = [];
    let animationId = null;
    let isInitialized = false;
    let canvas = null;
    let ctx = null;
    let mouseX = -1000;
    let mouseY = -1000;
    let width = 0;
    let height = 0;
    let settingsUISetup = false;
    let dpr = 1;
    let isMobile = false;

    // ===== PUBLIC API =====
    window.STCCParticles = {
        init: init,
        destroy: destroy,
        getSettings: getSettings,
        updateSettings: updateSettings,
        resetSettings: resetSettings
    };

    // ===== FIND CANVAS =====
    function findCanvas() {
        const ids = ['particleCanvas', 'heroCanvas', 'galleryCanvas', 'ebodyCanvas'];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) return el;
        }
        const canvases = document.querySelectorAll('canvas');
        for (const el of canvases) {
            if (el.classList.contains('particle-canvas') || 
                el.classList.contains('hero-canvas') || 
                el.classList.contains('gallery-canvas') || 
                el.classList.contains('ebody-canvas')) {
                return el;
            }
        }
        return null;
    }

    // ===== INIT =====
    function init(canvasElement) {
        if (isInitialized) {
            const existingCanvas = findCanvas();
            if (existingCanvas && existingCanvas !== canvas) {
                destroy();
                canvas = existingCanvas;
            } else {
                console.warn('STCCParticles: Already initialized');
                return;
            }
        }

        if (!canvasElement) {
            canvasElement = findCanvas();
        }

        if (!canvasElement) {
            console.warn('STCCParticles: No canvas found');
            setTimeout(() => {
                const retryCanvas = findCanvas();
                if (retryCanvas && !isInitialized) init(retryCanvas);
            }, 500);
            return;
        }

        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        // Detect mobile
        isMobile = window.innerWidth < 768;
        
        // Load settings
        settings = loadSettings();
        
        resize();
        createParticles();
        bindEvents();
        startAnimation();
        
        isInitialized = true;
        console.log('✅ STCCParticles initialized with', particles.length, 'particles', isMobile ? '(MOBILE MODE)' : '(desktop mode)');
    }

    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (canvas) {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
        }
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        particles = [];
        isInitialized = false;
    }

    function getSettings() { return { ...settings }; }

    function updateSettings(newSettings) {
        const needsRecreate = newSettings.count !== undefined && newSettings.count !== settings.count;
        settings = { ...settings, ...newSettings };
        saveSettings(settings);
        if (needsRecreate) createParticles();
        updateUI();
    }

    function resetSettings() {
        settings = isMobile ? { ...MOBILE_SETTINGS } : { ...DESKTOP_SETTINGS };
        saveSettings(settings);
        createParticles();
        updateUI();
    }

    // ===== SETTINGS (SEPARATE FOR MOBILE/DESKTOP) =====
    function loadSettings() {
        const storageKey = isMobile ? STORAGE_KEY_MOBILE : STORAGE_KEY_DESKTOP;
        const baseSettings = isMobile ? { ...MOBILE_SETTINGS } : { ...DESKTOP_SETTINGS };
        
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...baseSettings, ...parsed };
            }
        } catch (e) {}
        return baseSettings;
    }

    function saveSettings(s) {
        const storageKey = isMobile ? STORAGE_KEY_MOBILE : STORAGE_KEY_DESKTOP;
        try {
            localStorage.setItem(storageKey, JSON.stringify(s));
        } catch (e) {}
    }

    // ===== RESIZE - FIXED TO VIEWPORT =====
    function resize() {
        if (!canvas) return;
        
        dpr = window.devicePixelRatio || 1;
        
        // CSS size - viewport only
        width = window.innerWidth;
        height = window.innerHeight;
        
        // Internal resolution (for DPR)
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // CSS size
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        
        // Scale context for DPR
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ===== CREATE PARTICLES =====
    function createParticles() {
        if (!canvas) return;
        particles = [];
        const count = settings.count;

        // Create clusters for organic look
        const clusterCount = Math.floor(count / 3);
        const clusters = [];
        for (let i = 0; i < clusterCount; i++) {
            clusters.push({
                x: Math.random() * width,
                y: Math.random() * height,
                spread: 120 + Math.random() * 250
            });
        }

        for (let i = 0; i < count; i++) {
            const cluster = clusters[i % clusters.length];
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * cluster.spread;
            const p = {
                x: cluster.x + Math.cos(angle) * dist,
                y: cluster.y + Math.sin(angle) * dist,
                baseX: cluster.x + Math.cos(angle) * dist,
                baseY: cluster.y + Math.sin(angle) * dist,
                size: Math.random() * settings.size + 1.0,
                speedX: (Math.random() - 0.5) * settings.speed * 0.8,
                speedY: (Math.random() - 0.5) * settings.speed * 0.8,
                opacity: Math.random() * settings.opacity + 0.2,
                phase: Math.random() * Math.PI * 2
            };
            particles.push(p);
        }

        // Add random stragglers (reduced)
        const stragglerCount = isMobile ? 0 : Math.floor(count * 0.10);
        for (let i = 0; i < stragglerCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                size: Math.random() * settings.size + 1.0,
                speedX: (Math.random() - 0.5) * settings.speed * 1.2,
                speedY: (Math.random() - 0.5) * settings.speed * 1.2,
                opacity: Math.random() * settings.opacity + 0.2,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // ===== UPDATE PARTICLE =====
    function updateParticle(p) {
        // Mouse interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < settings.mouseRadius) {
            const force = (1 - dist / settings.mouseRadius) * 0.06;
            p.x += dx * force;
            p.y += dy * force;
        } else {
            // Drift back to base
            p.x += (p.baseX - p.x) * 0.002;
            p.y += (p.baseY - p.y) * 0.002;
        }

        // Movement with wave effect
        p.x += p.speedX * 0.6 + Math.sin(p.phase + Date.now() * 0.0008) * 0.5;
        p.y += p.speedY * 0.6 + Math.cos(p.phase + Date.now() * 0.0008) * 0.5;
        p.phase += 0.015;

        // Wrap around
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;
    }

    // ===== DRAW PARTICLE (FULL SIZE) =====
    function drawParticle(p) {
        if (!ctx) return;
        const glow = settings.glowIntensity;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = settings.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Enhanced glow effect
        if (p.size > 1.5) {
            ctx.shadowColor = settings.color;
            ctx.shadowBlur = 30 * glow;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }

    // ===== DRAW CONNECTIONS (FULL LENGTH) =====
    function drawConnections() {
        if (!ctx || particles.length < 2) return;
        const distThreshold = settings.connectionDistance;
        const lineThickness = settings.lineThickness;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < distThreshold) {
                    // Connection opacity
                    const baseOpacity = (1 - dist / distThreshold) * 0.4;
                    
                    // Mouse proximity boost
                    let mouseBoost = 0;
                    const mx = mouseX - particles[i].x;
                    const my = mouseY - particles[i].y;
                    const mDist = Math.sqrt(mx * mx + my * my);
                    if (mDist < settings.mouseRadius) {
                        mouseBoost = (1 - mDist / settings.mouseRadius) * 0.3;
                    }

                    const opacity = Math.min(baseOpacity + mouseBoost, 0.8);
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = settings.color;
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = lineThickness;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }

    // ===== ANIMATION LOOP =====
    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Update all particles
        for (const p of particles) {
            updateParticle(p);
            drawParticle(p);
        }

        // Draw connections
        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    // ===== EVENTS =====
    function onMouseMove(e) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() { mouseX = -1000; mouseY = -1000; }

    function onTouchMove(e) {
        if (!canvas || !e.touches.length) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
    }

    function onTouchEnd() { mouseX = -1000; mouseY = -1000; }

    function onResize() {
        const wasMobile = isMobile;
        isMobile = window.innerWidth < 768;
        
        // Reload settings for new device type if changed
        if (wasMobile !== isMobile) {
            settings = loadSettings();
        }
        
        resize();
        createParticles();
    }

    function onScroll() {
        // No need to reposition - canvas is fixed to viewport
    }

    function bindEvents() {
        if (!canvas) return;
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchend', onTouchEnd);
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onScroll);
    }

    // ===== SETTINGS UI =====
    function createSettingsUI() {
        if (settingsUISetup) return;
        settingsUISetup = true;
        if (!settings) settings = loadSettings();

        const panel = document.createElement('div');
        panel.id = 'particle-controls';
        panel.innerHTML = `
            <div class="controls-toggle" id="controlsToggle">⚙️</div>
            <div class="controls-panel" id="controlsPanel">
                <h4>✨ Particle Settings</h4>
                <div class="control-group">
                    <label>Count: <span id="countVal">${settings.count}</span></label>
                    <input type="range" id="particleCount" min="10" max="200" value="${settings.count}" step="10">
                </div>
                <div class="control-group">
                    <label>Speed: <span id="speedVal">${settings.speed}</span></label>
                    <input type="range" id="particleSpeed" min="0.5" max="10" value="${settings.speed}" step="0.1">
                </div>
                <div class="control-group">
                    <label>Size: <span id="sizeVal">${settings.size}</span></label>
                    <input type="range" id="particleSize" min="1" max="12" value="${settings.size}" step="0.5">
                </div>
                <div class="control-group">
                    <label>Connection Dist: <span id="distVal">${settings.connectionDistance}</span></label>
                    <input type="range" id="connectionDist" min="50" max="500" value="${settings.connectionDistance}" step="10">
                </div>
                <div class="control-group">
                    <label>Glow: <span id="glowVal">${settings.glowIntensity}</span></label>
                    <input type="range" id="glowIntensity" min="0" max="1" value="${settings.glowIntensity}" step="0.05">
                </div>
                <div class="control-group">
                    <label>Opacity: <span id="opacityVal">${settings.opacity}</span></label>
                    <input type="range" id="particleOpacity" min="0.1" max="1" value="${settings.opacity}" step="0.05">
                </div>
                <div class="control-group">
                    <label>Color:</label>
                    <input type="color" id="particleColor" value="${settings.color}">
                </div>
                <button id="resetParticles">Reset to Default</button>
            </div>
        `;
        document.body.appendChild(panel);
        setupUIListeners();
    }

    function setupUIListeners() {
        const toggle = document.getElementById('controlsToggle');
        const panelEl = document.getElementById('controlsPanel');
        if (toggle && panelEl) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                panelEl.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!panelEl.contains(e.target) && e.target !== toggle) {
                    panelEl.classList.remove('open');
                }
            });
        }

        const bindControl = (id, setting, callback) => {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Val');
            if (!input) return;
            input.addEventListener('input', () => {
                const val = parseFloat(input.value);
                settings[setting] = val;
                if (display) display.textContent = val;
                saveSettings(settings);
                if (callback) callback(val);
            });
        };

        bindControl('particleCount', 'count', () => createParticles());
        bindControl('particleSpeed', 'speed');
        bindControl('particleSize', 'size', () => createParticles());
        bindControl('connectionDist', 'connectionDistance');
        bindControl('glowIntensity', 'glowIntensity');
        bindControl('particleOpacity', 'opacity');

        const colorInput = document.getElementById('particleColor');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                settings.color = e.target.value;
                saveSettings(settings);
            });
        }

        const resetBtn = document.getElementById('resetParticles');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                settings = isMobile ? { ...MOBILE_SETTINGS } : { ...DESKTOP_SETTINGS };
                saveSettings(settings);
                createParticles();
                updateUI();
                if (panelEl) panelEl.classList.remove('open');
            });
        }
    }

    function updateUI() {
        const elements = {
            'particleCount': settings.count,
            'particleSpeed': settings.speed,
            'particleSize': settings.size,
            'connectionDist': settings.connectionDistance,
            'glowIntensity': settings.glowIntensity,
            'particleOpacity': settings.opacity
        };
        for (const [id, val] of Object.entries(elements)) {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Val');
            if (input) input.value = val;
            if (display) display.textContent = val;
        }
        const colorInput = document.getElementById('particleColor');
        if (colorInput) colorInput.value = settings.color;
    }

    // ===== AUTO-INIT =====
    function autoInit() {
        createSettingsUI();
        const canvasEl = findCanvas();
        if (canvasEl) {
            init(canvasEl);
        } else {
            if (document.readyState !== 'complete') {
                document.addEventListener('DOMContentLoaded', () => {
                    const retryCanvas = findCanvas();
                    if (retryCanvas && !isInitialized) init(retryCanvas);
                });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        setTimeout(autoInit, 100);
    }

    window.addEventListener('load', () => {
        if (!isInitialized) {
            const retryCanvas = findCanvas();
            if (retryCanvas) init(retryCanvas);
        }
    });

})();

console.log('🚀 STCC Particle System loaded');
console.log('🖥️ Desktop: 60 particles, Size 8, Connection 350');
console.log('📱 Mobile: 20 particles, Size 8, Connection 350');
console.log('💡 Click the gear icon (⚙️) in the bottom-right to customize');