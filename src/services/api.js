import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 30000, // 30 seconds timeout (Vercel cold starts can be slow)
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
