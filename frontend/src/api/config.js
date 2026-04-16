import axios from 'axios';

// The API base URL: 
// In development, it uses the local server.
// In production (Vercel), it uses relative path to hit the serverless function.
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5000';
const api = axios.create({
    baseURL: API_BASE_URL
});

export default api;
export { API_BASE_URL };
