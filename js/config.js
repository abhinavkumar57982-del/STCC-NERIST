// ===== API CONFIGURATION =====
(function() {
    'use strict';
    
    // Determine API URL based on environment
    const getApiUrl = () => {
        // Production (Render)
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            // ⚠️ IMPORTANT: Replace with your Render URL
            return 'https://stcc-website.onrender.com/api';
        }
        // Local development
        return 'http://localhost:5000/api';
    };

    // Set the API URL globally
    if (typeof window.API_URL === 'undefined') {
        window.API_URL = getApiUrl();
        console.log(`🔗 API URL: ${window.API_URL}`);
    }
})();
