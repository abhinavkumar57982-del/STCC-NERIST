// ===== EVENTS UI CONTROLLER =====
// Handles rendering, timeline, filtering, and interactions

(function() {
    'use strict';

    // ===== DOM REFS =====
    const container = document.getElementById('eventsContainer');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('eventModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    // ===== STATE =====
    let currentFilter = 'ALL';
    let allEvents = [];
    let hasAutoScrolled = false;

    // ===== FIX: Add padding to body to prevent navbar overlap =====
    function fixNavbarOverlap() {
        const navbar = document.getElementById('navbar');
        const eventsSection = document.querySelector('.events-section');
        if (navbar && eventsSection) {
            const navbarHeight = navbar.offsetHeight;
            eventsSection.style.paddingTop = (navbarHeight + 30) + 'px';
        }
    }

    // ===== EVENT STATUS HELPER =====
    function getEventStatus(event) {
        const now = new Date();
        const start = new Date(`${event.startDate}T${event.startTime}`);
        const end = new Date(`${event.endDate}T${event.endTime}`);

        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'ongoing';
        return 'past';
    }

    // ===== SORT EVENTS =====
    function sortEvents(events) {
        // Past events: oldest first
        // Ongoing: in the middle
        // Upcoming: nearest first
        const past = events.filter(e => getEventStatus(e) === 'past')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const ongoing = events.filter(e => getEventStatus(e) === 'ongoing');
        const upcoming = events.filter(e => getEventStatus(e) === 'upcoming')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        return [...past, ...ongoing, ...upcoming];
    }

    // ===== GET EVENTS BY FILTER =====
    function getFilteredEvents(filter) {
        if (filter === 'ALL') return allEvents;
        return allEvents.filter(e => getEventStatus(e) === filter.toLowerCase());
    }

    // ===== FIND NEAREST UPCOMING EVENT =====
    function findNearestUpcomingEvent(events) {
        const now = new Date();
        const upcoming = events.filter(e => getEventStatus(e) === 'upcoming')
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        if (upcoming.length === 0) return null;
        return upcoming[0];
    }

    // ===== AUTO-SCROLL TO NEAREST UPCOMING EVENT =====
    function scrollToNearestUpcoming() {
        if (hasAutoScrolled) return;
        
        const filtered = getFilteredEvents('ALL');
        const sorted = sortEvents(filtered);
        const nearest = findNearestUpcomingEvent(sorted);
        
        if (!nearest) {
            // If no upcoming events, scroll to the top of events container
            const containerOffset = container.offsetTop;
            const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
            window.scrollTo({
                top: containerOffset - navbarHeight - 20,
                behavior: 'smooth'
            });
            hasAutoScrolled = true;
            return;
        }

        // Find the event node for the nearest upcoming event
        const eventNodes = document.querySelectorAll('.event-node');
        for (const node of eventNodes) {
            if (node.dataset.event === nearest.id) {
                const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
                const nodeRect = node.getBoundingClientRect();
                const scrollPosition = window.pageYOffset + nodeRect.top - navbarHeight - 30;
                
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'smooth'
                    });
                }, 500);
                
                hasAutoScrolled = true;
                
                // Highlight the card
                const card = node.querySelector('.event-card');
                if (card) {
                    card.style.transition = 'all 0.6s ease';
                    card.style.borderColor = 'var(--emerald)';
                    card.style.boxShadow = '0 0 60px rgba(0, 208, 132, 0.3)';
                    setTimeout(() => {
                        card.style.borderColor = '';
                        card.style.boxShadow = '';
                    }, 3000);
                }
                break;
            }
        }
    }

    // ===== RENDER TIMELINE =====
    function renderTimeline(filter) {
        if (!container) return;

        const filtered = getFilteredEvents(filter || currentFilter);
        const sorted = sortEvents(filtered);

        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No events in this category</h3>
                    <p>Check back later for updates!</p>
                </div>
            `;
            return;
        }

        // Get the oldest and newest dates for the road
        const dates = sorted.map(e => new Date(e.startDate));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        let html = `<div class="timeline-road">`;

        // Road SVG (winding path)
        html += `
            <svg class="road-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path class="road-path" d="M 50 0 Q 50 30, 30 50 T 70 80 Q 50 95, 50 100" />
                <path class="road-dash" d="M 50 0 Q 50 30, 30 50 T 70 80 Q 50 95, 50 100" />
            </svg>
        `;

        // Event nodes
        sorted.forEach((event, index) => {
            const status = getEventStatus(event);
            const progress = sorted.length > 1 ? (index / (sorted.length - 1)) : 0.5;
            const isLeft = index % 2 === 0;

            let statusLabel = '';
            let statusClass = '';
            if (status === 'past') {
                statusLabel = '✓ Completed';
                statusClass = 'past';
            } else if (status === 'ongoing') {
                statusLabel = '● LIVE';
                statusClass = 'ongoing';
            } else {
                statusLabel = '⏳ Upcoming';
                statusClass = 'upcoming';
            }

            // Countdown for upcoming events
            let countdownHTML = '';
            if (status === 'upcoming') {
                const start = new Date(`${event.startDate}T${event.startTime}`);
                countdownHTML = `<div class="event-countdown" data-target="${start.toISOString()}"></div>`;
            }

            // Registration button for upcoming events
            let regButton = '';
            if (status === 'upcoming' && event.registrationOpen && event.registrationUrl) {
                regButton = `<a href="${event.registrationUrl}" class="btn-register-small" onclick="event.stopPropagation();">Register</a>`;
            } else if (status === 'upcoming') {
                regButton = `<span class="reg-soon">Registration opens soon</span>`;
            }

            // Event card position
            const cardClass = isLeft ? 'event-card-left' : 'event-card-right';

            html += `
                <div class="event-node" data-event="${event.id}" data-status="${status}" style="--progress: ${progress};">
                    <div class="milestone-marker ${statusClass}">
                        <span class="marker-dot"></span>
                        <span class="marker-label">${statusLabel}</span>
                    </div>
                    <div class="event-card ${cardClass} ${statusClass}" onclick="window.openEventDetails('${event.id}')">
                        <div class="event-image-wrapper">
                            <img src="${event.image || 'images/events/default.jpg'}" alt="${event.title}" loading="lazy" onerror="this.src='images/events/default.jpg'">
                            <span class="event-status-badge ${statusClass}">${statusLabel}</span>
                        </div>
                        <div class="event-info">
                            <h3>${event.title}</h3>
                            <div class="event-meta">
                                <span><i class="fas fa-calendar-alt"></i> ${formatDate(event.startDate)}</span>
                                <span><i class="fas fa-clock"></i> ${event.startTime} - ${event.endTime}</span>
                                <span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
                            </div>
                            <p class="event-excerpt">${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</p>
                            <div class="event-footer">
                                ${countdownHTML}
                                ${regButton}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Initialize countdowns
        document.querySelectorAll('.event-countdown').forEach(el => {
            startCountdown(el);
        });

        // Fix navbar overlap after rendering
        setTimeout(fixNavbarOverlap, 100);

        // Auto-scroll to nearest upcoming event after rendering
        if (!hasAutoScrolled && filter === 'ALL') {
            setTimeout(scrollToNearestUpcoming, 800);
        }
    }

    // ===== FORMAT DATE =====
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // ===== COUNTDOWN TIMER =====
    function startCountdown(el) {
        const target = new Date(el.dataset.target);
        
        function update() {
            const now = new Date();
            const diff = target - now;

            if (diff <= 0) {
                el.textContent = 'Starting soon!';
                // Re-render to update status
                renderTimeline(currentFilter);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            el.innerHTML = `
                <span class="countdown-label">Starts in:</span>
                <span class="countdown-value">${days}d ${hours}h ${minutes}m ${seconds}s</span>
            `;
        }

        update();
        setInterval(update, 1000);
    }

    // ===== OPEN EVENT DETAILS =====
    window.openEventDetails = function(eventId) {
        const event = allEvents.find(e => e.id === eventId);
        if (!event) return;

        const status = getEventStatus(event);

        // Build modal content
        let winnersHTML = '';
        if (event.winners && event.winners.length > 0) {
            winnersHTML = `
                <div class="modal-winners">
                    <h4>🏆 Winners</h4>
                    <ul>
                        ${event.winners.map(w => `<li><span class="winner-pos">${w.position}</span> ${w.name}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let galleryHTML = '';
        if (event.gallery && event.gallery.length > 0) {
            galleryHTML = `
                <div class="modal-gallery">
                    <h4>📸 Gallery</h4>
                    <div class="gallery-thumbs">
                        ${event.gallery.map(img => `
                            <img src="${img}" alt="Gallery" loading="lazy" onclick="window.openLightbox('${img}')" />
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let highlightsHTML = '';
        if (event.highlights && event.highlights.length > 0) {
            highlightsHTML = `
                <div class="modal-highlights">
                    <h4>✨ Highlights</h4>
                    <ul>
                        ${event.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let regInfoHTML = '';
        if (status === 'upcoming') {
            if (event.registrationOpen && event.registrationUrl) {
                regInfoHTML = `
                    <div class="modal-registration">
                        <a href="${event.registrationUrl}" class="btn-register-modal" target="_blank">
                            Register Now <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;
            } else {
                regInfoHTML = `
                    <div class="modal-registration">
                        <span class="reg-soon-modal">📝 Registration opens soon</span>
                    </div>
                `;
            }
        }

        let certHTML = '';
        if (status === 'past' && event.certificatesAvailable) {
            certHTML = `
                <div class="modal-certificates">
                    <span class="cert-badge">📜 Certificates Available</span>
                </div>
            `;
        }

        const statusDisplay = status === 'past' ? '✅ Completed' :
                            status === 'ongoing' ? '🔴 LIVE / Ongoing' :
                            '⏳ Upcoming';

        modal.querySelector('.modal-status').textContent = statusDisplay;
        modal.querySelector('.modal-status').className = `modal-status ${status}`;
        modal.querySelector('#modalTitle').textContent = event.title;
        modal.querySelector('#modalDate').textContent = `${formatDate(event.startDate)} • ${event.startTime} - ${event.endTime}`;
        modal.querySelector('#modalVenue').textContent = `📍 ${event.venue}`;
        modal.querySelector('#modalDescription').textContent = event.description;
        modal.querySelector('#modalImage').src = event.image || 'images/events/default.jpg';
        modal.querySelector('#modalImage').alt = event.title;

        // Update dynamic sections
        const detailsContainer = modal.querySelector('.modal-details-container');
        detailsContainer.innerHTML = `
            ${highlightsHTML}
            ${winnersHTML}
            ${galleryHTML}
            ${certHTML}
            ${regInfoHTML}
        `;

        if (event.participants && event.participants > 0) {
            const partEl = modal.querySelector('#modalParticipants');
            partEl.textContent = `👥 ${event.participants} participants`;
            partEl.style.display = 'block';
        } else {
            modal.querySelector('#modalParticipants').style.display = 'none';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // ===== CLOSE MODAL =====
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===== LIGHTBOX =====
    window.openLightbox = function(imgSrc) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImage');
        if (lightbox && lightboxImg) {
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
        }
    };

    // ===== FILTER HANDLING =====
    function setupFilters() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                // Reset auto-scroll when filter changes
                hasAutoScrolled = false;
                renderTimeline(currentFilter);
            });
        });
    }

    // ===== MODAL EVENTS =====
    function setupModal() {
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ===== LIGHTBOX EVENTS =====
    function setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const overlay = document.getElementById('lightboxOverlay');
        const close = document.getElementById('lightboxClose');

        if (close) {
            close.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }
        if (overlay) {
            overlay.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            }
        });
    }

    // ===== UPDATE EVENT COUNT =====
    function updateEventCount() {
        const countEl = document.getElementById('eventCount');
        if (countEl) {
            countEl.textContent = allEvents.length;
        }
    }

    // ===== INIT =====
    function init() {
        // Copy and normalize events
        allEvents = eventsData.map(e => ({
            ...e,
            image: e.image || 'images/events/default.jpg'
        }));

        setupFilters();
        setupModal();
        setupLightbox();
        updateEventCount();
        renderTimeline('ALL');

        // Handle resize for navbar overlap
        window.addEventListener('resize', fixNavbarOverlap);
        // Handle scroll to fix navbar overlap on scroll
        window.addEventListener('scroll', fixNavbarOverlap);

        console.log('🚀 Events Road Timeline initialized');
        console.log(`📅 ${allEvents.length} events loaded`);
        
        // Find nearest upcoming event
        const nearest = findNearestUpcomingEvent(allEvents);
        if (nearest) {
            console.log(`🎯 Nearest upcoming event: "${nearest.title}" on ${nearest.startDate}`);
        } else {
            console.log('🎯 No upcoming events found');
        }
    }

    // ===== AUTO-INIT =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();