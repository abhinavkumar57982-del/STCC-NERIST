// ===== API CONFIGURATION =====
// This file handles API URL configuration

(function() {
    'use strict';
    
    // Determine API URL based on environment
    const getApiUrl = () => {
        // If running on localhost, use local server
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '') {
            return 'http://localhost:5000/api';
        }
        // Otherwise use relative path (for production)
        return '/api';
    };

    // Set the API URL globally if not already set
    if (typeof window.API_URL === 'undefined') {
        window.API_URL = getApiUrl();
        console.log(`🔗 API URL: ${window.API_URL}`);
    }
})();