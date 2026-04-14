import { API_URLS } from './config.js';
const API_URL = API_URLS.auth;

export const register = async (username, password) => {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('mathToken', data.token);
    localStorage.setItem('mathUser', JSON.stringify(data));
    return data;
};

export const login = async (username, password) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('mathToken', data.token);
    localStorage.setItem('mathUser', JSON.stringify(data));
    return data;
};

export const loginWithGoogle = async (googleToken) => {
    const res = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google Login failed');
    localStorage.setItem('mathToken', data.token);
    localStorage.setItem('mathUser', JSON.stringify(data));
    return data;
};

export const logout = () => {
    localStorage.removeItem('mathToken');
    localStorage.removeItem('mathUser');
};

export const getUser = () => {
    const user = localStorage.getItem('mathUser');
    return user ? JSON.parse(user) : null;
};

export const getToken = () => localStorage.getItem('mathToken');

export const updateProfile = async (username, fullName) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, fullName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Profile update failed');
    localStorage.setItem('mathUser', JSON.stringify(data));
    return data;
};
