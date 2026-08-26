// ===== AUTH SYSTEM =====
// Handles navbar authentication state across all pages

document.addEventListener('DOMContentLoaded', function() {
    const authLink = document.getElementById('authLink');
    const authNavItem = document.getElementById('authNavItem');
    
    if (!authLink || !authNavItem) return;

    // Check if user is logged in
    const token = localStorage.getItem('stcc_token');
    const userData = localStorage.getItem('stcc_user');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            
            // Create dropdown wrapper
            authNavItem.style.position = 'relative';
            
            // Update auth link to show user name with dropdown indicator
            authLink.innerHTML = `
                <span style="display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-user-circle" style="font-size:1.1rem;color:#6EE7B7;"></i>
                    <span style="color:#6EE7B7;">${user.name}</span>
                    <i class="fas fa-chevron-down" style="font-size:0.6rem;opacity:0.7;color:#6EE7B7;"></i>
                </span>
            `;
            authLink.href = '#';
            authLink.style.color = '#6EE7B7';
            authLink.style.display = 'flex';
            authLink.style.alignItems = 'center';
            authLink.style.gap = '8px';
            
            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.id = 'authDropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: rgba(7, 28, 26, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 208, 132, 0.15);
                border-radius: 12px;
                padding: 8px 0;
                min-width: 200px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 9999;
            `;
            
            dropdown.innerHTML = `
                <div style="padding: 10px 16px; border-bottom: 1px solid rgba(0, 208, 132, 0.08);">
                    <div style="font-size:0.75rem;color:#8A9B9A;font-weight:500;">Signed in as</div>
                    <div style="font-size:0.9rem;font-weight:600;color:#F5F5F5;margin-top:2px;">${user.name}</div>
                    <div style="font-size:0.7rem;color:#6b7a8f;">Reg: ${user.registrationNo}</div>
                    <div style="font-size:0.7rem;color:#6b7a8f;">${user.email}</div>
                </div>
                <a href="#" id="logoutBtn" style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    color: #ef4444;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    border-radius: 0;
                    border-bottom: 1px solid transparent;
                " onmouseover="this.style.background='rgba(239, 68, 68, 0.08)'" onmouseout="this.style.background='transparent'">
                    <i class="fas fa-sign-out-alt" style="font-size:0.9rem;"></i>
                    Logout
                </a>
            `;
            
            authNavItem.appendChild(dropdown);
            
            // Toggle dropdown on click
            authLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dropdown.style.opacity === '1';
                dropdown.style.opacity = isOpen ? '0' : '1';
                dropdown.style.visibility = isOpen ? 'hidden' : 'visible';
                dropdown.style.transform = isOpen ? 'translateY(-8px)' : 'translateY(0)';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!authNavItem.contains(e.target)) {
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-8px)';
                }
            });
            
            // Logout handler
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Clear local storage
                    localStorage.removeItem('stcc_token');
                    localStorage.removeItem('stcc_user');
                    
                    // Redirect to login page
                    window.location.href = 'login.html';
                });
            }
            
            // Close dropdown on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-8px)';
                }
            });
            
        } catch (e) {
            // If user data is invalid, clear it
            localStorage.removeItem('stcc_user');
            localStorage.removeItem('stcc_token');
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    } else {
        // Not logged in - show Login link
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.style.color = '';
        authLink.style.display = '';
    }
});

console.log('🔐 Auth system initialized with Reg No.');