import axios from 'axios';
import { logSend, logResponse } from '../utils/apiLogger.js';

const apiClient = axios.create({
    baseURL: '/api',
    timeout: 8000, // 8s timeout to avoid hanging requests
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // attach start time for timing diagnostics
    config.metadata = { startTime: new Date() };
    // Log outgoing request using apiLogger
    try {
        logSend(config.method || 'GET', (config.baseURL || '') + (config.url || ''), config.data || config.params || null);
    } catch (e) { }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(response => {
    try {
        if (response.config && response.config.metadata && response.config.metadata.startTime) {
            const duration = new Date() - new Date(response.config.metadata.startTime);
            logResponse(response.status, (response.config.baseURL || '') + (response.config.url || ''), response.data);
        }
    } catch (e) { }
    return response;
}, error => {
    if (error.response && error.response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }
    // Log network/timeout errors during development for debugging
    try {
        const cfg = error.config || {};
        const url = (cfg.baseURL || '') + (cfg.url || '<unknown>');
        const method = (cfg.method || '').toUpperCase() || 'GET';
        const status = (error.response && error.response.status) || 'NETWORK';
        logResponse(status, url, error.response ? error.response.data : { message: error.message });
    } catch (e) { }
    return Promise.reject(error);
});

export default apiClient;
