// src/pages/admin/Commandes.jsx — Gestion des commandes
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const STATUTS = ['en_attente','confirmee','en_livraison','livree','annulee'];
const COULEURS_STATUT = {
  en_attente: { bg:'#FEF9C3', color:'#B45309' },
  confirmee:  { bg:'#DBEAFE', color:'#1D4ED8' },
  en_livraison:{ bg:'#E0F2FE', color:'#0369A1' },
  livree:     { bg:'#D1FAE5', color:'#065F46' },
  annulee:    { bg:'#FEE2E2', color:'#B91C1C' },
};

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [detail, setDetail] = useState(null);

  const charger = async () => {
    try {
      const params = filtreStatut ? `?statut=${filtreStatut}` : '';
      const { data } = await api.get(`/commandes${params}`);
      setCommandes(data.commandes);
    } catch { toast.error('Erreur chargement commandes'); }
  };

  useEffect(() => { charger(); }, [filtreStatut]);

  const changerStatut = async (id, statut) => {
    try {
      await api.put(`/commandes/${id}/statut`, { statut });
      toast.success('Statut mis à jour !');
      charger();
    } catch { toast.error('Erreur.'); }
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarLogo}>⚡ Admin</h2>
        {[['📊','Tableau de bord','/admin/dashboard'],['📦','Produits','/admin/produits'],['🛒','Commandes','/admin/commandes'],['👥','Clients','/admin/clients']].map(([ic,lb,pt]) => (
          <Link key={pt} to={pt} style={styles.menuItem}>{ic} {lb}</Link>
        ))}
      </aside>

      <main style={styles.main}>
        <h1 style={styles.titre}>Gestion des Commandes</h1>

        {/* Filtres par statut */}
        <div style={styles.filtres}>
          <button onClick={() => setFiltreStatut('')} style={{ ...styles.filtrBtn, ...(filtreStatut === '' ? styles.filtrActif : {}) }}>
            Toutes
          </button>
          {STATUTS.map(s => (
            <button key={s} onClick={() => setFiltreStatut(s)}
              style={{ ...styles.filtrBtn, ...(filtreStatut === s ? styles.filtrActif : {}) }}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {['Réf.','Client','Montant','Statut','Paiement','Date','Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c._id} style={styles.tr}>
                  <td style={styles.td}><code style={{fontSize:'0.78rem'}}>{c._id.slice(-6).toUpperCase()}</code></td>
                  <td style={styles.td}>
                    <strong>{c.client?.prenom} {c.client?.nom}</strong><br/>
                    <small style={{color:'#888'}}>{c.client?.telephone}</small>
                  </td>
                  <td style={styles.td}><strong>{c.montantTotal.toLocaleString('fr-FR')} FCFA</strong></td>
                  <td style={styles.td}>
                    <select
                      value={c.statut}
                      onChange={(e) => changerStatut(c._id, e.target.value)}
                      style={{ ...styles.statutSelect, ...COULEURS_STATUT[c.statut] }}
                    >
                      {STATUTS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}>{c.modePaiement}</td>
                  <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>
                    <button onClick={() => setDetail(c)} style={styles.btnDetail}>👁️ Détail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal détail commande */}
        {detail && (
          <div style={styles.overlay} onClick={() => setDetail(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitre}>Commande #{detail._id.slice(-6).toUpperCase()}</h2>
              <p><strong>Client :</strong> {detail.client?.prenom} {detail.client?.nom}</p>
              <p><strong>Email :</strong> {detail.client?.email}</p>
              <p style={{marginTop:'16px'}}><strong>Adresse de livraison :</strong></p>
              <p>{detail.adresseLivraison?.rue}, {detail.adresseLivraison?.ville}</p>
              <p style={{marginTop:'16px'}}><strong>Articles :</strong></p>
              {detail.lignes?.map((l, i) => (
                <div key={i} style={styles.ligneDetail}>
                  <span>{l.nomProduit}</span>
                  <span>x{l.quantite}</span>
                  <span>{l.sousTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
              <div style={styles.totalDetail}>Total : {detail.montantTotal.toLocaleString('fr-FR')} FCFA</div>
              {detail.notes && <p style={{marginTop:'12px',color:'#888'}}>Note : {detail.notes}</p>}
              <button onClick={() => setDetail(null)} style={{...styles.btnPrimaire, marginTop:'20px'}}>Fermer</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout:       { display:'flex', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" },
  sidebar:      { width:'240px', background:'#1A3A2A', padding:'32px 20px', display:'flex', flexDirection:'column', gap:'8px', position:'sticky', top:0, height:'100vh' },
  sidebarLogo:  { color:'#fff', fontSize:'1.3rem', marginBottom:'32px', paddingLeft:'8px' },
  menuItem:     { display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', color:'rgba(255,255,255,0.8)', textDecoration:'none', borderRadius:'10px', fontSize:'0.93rem', marginBottom:'4px' },
  main:         { flex:1, padding:'40px', background:'#F5F0E8', overflowY:'auto' },
  titre:        { fontSize:'1.8rem', fontWeight:'700', marginBottom:'24px', color:'#1C1C1C' },
  filtres:      { display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'24px' },
  filtrBtn:     { padding:'8px 18px', borderRadius:'50px', border:'1.5px solid #E2DAD0', background:'#fff', cursor:'pointer', fontSize:'0.85rem', fontWeight:'600' },
  filtrActif:   { background:'#1A3A2A', color:'#fff', borderColor:'#1A3A2A' },
  tableWrap:    { background:'#fff', borderRadius:'16px', overflow:'auto', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#f8f6f2' },
  th:           { padding:'14px 16px', textAlign:'left', fontSize:'0.82rem', fontWeight:'700', color:'#888', textTransform:'uppercase' },
  tr:           { borderBottom:'1px solid #F0EDE8' },
  td:           { padding:'14px 16px', fontSize:'0.88rem', verticalAlign:'middle' },
  statutSelect: { padding:'6px 10px', borderRadius:'8px', border:'none', fontWeight:'700', fontSize:'0.82rem', cursor:'pointer' },
  btnDetail:    { background:'#EBF5FB', color:'#2980B9', border:'none', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'0.82rem' },
  btnPrimaire:  { background:'#C8410A', color:'#fff', border:'none', padding:'12px 24px', borderRadius:'50px', fontWeight:'700', cursor:'pointer' },
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
  modal:        { background:'#fff', borderRadius:'20px', padding:'36px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto' },
  modalTitre:   { fontSize:'1.3rem', fontWeight:'700', marginBottom:'20px' },
  ligneDetail:  { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:'0.9rem' },
  totalDetail:  { fontWeight:'800', fontSize:'1.1rem', marginTop:'12px', textAlign:'right', color:'#C8410A' },
};
