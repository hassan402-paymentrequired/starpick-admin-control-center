// src/lib/axios.ts
import axios from 'axios';
import { getCookie, removeTokenAndUser } from './cookie';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://starpick-server.test/api/v1',
    headers: {
        Accept: 'application/json',
    },
});

// Request interceptor for adding token
api.interceptors.request.use(
    (config) => {
        const token = getCookie('_token');
        // console.log(token)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeTokenAndUser();
            toast("Session expired. please login ");
            window.location.href= '/'
        }
        return Promise.reject(error);
    }
);

export default api;
