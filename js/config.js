// js/config.js
(function() {
    'use strict';
    
    const getApiUrl = () => {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        console.log(`🌐 Hostname: ${hostname}, Port: ${port}`);
        
        // Local development - handle both localhost and 127.0.0.1
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        
        // Production (Render)
        // CHANGE THIS TO YOUR ACTUAL RENDER URL
        return 'https://your-app-name.onrender.com/api';
    };

    if (typeof window.API_URL === 'undefined') {
        window.API_URL = getApiUrl();
        console.log(`🔗 API URL: ${window.API_URL}`);
    }
})();
