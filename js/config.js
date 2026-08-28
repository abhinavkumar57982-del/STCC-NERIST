// ===== API CONFIGURATION =====
(function() {
    'use strict';
    
    const getApiUrl = () => {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        console.log(`🌐 Hostname: ${hostname}, Port: ${port}`);
        
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        
        // Production (Render)
        // ✅ YOUR ACTUAL RENDER URL
        return 'https://stcc-nerist.onrender.com/api';
    };

    if (typeof window.API_URL === 'undefined') {
        window.API_URL = getApiUrl();
        console.log(`🔗 API URL: ${window.API_URL}`);
    }
})();
