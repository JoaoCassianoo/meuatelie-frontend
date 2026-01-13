import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5277/api',
});
