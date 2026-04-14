import { getToken } from './auth.js';
import { API_URLS } from './config.js';

const API_URL = API_URLS.graphs;

export const saveGraph = async (title, functionsState, pointsState, settings, isPublic = false, overwrite = false) => {
    const token = getToken();
    const res = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, functionsState, pointsState, settings, isPublic, overwrite })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save graph');
    return data;
};

export const updateGraph = async (shortId, data) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/${shortId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to update graph');
    return resData;
};

export const deleteGraph = async (shortId) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/${shortId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete graph');
    return data;
};

export const getMyGraphs = async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/my-graphs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch graphs');
    return data;
};

export const loadSharedGraph = async (shortId) => {
    const res = await fetch(`${API_URL}/shared/${shortId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Graph not found');
    return data;
};
