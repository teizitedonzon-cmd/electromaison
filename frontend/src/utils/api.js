// src/utils/api.js — Configuration d'Axios (client HTTP)
// Ce fichier centralise tous les appels vers le backend

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL du backend
  headers: { 'Content-Type': 'application/json' },
});

// ── INTERCEPTEUR : Ajoute automatiquement le token JWT ──
// Avant chaque requête, on récupère le token dans localStorage et on l'ajoute
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERCEPTEUR : Gère les erreurs de token expiré ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → déconnexion automatique
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default api;
