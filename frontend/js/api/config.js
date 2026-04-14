// API Configuration
// Automatically detects if running locally or on production (Vercel)

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// On Vercel, we use relative paths because Frontend and Backend are on the same domain
export const BASE_URL = isLocal 
    ? 'http://localhost:5000' 
    : ''; 

export const API_URLS = {
    auth: `${BASE_URL}/api/auth`,
    graphs: `${BASE_URL}/api/graphs`
};
