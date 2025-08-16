// src/lib/axios.ts
import axios from 'axios';
import { getCookie, removeTokenAndUser } from './cookie';
import { toast } from 'sonner';


const api = axios.create({
    baseURL: 'http://starpick-server.test/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false

});

// Request interceptor for adding token
api.interceptors.request.use(
    (config) => {
        const token = getCookie('_token');
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
