import axios from 'axios';

const api = axios.create({
    baseURL: 'http://13.218.219.24:8000/api', 
    withCredentials: true, // MANDATORY: Allows React to receive and send the secure HTTP-only cookie
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;