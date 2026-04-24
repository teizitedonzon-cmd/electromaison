// src/pages/admin/Dashboard.jsx — Tableau de bord administrateur
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { user, deconnexion } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/commandes/stats').then(({ data }) => setStats(data)).catch(console.error);
  }, []);

  const cartes = [
    { label: 'Total Commandes', valeur: stats?.totalCommandes ?? '...', couleur: '#1A3A2A', icone: '📦' },
    { label: 'En attente',      valeur: stats?.enAttente ?? '...',      couleur: '#E8622A', icone: '⏳' },
    { label: 'Livrées',         valeur: stats?.livrees ?? '...',         couleur: '#27AE60', icone: '✅' },
    { label: 'Revenus (FCFA)',  valeur: stats ? stats.revenus.toLocaleString('fr-FR') : '...', couleur: '#2980B9', icone: '💰' },
  ];

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icone: '📊' },
    { path: '/admin/produits',  label: 'Produits',        icone: '📦' },
    { path: '/admin/commandes', label: 'Commandes',       icone: '🛒' },
    { path: '/admin/clients',   label: 'Clients',         icone: '👥' },
  ];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarLogo}>⚡ Admin</h2>
        <nav>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={styles.menuItem}>
              {item.icone} {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={deconnexion} style={styles.deconnexionBtn}>🚪 Déconnexion</button>
      </aside>

      {/* Contenu principal */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titre}>Tableau de bord</h1>
            <p style={styles.sousTitre}>Bonjour, {user?.prenom} 👋</p>
          </div>
        </div>

        {/* Cartes statistiques */}
        <div style={styles.cartesGrid}>
          {cartes.map((c) => (
            <div key={c.label} style={{ ...styles.carte, borderTop: `4px solid ${c.couleur}` }}>
              <div style={styles.carteIcone}>{c.icone}</div>
              <div style={{ ...styles.carteValeur, color: c.couleur }}>{c.valeur}</div>
              <div style={styles.carteLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Raccourcis */}
        <h2 style={styles.sectionTitre}>Accès rapide</h2>
        <div style={styles.raccourcisGrid}>
          <Link to="/admin/produits" style={styles.raccourci}>
            <span style={styles.raccourciIcone}>➕</span>
            <span>Ajouter un produit</span>
          </Link>
          <Link to="/admin/commandes" style={styles.raccourci}>
            <span style={styles.raccourciIcone}>📋</span>
            <span>Gérer les commandes</span>
          </Link>
          <Link to="/admin/clients" style={styles.raccourci}>
            <span style={styles.raccourciIcone}>👥</span>
            <span>Voir les clients</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout:         { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" },
  sidebar:        { width: '240px', background: '#1A3A2A', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: 0, height: '100vh' },
  sidebarLogo:    { color: '#fff', fontSize: '1.3rem', marginBottom: '32px', paddingLeft: '8px' },
  menuItem:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: '10px', fontSize: '0.93rem', marginBottom: '4px', transition: 'background 0.2s' },
  deconnexionBtn: { marginTop: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' },
  main:           { flex: 1, padding: '40px', background: '#F5F0E8', overflowY: 'auto' },
  header:         { marginBottom: '36px' },
  titre:          { fontSize: '1.8rem', fontWeight: '700', color: '#1C1C1C' },
  sousTitre:      { color: '#888', marginTop: '4px' },
  cartesGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
  carte:          { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  carteIcone:     { fontSize: '1.8rem', marginBottom: '12px' },
  carteValeur:    { fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' },
  carteLabel:     { fontSize: '0.85rem', color: '#888' },
  sectionTitre:   { fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px', color: '#1C1C1C' },
  raccourcisGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  raccourci:      { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '16px 24px', borderRadius: '12px', textDecoration: 'none', color: '#1C1C1C', fontWeight: '600', fontSize: '0.93rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  raccourciIcone: { fontSize: '1.3rem' },
};
