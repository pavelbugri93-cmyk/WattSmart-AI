// ============================================================
// FILE: api.js
// Centralized Axios instance for all API communication.
// Automatically attaches the JWT to every authenticated request
// via a request interceptor — no need to set headers manually.
// ============================================================

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Attach the JWT from localStorage to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth — public endpoints, no token required
export const register = (email, password) =>
  API.post('/auth/register', { email, password });

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

// Predictions — guest is public, all others require JWT
export const predictGuest = (data) =>
  API.post('/predict/guest', data);

export const predictUser = (data) =>
  API.post('/predict', data);

export const getHistory = () =>
  API.get('/predict/history');

export const deletePrediction = (id) =>
  API.delete(`/predict/${id}`);

export const deleteAllPredictions = () =>
  API.delete('/predict');

// User profile and settings
export const getProfile = () =>
  API.get('/user/profile');

export const updateRate = (rate) =>
  API.put(`/user/rate?rate=${rate}`);