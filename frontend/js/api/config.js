// API Configuration
// Automatically detects if running locally or on production

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// TODO: Replace with your actual Render backend URL after deployment
// Example: 'https://latex-style-graph-backend.onrender.com'
export const BASE_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://latexstylegraphgenerator-backend.onrender.com';

export const API_URLS = {
    auth: `${BASE_URL}/api/auth`,
    graphs: `${BASE_URL}/api/graphs`
};
