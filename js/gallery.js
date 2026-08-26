// ===== GALLERY DATA =====
const galleryItems = [
    // Hackathons
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_540,q_auto:good,w_720/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.25_p85u0sp.jpeg", title: "Techspirit Hackathon 2026", category: "HACKATHONS", date: "2026" },
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.23_WbXOWiD.jpeg", title: "Techspirit Hackathon 2026", category: "HACKATHONS", date: "2026" },
    // Coding Events
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.04_mtsb9WI.jpeg", title: "Techspirit Hackathon 2026", category: "HACKATHONS", date: "2026" },
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.06.10_dWcJgnI.jpeg", title: "Techspirit Hackathon 2026", category: "HACKATHONS", date: "2026" },
    
    // Workshops
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-02-01%2520at%252023.05.30_pwHwIMn.jpeg", title: "Techspirit Hackathon 2026", category: "HACKATHONS", date: "2026" },
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-01-22%2520at%252017.55.35_L1TEazS.jpeg", title: "Hackathon Guide", category: "WORKSHOPS", date: "2026" },
    // Competitions
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/event_wrapup/WhatsApp%2520Image%25202026-01-22%2520at%252017.55.33_7lloyN2.jpeg", title: "Hackathon Guide", category: "WORKSHOPS", date: "2026" },
    // Meetups
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/chapter_photos/111_BbxF0Ys.jpeg", title: "Quiz Cum Orientation", category: "Orientation", date: "2025" },
    // Campus Life
    { image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2,f_auto,g_center,h_200,q_auto:good,w_200/v1/gcs/platform-data-goog/chapter_photos/123_biporE2.jpeg", title: "Quiz Cum Orientation", category: "Orientation", date: "2025" },
    
    
    // ===================================================
    // 👇 PASTE YOUR EXTERNAL LINKS HERE 👇
    // ===================================================
    // Example: 
    // { image: "https://example.com/my-photo.jpg", title: "My Event", category: "MEETUPS", date: "2026" },
];

// ===== GALLERY CONTROLLER =====
class GalleryController {
    constructor() {
        this.items = galleryItems;
        this.filteredItems = [...this.items];
        this.currentFilter = "ALL";
        this.currentIndex = 0;
        
        this.init();
    }

    init() {
        this.renderFeatured();
        this.renderGallery();
        this.setupFilters();
        this.setupLightbox();
        this.setupScrollReveal();
    }

    // Get random item for featured (or first item)
    getFeaturedItem() {
        return this.items[0] || this.items[1] || this.items[2];
    }

    renderFeatured() {
        const featuredCard = document.getElementById('featuredCard');
        const featuredTitle = document.getElementById('featuredTitle');
        const item = this.getFeaturedItem();
        
        if (!item) return;
        
        featuredCard.style.backgroundImage = `url('${item.image}')`;
        featuredTitle.textContent = item.title;
        
        featuredCard.addEventListener('click', () => {
            const itemIndex = this.items.indexOf(item);
            if (itemIndex !== -1) {
                this.openLightbox(itemIndex);
            }
        });
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = '';

        this.filteredItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            // Assign grid classes based on index for dynamic masonry look
            if (index % 6 === 0 || index % 6 === 5) card.classList.add('tall');
            if (index % 7 === 2) card.classList.add('wide');
            if (index % 9 === 4) card.classList.add('large');

            // Placeholder for missing images
            card.innerHTML = `
                <div class="placeholder">STCC MEMORY</div>
                <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />
                <div class="gallery-item-overlay">
                    <span class="gallery-item-title">${item.title}</span>
                    <span class="gallery-item-category">${item.category} • ${item.date}</span>
                </div>
                <span class="gallery-item-view">👁</span>
            `;

            // Click listener
            card.addEventListener('click', () => {
                this.openLightbox(index);
            });

            grid.appendChild(card);
        });
    }

    setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update filter
                this.currentFilter = btn.getAttribute('data-category');
                this.applyFilter();
            });
        });
    }

    applyFilter() {
        if (this.currentFilter === 'ALL') {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => item.category === this.currentFilter);
        }
        
        this.renderGallery();
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const overlay = document.getElementById('lightboxOverlay');
        const close = document.getElementById('lightboxClose');
        const prev = document.getElementById('lightboxPrev');
        const next = document.getElementById('lightboxNext');

        close.addEventListener('click', () => this.closeLightbox());
        overlay.addEventListener('click', () => this.closeLightbox());
        prev.addEventListener('click', () => this.navigateLightbox(-1));
        next.addEventListener('click', () => this.navigateLightbox(1));

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
            if (e.key === 'ArrowRight') this.navigateLightbox(1);
        });
    }

    openLightbox(index) {
        if (index < 0 || index >= this.filteredItems.length) return;
        
        this.currentIndex = index;
        this.updateLightboxContent();
        
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    navigateLightbox(direction) {
        const newIndex = this.currentIndex + direction;
        
        if (newIndex < 0) {
            this.currentIndex = this.filteredItems.length - 1;
        } else if (newIndex >= this.filteredItems.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = newIndex;
        }
        
        this.updateLightboxContent();
    }

    updateLightboxContent() {
        const item = this.filteredItems[this.currentIndex];
        if (!item) return;
        
        document.getElementById('lightboxImage').src = item.image;
        document.getElementById('lightboxImage').alt = item.title;
        document.getElementById('lightboxTitle').textContent = item.title;
        document.getElementById('lightboxCategory').textContent = `${item.category} • ${item.date}`;
        document.getElementById('lightboxCounter').textContent = `${String(this.currentIndex + 1).padStart(2, '0')} / ${String(this.filteredItems.length).padStart(2, '0')}`;
    }

    setupScrollReveal() {
        const items = document.querySelectorAll('.gallery-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        items.forEach(item => observer.observe(item));
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new GalleryController();
});