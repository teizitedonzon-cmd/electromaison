import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const userSauvegarde = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userSauvegarde && token) {
      try {
        setUser(JSON.parse(userSauvegarde));
        api.get('/auth/refresh')
          .then(({ data }) => {
            if (data.token) localStorage.setItem('token', data.token);
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              setUser(data.user);
            }
          })
          .catch(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          })
          .finally(() => setChargement(false));
        return;
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setChargement(false);
  }, []);

  const connexion = async (email, motDePasse) => {
    const { data } = await api.post('/auth/connexion', { email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const inscription = async (formData) => {
    // PAS de headers manuels ici, api (axios) gère le FormData
    const { data } = await api.post('/auth/inscription', formData);
    
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data.user;
  };

  const updateUser = (nouvellesInfos) => {
    const updatedUser = { ...user, ...nouvellesInfos };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/connexion';
  };

  return (
    <AuthContext.Provider value={{ user, chargement, connexion, inscription, deconnexion, updateUser }}>
      {!chargement && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
