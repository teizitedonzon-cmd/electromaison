// src/context/AuthContext.js — État global de l'authentification
// Ce contexte est accessible dans TOUS les composants de l'app

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// 1. Créer le contexte
const AuthContext = createContext();

// 2. Créer le Provider (enveloppe toute l'application)
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [chargement, setChargement] = useState(true); // Vrai au démarrage

  // Au chargement de l'app, vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    const userSauvegarde = localStorage.getItem('user');
    const token          = localStorage.getItem('token');
    if (userSauvegarde && token) {
      setUser(JSON.parse(userSauvegarde));
    }
    setChargement(false);
  }, []);

  // Connexion
  const connexion = async (email, motDePasse) => {
    const { data } = await api.post('/auth/connexion', { email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user; // Retourne l'utilisateur pour la redirection
  };

  // Inscription
  const inscription = async (formData) => {
    const { data } = await api.post('/auth/inscription', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Déconnexion
  const deconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, chargement, connexion, inscription, deconnexion }}>
      {!chargement && children}
    </AuthContext.Provider>
  );
};

// 3. Hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => useContext(AuthContext);
