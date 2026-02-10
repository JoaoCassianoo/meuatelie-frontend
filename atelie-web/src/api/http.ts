import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://meuatelie-api.onrender.com/api',
});
