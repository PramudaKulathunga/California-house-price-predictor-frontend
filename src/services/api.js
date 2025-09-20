import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Base URL:', API_BASE_URL);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
        }

        if (!error.response) {
            throw new Error(`Cannot connect to server. Please check if ${API_BASE_URL} is running.`);
        }

        throw error;
    }
);

export const predictHousePrice = async (formData) => {
    try {
        const response = await api.post('/predict', formData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error ||
            error.response?.data?.message ||
            error.message;
        throw new Error(errorMessage);
    }
};

export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}`);
    }
};

export default api;