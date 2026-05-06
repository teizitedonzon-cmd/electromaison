import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Icon from '../../components/Icon';

const COULEURS = {
  en_attente: { bg: '#FEF9C3', color: '#B45309' },
  confirmee: { bg: '#DBEAFE', color: '#1D4ED8' },
  en_livraison: { bg: '#E0F2FE', color: '#0369A1' },
  livree: { bg: '#D1FAE5', color: '#065F46' },
  annulee: { bg: '#FEE2E2', color: '#B91C1C' },
};
const ICONES_STATUT = { en_attente: 'clock', confirmee: 'check', en_livraison: 'cart', livree: 'check', annulee: 'logout' };

export default function MesCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get('/commandes/mes-commandes').then(({ data }) => setCommandes(data)).catch(console.error);
  }, []);

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Tey<span style={{ color: '#F4A76A' }}>Shop</span></Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
          <Link to="/mes-commandes" style={styles.navLink}>Mes commandes</Link>
          <Link to="/profil" style={styles.navLink}>Profil</Link>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.titre}>Mes commandes</h1>
        {commandes.length === 0 ? (
          <div style={styles.vide}>
            <Icon name="package" size={58} color="#C8410A" />
            <p>Vous n'avez pas encore de commandes.</p>
            <Link to="/catalogue" style={styles.btnPrimaire}>Faire mes achats</Link>
          </div>
        ) : commandes.map((c) => (
          <div key={c._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.refText}>Commande #{c._id.slice(-6).toUpperCase()}</div>
                <div style={styles.dateText}>{new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
              <span style={{ ...styles.statutBadge, ...COULEURS[c.statut] }}>
                <Icon name={ICONES_STATUT[c.statut]} size={14} /> {c.statut.replace('_', ' ')}
              </span>
            </div>
            <div style={styles.cardBody}>
              <span>{c.lignes?.length} article(s)</span>
              <span style={styles.montant}>{Number(c.montantTotal).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <button onClick={() => setDetail(c)} style={styles.btnDetail}>Voir le detail</button>
          </div>
        ))}
      </div>

      {detail && (
        <div style={styles.overlay} onClick={() => setDetail(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '16px' }}>Commande #{detail._id.slice(-6).toUpperCase()}</h2>
            <p><strong>Statut :</strong> {detail.statut.replace('_', ' ')}</p>
            <p><strong>Livraison :</strong> {detail.adresseLivraison?.rue}, {detail.adresseLivraison?.ville}</p>
            <p><strong>Paiement :</strong> {detail.modePaiement}</p>
            <p style={{ marginTop: '16px', fontWeight: '700' }}>Articles :</p>
            {detail.lignes?.map((l, i) => (
              <div key={i} style={styles.ligne}>
                <span>{l.nomProduit} x {l.quantite}</span>
                <span>{Number(l.sousTotal).toLocaleString('fr-FR')} FCFA</span>
              </div>
            ))}
            <div style={styles.total}>Total : {Number(detail.montantTotal).toLocaleString('fr-FR')} FCFA</div>
            <button onClick={() => setDetail(null)} style={{ ...styles.btnPrimaire, marginTop: '20px', border: 'none', cursor: 'pointer' }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F5F0E8', fontFamily: "'DM Sans',sans-serif" },
  nav: { background: '#1A3A2A', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' },
  logo: { fontFamily: 'Georgia,serif', fontSize: '1.5rem', color: '#fff', textDecoration: 'none' },
  navLink: { color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '40px 20px' },
  titre: { fontSize: '1.8rem', fontWeight: '700', marginBottom: '28px', color: '#1C1C1C' },
  vide: { textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#888' },
  card: { background: '#fff', borderRadius: '16px', padding: '22px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  refText: { fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' },
  dateText: { color: '#888', fontSize: '0.83rem' },
  statutBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700' },
  cardBody: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', marginBottom: '14px' },
  montant: { fontWeight: '800', color: '#1A3A2A', fontSize: '1rem' },
  btnDetail: { background: '#F5F0E8', color: '#1C1C1C', border: 'none', padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  btnPrimaire: { background: '#C8410A', color: '#fff', padding: '12px 28px', borderRadius: '50px', fontWeight: '700', fontSize: '0.93rem', textDecoration: 'none', display: 'inline-block' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#fff', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  ligne: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' },
  total: { fontWeight: '800', textAlign: 'right', marginTop: '12px', color: '#C8410A', fontSize: '1.1rem' },
};
