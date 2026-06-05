import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import Icon from '../../components/Icon';

export default function AdminClients() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [vue, setVue] = useState('client');
  const [dossierVendeur, setDossierVendeur] = useState(null);

  const chargerData = async () => {
    try {
      const { data } = await api.get('/users');
      setUtilisateurs(data);
    } catch {
      toast.error('Erreur de chargement');
    }
  };

  useEffect(() => { chargerData(); }, []);

  const toggleStatut = async (id, actuel) => {
    try {
      await api.put(`/users/${id}/actif`, { actif: !actuel });
      toast.success('Mis a jour !');
      chargerData();
    } catch { toast.error('Erreur'); }
  };

  const changerStatutVendeur = async (id, statutVendeur) => {
    try {
      await api.put(`/users/${id}/statut-vendeur`, { statutVendeur });
      toast.success('Statut vendeur mis a jour !');
      chargerData();
    } catch { toast.error('Erreur'); }
  };

  const filtres = utilisateurs.filter((u) => u.role === vue);

  return (
    <div style={styles.page} className="responsive-page-padding">
      <div style={styles.header} className="responsive-header-row">
        <h1 style={styles.title}>Gestion des utilisateurs</h1>
        <div style={styles.tabs}>
          <button onClick={() => setVue('client')} style={{ ...styles.tab, ...(vue === 'client' ? styles.tabActive : {}) }}>
            <Icon name="users" size={17} /> Clients
          </button>
          <button onClick={() => setVue('vendeur')} style={{ ...styles.tab, ...(vue === 'vendeur' ? styles.tabActiveOrange : {}) }}>
            <Icon name="shop" size={17} /> Vendeurs
          </button>
        </div>
      </div>

      <div style={styles.tableCard} className="responsive-table">
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Photo</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              {vue === 'vendeur' && <th style={styles.th}>Validation</th>}
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map((u) => (
              <tr key={u._id} style={styles.tr}>
                <td style={styles.td}><img src={u.photoProfil ? mediaUrl(u.photoProfil) : '/avatar.png'} style={styles.avatar} alt="profil" /></td>
                <td style={styles.td}>{u.nom} {u.prenom}</td>
                <td style={styles.td}>{u.email}</td>
                {vue === 'vendeur' && (
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeVendeur(u.statutVendeur) }}>{u.statutVendeur || 'en_attente'}</span>
                  </td>
                )}
                <td style={styles.td}>
                  <div style={styles.actions}>
                  <button onClick={() => toggleStatut(u._id, u.actif)} style={{ ...styles.btn, background: u.actif ? '#e74c3c' : '#2ecc71' }}>
                    {u.actif ? 'Bannir' : 'Activer'}
                  </button>
                  {vue === 'vendeur' && (
                    <>
                      <button onClick={() => setDossierVendeur(u)} style={{ ...styles.btn, background: '#34495E', marginLeft: '8px' }}>Dossier</button>
                      <button onClick={() => changerStatutVendeur(u._id, 'approuve')} style={{ ...styles.btn, background: '#1E8449', marginLeft: '8px' }}>Approuver</button>
                      <button onClick={() => changerStatutVendeur(u._id, 'rejete')} style={{ ...styles.btn, background: '#B03A2E', marginLeft: '8px' }}>Rejeter</button>
                    </>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dossierVendeur && (
        <div style={styles.overlay} onClick={() => setDossierVendeur(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Dossier vendeur</h2>
              <button onClick={() => setDossierVendeur(null)} style={styles.closeBtn}>Fermer</button>
            </div>
            <DossierVendeur user={dossierVendeur} />
          </div>
        </div>
      )}
    </div>
  );
}

const formatDelai = (delai) => ({
  moins_24h: 'Moins de 24 heures',
  '1_2_jours': '1 a 2 jours',
  '3_5_jours': '3 a 5 jours',
  plus_5_jours: 'Plus de 5 jours',
}[delai] || 'Non renseigne');

const DossierVendeur = ({ user }) => {
  const dossier = user.verificationVendeur || {};
  const isDataUrlPng = (val) => typeof val === 'string' && val.startsWith('data:image/');

  const lignes = [
    ['Nom complet', dossier.nomComplet],
    ['CNI / Passport', dossier.numeroPieceIdentite],
    ['Ville', dossier.villeResidence],
    ['Quartier', dossier.quartierResidence],
    ['Types de produits', dossier.typesProduits?.length ? dossier.typesProduits.join(', ') : 'Non renseigne'],
    ['Autre precision', dossier.autreTypeProduit],
    ['Delai expedition', formatDelai(dossier.delaiExpedition)],
    ['Declaration', dossier.declarationAcceptee ? 'Acceptee' : 'Non acceptee'],
    ['Signature', isDataUrlPng(dossier.signatureElectronique) ? dossier.signatureElectronique : 'Non renseignee'],

    ['Date signature', dossier.dateSignature ? new Date(dossier.dateSignature).toLocaleDateString('fr-FR') : 'Non renseignee'],


    ['Soumis le', dossier.soumisLe ? new Date(dossier.soumisLe).toLocaleString('fr-FR') : 'Non renseigne'],
  ];

  return (
    <div>
      <div style={styles.identityBlock}>
        <img src={user.photoProfil ? mediaUrl(user.photoProfil) : '/avatar.png'} style={styles.avatarLarge} alt="profil" />
        <div>
          <div style={styles.identityName}>{user.prenom} {user.nom}</div>
          <div style={styles.identityMeta}>{user.email}</div>
          <div style={styles.identityMeta}>{user.telephone || 'Telephone non renseigne'}</div>
        </div>
      </div>

      <div style={styles.infoGrid}>
        {lignes.map(([label, value]) => (
          <div key={label} style={styles.infoItem}>
            <span style={styles.infoLabel}>{label}</span>
            <strong style={styles.infoValue}>{value || 'Non renseigne'}</strong>
          </div>
        ))}
      </div>

      {dossier.photoIdentiteEnMain && (
        <a href={mediaUrl(dossier.photoIdentiteEnMain)} target="_blank" rel="noreferrer" style={styles.identityPhotoLink}>
          Voir la photo avec piece d'identite
        </a>
      )}
    </div>
  );
};

const badgeVendeur = (statut) => {
  if (statut === 'approuve') return { background: '#D5F5E3', color: '#1E8449' };
  if (statut === 'rejete') return { background: '#FADBD8', color: '#C0392B' };
  return { background: '#FEF5E7', color: '#B9770E' };
};

const styles = {
  page: { padding: 'clamp(18px, 4vw, 30px)', background: '#F5F0E8', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 26 },
  title: { margin: 0, color: '#1C1C1C', fontSize: 'clamp(1.3rem, 5vw, 1.7rem)' },
  tabs: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#ddd', color: '#333' },
  tabActive: { background: '#1A3A2A', color: '#fff' },
  tabActiveOrange: { background: '#C8410A', color: '#fff' },
  tableCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'auto' },
  table: { width: '100%', minWidth: '640px', borderCollapse: 'collapse' },
  thead: { background: '#f4f4f4' },
  th: { padding: '15px', textAlign: 'left' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '15px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  badge: { padding: '5px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' },
  actions: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  btn: { color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '5px', cursor: 'pointer', marginLeft: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.24)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 },
  modalTitle: { margin: 0, fontSize: '1.25rem', color: '#112219' },
  closeBtn: { border: '1px solid #ddd', background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 },
  identityBlock: { display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #eee', marginBottom: 16 },
  avatarLarge: { width: 58, height: 58, borderRadius: '50%', objectFit: 'cover' },
  identityName: { fontWeight: 800, color: '#112219' },
  identityMeta: { color: '#666', fontSize: '0.9rem', marginTop: 3 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 },
  infoItem: { border: '1px solid #eee', borderRadius: 8, padding: 12, background: '#FAFAFA' },
  infoLabel: { display: 'block', color: '#777', fontSize: '0.78rem', marginBottom: 5 },
  infoValue: { color: '#222', overflowWrap: 'anywhere' },
  identityPhotoLink: { display: 'inline-block', marginTop: 16, color: '#C8410A', fontWeight: 800, textDecoration: 'none' }
};
