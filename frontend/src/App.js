
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthProvider, useAuth } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';

// // Pages Auth
// import Connexion from './pages/auth/Connexion';
// import Inscription from './pages/auth/Inscription';

// // Pages Client
// import Accueil from './pages/client/Accueil';
// import Catalogue from './pages/client/Catalogue';
// import DetailProduit from './pages/client/DetailProduit';
// import Panier from './pages/client/Panier';
// import MesCommandes from './pages/client/MesCommandes';
// import Profil from './pages/client/Profil';

// // Pages Admin
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminProduits from './pages/admin/Produits';
// import AdminCommandes from './pages/admin/Commandes';
// import AdminClients from './pages/admin/Clients';

// // Pages Vendeur (À créer si ce n'est pas fait)
// import DashboardVendeur from './pages/vendeur/DashboardVendeur';

// // ── PROTECTIONS DES ROUTES ──

// const RoutePrivee = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/connexion" replace />;
// };

// const RouteAdmin = ({ children }) => {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/connexion" replace />;
//   return user.role === 'admin' ? children : <Navigate to="/" replace />;
// };

// const RouteVendeur = ({ children }) => {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/connexion" replace />;
//   return user.role === 'vendeur' || user.role === 'admin' ? children : <Navigate to="/" replace />;
// };

// // ── LOGIQUE DE REDIRECTION PAR RÔLE ──

// function RedirectionParRole() {
//   const { user } = useAuth();
//   if (!user) return <Navigate to="/connexion" />;
  
//   // Redirection selon le rôle
//   if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
//   if (user.role === 'vendeur') return <Navigate to="/vendeur/dashboard" />;
//   return <Navigate to="/" />; // Les clients vont sur la boutique
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <CartProvider>
//           <Routes>
//             {/* Routes Publiques */}
//             <Route path="/connexion" element={<Connexion />} />
//             <Route path="/inscription" element={<Inscription />} />
            
//             {/* Route de redirection automatique après login */}
//             <Route path="/accueil" element={<RedirectionParRole />} />

//             {/* Routes Client */}
//             <Route path="/" element={<RoutePrivee><Accueil /></RoutePrivee>} />
//             <Route path="/catalogue" element={<RoutePrivee><Catalogue /></RoutePrivee>} />
//             <Route path="/produit/:id" element={<RoutePrivee><DetailProduit /></RoutePrivee>} />
//             <Route path="/panier" element={<RoutePrivee><Panier /></RoutePrivee>} />
//             <Route path="/mes-commandes" element={<RoutePrivee><MesCommandes /></RoutePrivee>} />
//             <Route path="/profil" element={<RoutePrivee><Profil /></RoutePrivee>} />

//             {/* Routes Vendeur */}
//             <Route path="/vendeur/dashboard" element={<RouteVendeur><DashboardVendeur /></RouteVendeur>} />

//             {/* Routes Admin Global */}
//             <Route path="/admin/dashboard" element={<RouteAdmin><AdminDashboard /></RouteAdmin>} />
//             <Route path="/admin/produits" element={<RouteAdmin><AdminProduits /></RouteAdmin>} />
//             <Route path="/admin/commandes" element={<RouteAdmin><AdminCommandes /></RouteAdmin>} />
//             <Route path="/admin/clients" element={<RouteAdmin><AdminClients /></RouteAdmin>} />

//             {/* Fallback en cas de mauvaise URL */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>

//           <ToastContainer position="bottom-right" autoClose={3000} />
//         </CartProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages Auth
import Connexion from './pages/auth/Connexion';
import Inscription from './pages/auth/Inscription';

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
import AdminClients from './pages/admin/Clients';

// Pages Vendeur
import DashboardVendeur from './pages/vendeur/DashboardVendeur';

// ── PROTECTIONS DES ROUTES ──

const RoutePrivee = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" replace />;
};

const RouteAdmin = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'admin' ? children : <Navigate to="/" replace />;
};

const RouteVendeur = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  return user.role === 'vendeur' || user.role === 'admin' ? children : <Navigate to="/" replace />;
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
            <Route path="/" element={<Accueil />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/produit/:id" element={<DetailProduit />} />
            <Route path="/panier" element={<Panier />} />
            
            {/* Routes Auth */}
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            
            {/* Route de redirection après login */}
            <Route path="/accueil" element={<RedirectionParRole />} />

            {/* Routes Client Protégées (nécessitent connexion) */}
            <Route path="/mes-commandes" element={<RoutePrivee><MesCommandes /></RoutePrivee>} />
            <Route path="/profil" element={<RoutePrivee><Profil /></RoutePrivee>} />

            {/* Routes Vendeur */}
            <Route path="/vendeur/dashboard" element={<RouteVendeur><DashboardVendeur /></RouteVendeur>} />

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={<RouteAdmin><AdminDashboard /></RouteAdmin>} />
            <Route path="/admin/produits" element={<RouteAdmin><AdminProduits /></RouteAdmin>} />
            <Route path="/admin/commandes" element={<RouteAdmin><AdminCommandes /></RouteAdmin>} />
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
