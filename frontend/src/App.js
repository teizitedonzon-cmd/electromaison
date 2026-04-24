// src/App.js — Routeur principal de l'application
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages Auth
import Connexion    from './pages/auth/Connexion';
import Inscription  from './pages/auth/Inscription';

// Pages Client
import Accueil      from './pages/client/Accueil';
import Catalogue    from './pages/client/Catalogue';
import DetailProduit from './pages/client/DetailProduit';
import Panier       from './pages/client/Panier';
import MesCommandes from './pages/client/MesCommandes';
import Profil       from './pages/client/Profil';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminProduits  from './pages/admin/Produits';
import AdminCommandes from './pages/admin/Commandes';
import AdminClients   from './pages/admin/Clients';

// ── Composant : Route protégée (utilisateur connecté) ──
const RoutePrivee = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" replace />;
};

// ── Composant : Route admin seulement ──
const RouteAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ── Composant : Redirection auto selon le rôle ──
const RedirectionParRole = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'admin'
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>

          <Routes>
            {/* ── Auth ── */}
            <Route path="/connexion"  element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/accueil"    element={<RedirectionParRole />} />

            {/* ── Client ── */}
            <Route path="/"               element={<RoutePrivee><Accueil /></RoutePrivee>} />
            <Route path="/catalogue"      element={<RoutePrivee><Catalogue /></RoutePrivee>} />
            <Route path="/produit/:id"    element={<RoutePrivee><DetailProduit /></RoutePrivee>} />
            <Route path="/panier"         element={<RoutePrivee><Panier /></RoutePrivee>} />
            <Route path="/mes-commandes"  element={<RoutePrivee><MesCommandes /></RoutePrivee>} />
            <Route path="/profil"         element={<RoutePrivee><Profil /></RoutePrivee>} />

            {/* ── Admin ── */}
            <Route path="/admin/dashboard" element={<RouteAdmin><AdminDashboard /></RouteAdmin>} />
            <Route path="/admin/produits"  element={<RouteAdmin><AdminProduits /></RouteAdmin>} />
            <Route path="/admin/commandes" element={<RouteAdmin><AdminCommandes /></RouteAdmin>} />
            <Route path="/admin/clients"   element={<RouteAdmin><AdminClients /></RouteAdmin>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Notifications toast globales */}
          <ToastContainer position="bottom-right" autoClose={3000} />

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
