import axios from 'axios';

const api = axios.create({
    baseURL: 'https://kiss-purse-wedding-asbestos.trycloudflare.com/api', 
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;