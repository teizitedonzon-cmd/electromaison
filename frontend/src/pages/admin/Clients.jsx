import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import Icon from '../../components/Icon';

export default function AdminClients() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [vue, setVue] = useState('client');

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
    <div style={styles.page}>
      <div style={styles.header}>
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

      <div style={styles.tableCard}>
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
                  <button onClick={() => toggleStatut(u._id, u.actif)} style={{ ...styles.btn, background: u.actif ? '#e74c3c' : '#2ecc71' }}>
                    {u.actif ? 'Bannir' : 'Activer'}
                  </button>
                  {vue === 'vendeur' && (
                    <>
                      <button onClick={() => changerStatutVendeur(u._id, 'approuve')} style={{ ...styles.btn, background: '#1E8449', marginLeft: '8px' }}>Approuver</button>
                      <button onClick={() => changerStatutVendeur(u._id, 'rejete')} style={{ ...styles.btn, background: '#B03A2E', marginLeft: '8px' }}>Rejeter</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const badgeVendeur = (statut) => {
  if (statut === 'approuve') return { background: '#D5F5E3', color: '#1E8449' };
  if (statut === 'rejete') return { background: '#FADBD8', color: '#C0392B' };
  return { background: '#FEF5E7', color: '#B9770E' };
};

const styles = {
  page: { padding: '30px', background: '#F5F0E8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 26 },
  title: { margin: 0, color: '#1C1C1C', fontSize: '1.7rem' },
  tabs: { display: 'flex', gap: 12 },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#ddd', color: '#333' },
  tabActive: { background: '#1A3A2A', color: '#fff' },
  tabActiveOrange: { background: '#C8410A', color: '#fff' },
  tableCard: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f4f4f4' },
  th: { padding: '15px', textAlign: 'left' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '15px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  badge: { padding: '5px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' },
  btn: { color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '5px', cursor: 'pointer' }
};
