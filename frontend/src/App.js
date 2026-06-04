
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages Auth
import Connexion from './pages/auth/Connexion';
import Inscription from './pages/auth/Inscription';
import MotDePasseOublie from './pages/auth/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/auth/ReinitialiserMotDePasse';

// Pages Client (accessibles même sans connexion)
import Accueil from './pages/client/Accueil';
import Catalogue from './pages/client/Catalogue';
import DetailProduit from './pages/client/DetailProduit';
import Panier from './pages/client/Panier';

// Pages Client protégées (nécessitent connexion)
import MesCommandes from './pages/client/MesCommandes';
import Profil from './pages/client/Profil';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminProduits from './pages/admin/Produits';
import AdminCommandes from './pages/admin/Commandes';
import AdminCategories from './pages/admin/Categories';
import AdminClients from './pages/admin/Clients';

// Pages Vendeur
import DashboardVendeur from './pages/vendeur/DashboardVendeur';

// ── PROTECTIONS DES ROUTES ──

const RoutePrivee = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" replace />;
};

const dashboardParRole = (user) => {
  if (!user) return '/connexion';
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'vendeur') return '/vendeur/dashboard';
  return '/';
};

const RouteClientPublique = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'vendeur') {
    return <Navigate to={dashboardParRole(user)} replace />;
  }
  return children;
};

const RouteClient = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'client' ? children : <Navigate to={dashboardParRole(user)} replace />;
};

const RouteAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'admin' ? children : <Navigate to={dashboardParRole(user)} replace />;
};

const RouteVendeur = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'vendeur' ? children : <Navigate to={dashboardParRole(user)} replace />;
};

const RouteAuth = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to={dashboardParRole(user)} replace /> : children;
};

// ── LOGIQUE DE REDIRECTION PAR RÔLE ──

function RedirectionParRole() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" />;
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'vendeur') return <Navigate to="/vendeur/dashboard" />;
  return <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Routes Publiques (accessibles sans connexion) */}
            <Route path="/" element={<RouteClientPublique><Accueil /></RouteClientPublique>} />
            <Route path="/catalogue" element={<RouteClientPublique><Catalogue /></RouteClientPublique>} />
            <Route path="/produit/:id" element={<RouteClientPublique><DetailProduit /></RouteClientPublique>} />
            <Route path="/panier" element={<RouteClientPublique><Panier /></RouteClientPublique>} />
            
            {/* Routes Auth */}
            <Route path="/connexion" element={<RouteAuth><Connexion /></RouteAuth>} />
            <Route path="/inscription" element={<RouteAuth><Inscription /></RouteAuth>} />
            <Route path="/mot-de-passe-oublie" element={<RouteAuth><MotDePasseOublie /></RouteAuth>} />
            <Route path="/reinitialiser-mot-de-passe" element={<RouteAuth><ReinitialiserMotDePasse /></RouteAuth>} />
            
            {/* Route publique d'accueil */}
            <Route path="/accueil" element={<RouteClientPublique><Accueil /></RouteClientPublique>} />

            {/* Routes Client Protégées (nécessitent connexion) */}
            <Route path="/mes-commandes" element={<RouteClient><MesCommandes /></RouteClient>} />
            <Route path="/profil" element={<RoutePrivee><Profil /></RoutePrivee>} />

            {/* Routes Vendeur */}
            <Route path="/vendeur/dashboard" element={<RouteVendeur><DashboardVendeur /></RouteVendeur>} />

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={<RouteAdmin><AdminDashboard /></RouteAdmin>} />
            <Route path="/admin/produits" element={<RouteAdmin><AdminProduits /></RouteAdmin>} />
            <Route path="/admin/commandes" element={<RouteAdmin><AdminCommandes /></RouteAdmin>} />
            <Route path="/admin/categories" element={<RouteAdmin><AdminCategories /></RouteAdmin>} />
            <Route path="/admin/clients" element={<RouteAdmin><AdminClients /></RouteAdmin>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer position="bottom-right" autoClose={3000} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
