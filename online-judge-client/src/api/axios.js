import axios from 'axios';

const api = axios.create({
    baseURL: 'https://online-judge.online/api', 
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;