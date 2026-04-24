// src/pages/admin/Clients.jsx — Gestion des clients
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => setClients(data)).catch(() => toast.error('Erreur'));
  }, []);

  const toggleActif = async (id, actuel) => {
    try {
      await api.put(`/users/${id}/actif`, { actif: !actuel });
      setClients(prev => prev.map(c => c._id === id ? { ...c, actif: !actuel } : c));
      toast.success('Statut mis à jour !');
    } catch { toast.error('Erreur.'); }
  };

  const filtres = clients.filter(c =>
    `${c.nom} ${c.prenom} ${c.email}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarLogo}>⚡ Admin</h2>
        {[['📊','Tableau de bord','/admin/dashboard'],['📦','Produits','/admin/produits'],['🛒','Commandes','/admin/commandes'],['👥','Clients','/admin/clients']].map(([ic,lb,pt]) => (
          <Link key={pt} to={pt} style={styles.menuItem}>{ic} {lb}</Link>
        ))}
      </aside>

      <main style={styles.main}>
        <h1 style={styles.titre}>Clients ({clients.length})</h1>
        <input
          type="text" placeholder="🔍 Rechercher un client..."
          value={recherche} onChange={e => setRecherche(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {['Nom','Email','Téléphone','Inscription','Statut','Action'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtres.map((c) => (
                <tr key={c._id} style={styles.tr}>
                  <td style={styles.td}><strong>{c.prenom} {c.nom}</strong></td>
                  <td style={styles.td}>{c.email}</td>
                  <td style={styles.td}>{c.telephone || '—'}</td>
                  <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: c.actif ? '#D5F5E3':'#FADBD8', color: c.actif ? '#1E8449':'#C0392B' }}>
                      {c.actif ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleActif(c._id, c.actif)}
                      style={{ ...styles.btn, background: c.actif ? '#FADBD8':'#D5F5E3', color: c.actif ? '#C0392B':'#1E8449' }}>
                      {c.actif ? '🚫 Désactiver' : '✅ Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout:      { display:'flex', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" },
  sidebar:     { width:'240px', background:'#1A3A2A', padding:'32px 20px', display:'flex', flexDirection:'column', gap:'8px', position:'sticky', top:0, height:'100vh' },
  sidebarLogo: { color:'#fff', fontSize:'1.3rem', marginBottom:'32px', paddingLeft:'8px' },
  menuItem:    { display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', color:'rgba(255,255,255,0.8)', textDecoration:'none', borderRadius:'10px', fontSize:'0.93rem', marginBottom:'4px' },
  main:        { flex:1, padding:'40px', background:'#F5F0E8', overflowY:'auto' },
  titre:       { fontSize:'1.8rem', fontWeight:'700', marginBottom:'20px', color:'#1C1C1C' },
  searchInput: { padding:'12px 20px', borderRadius:'50px', border:'1.5px solid #E2DAD0', background:'#fff', fontSize:'0.93rem', fontFamily:'inherit', outline:'none', marginBottom:'24px', width:'320px' },
  tableWrap:   { background:'#fff', borderRadius:'16px', overflow:'auto', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  table:       { width:'100%', borderCollapse:'collapse' },
  thead:       { background:'#f8f6f2' },
  th:          { padding:'14px 16px', textAlign:'left', fontSize:'0.82rem', fontWeight:'700', color:'#888', textTransform:'uppercase' },
  tr:          { borderBottom:'1px solid #F0EDE8' },
  td:          { padding:'14px 16px', fontSize:'0.9rem' },
  badge:       { padding:'4px 12px', borderRadius:'50px', fontSize:'0.78rem', fontWeight:'700' },
  btn:         { padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:'600' },
};
