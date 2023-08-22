import './app.css';
import App from './App.svelte';

import axios from 'axios';
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://localhost:5000/api';
} else {
  axios.defaults.baseURL = '/api';
}

const app = new App({
  target: document.getElementById('app'),
});

export default app;
