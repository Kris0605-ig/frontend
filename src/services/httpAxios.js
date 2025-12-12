import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const httpAxios = axios.create({

    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default httpAxios;

httpAxios.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);