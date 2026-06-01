import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

export default function AdminCategories() {
  const { user, deconnexion } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories/admin/toutes');
      setCategories(data.categories || []);
    } catch {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirAjout = () => {
    setEditingCat(null);
    setForm({ nom: '', description: '' });
    setShowModal(true);
  };

  const ouvrirEdition = (cat) => {
    setEditingCat(cat);
    setForm({ nom: cat.nom, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat._id}`, form);
        toast.success('Catégorie modifiée.');
      } else {
        await api.post('/categories', form);
        toast.success('Catégorie créée.');
      }
      setShowModal(false);
      charger();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const toggleActif = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { actif: !cat.actif });
      toast.success(`Catégorie ${!cat.actif ? 'activée' : 'désactivée'}.`);
      charger();
    } catch {
      toast.error('Erreur');
    }
  };

  const supprimer = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      toast.success('Catégorie supprimée.');
      charger();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const getNavLinkStyle = (id) => ({
    ...styles.navLink,
    color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
    background: hoveredLink === id ? 'rgba(255,255,255,0.08)' : 'transparent',
  });

  return (
    <div style={styles.layout} className="admin-responsive-layout">
      {/* Sidebar */}
      <aside style={styles.sidebar} className="admin-responsive-sidebar sidebar">
        <div style={styles.sidebarHeader}>
          <div style={styles.logoWrapper}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
          </div>
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>TeyShop</span>
            <span style={styles.sidebarBadge}>Admin</span>
          </div>
        </div>
        <nav style={styles.nav} className="admin-responsive-nav">
          <Link to="/admin/dashboard" style={getNavLinkStyle('dashboard')} onMouseEnter={() => setHoveredLink('dashboard')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="dashboard" size={18} color="#fff" /> Tableau de bord
          </Link>
          <Link to="/admin/produits" style={getNavLinkStyle('produits')} onMouseEnter={() => setHoveredLink('produits')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="package" size={18} color="#fff" /> Produits
          </Link>
          <Link to="/admin/categories" style={{ ...getNavLinkStyle('categories'), background: 'rgba(200,65,10,0.25)', borderLeft: '3px solid #C8410A' }} onMouseEnter={() => setHoveredLink('categories')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="tag" size={18} color="#fff" /> Catégories
          </Link>
          <Link to="/admin/commandes" style={getNavLinkStyle('commandes')} onMouseEnter={() => setHoveredLink('commandes')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="shopping-cart" size={18} color="#fff" /> Commandes
          </Link>
          <Link to="/admin/clients" style={getNavLinkStyle('clients')} onMouseEnter={() => setHoveredLink('clients')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="users" size={18} color="#fff" /> Utilisateurs
          </Link>
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user?.prenom?.[0] || 'A'}</div>
            <div>
              <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={() => { setIsLoggingOut(true); setTimeout(() => deconnexion(), 500); }} style={styles.deconnexionBtn}>
            <Icon name="log-out" size={18} color="#fff" />
            <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
            {!isLoggingOut && <span style={{ marginLeft: 'auto' }}>→</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main} className="admin-responsive-main">
        <div style={styles.header} className="responsive-header-row">
          <div>
            <h1 style={styles.titre}>Gestion des catégories</h1>
            <p style={styles.sousTitre}>{categories.length} catégorie(s) au total</p>
          </div>
          <button onClick={ouvrirAjout} style={styles.addBtn} className="responsive-full-button">
            <Icon name="plus" size={18} /> Nouvelle catégorie
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinnerLarge}></div>
            <p>Chargement...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏷️</div>
            <h3>Aucune catégorie</h3>
            <p>Créez votre première catégorie</p>
            <button onClick={ouvrirAjout} style={{ ...styles.addBtn, marginTop: '16px' }}>
              <Icon name="plus" size={16} /> Créer une catégorie
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {categories.map((cat) => (
              <div key={cat._id} style={{ ...styles.card, opacity: cat.actif ? 1 : 0.6 }}>
                <div style={styles.cardTop}>
                  <div style={styles.catIcon}>🏷️</div>
                  <div style={styles.cardActions}>
                    <button onClick={() => ouvrirEdition(cat)} style={styles.editBtn} title="Modifier">
                      <Icon name="edit" size={15} color="#555" />
                    </button>
                    <button onClick={() => toggleActif(cat)} style={{ ...styles.toggleBtn, background: cat.actif ? '#E8F5E9' : '#FFF3E0', color: cat.actif ? '#2E7D32' : '#F57C00' }} title={cat.actif ? 'Désactiver' : 'Activer'}>
                      {cat.actif ? '✓ Actif' : '⏸ Inactif'}
                    </button>
                    <button onClick={() => supprimer(cat)} style={styles.deleteBtn} title="Supprimer">
                      <Icon name="trash" size={15} color="#E74C3C" />
                    </button>
                  </div>
                </div>
                <h3 style={styles.catNom}>{cat.nom}</h3>
                {cat.description && <p style={styles.catDesc}>{cat.description}</p>}
                <div style={styles.catDate}>
                  Créée le {new Date(cat.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} className="responsive-modal" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingCat ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}
              </h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nom de la catégorie *</label>
                <input
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Informatique"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description (optionnel)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez cette catégorie..."
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.confirmBtn}>
                  {editingCat ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-large { width: 40px; height: 40px; border: 3px solid #f0f0f0; border-top-color: #C8410A; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
        @media (max-width: 768px) {
          .admin-responsive-layout { flex-direction: column !important; }
          .admin-responsive-sidebar { position: static !important; width: 100% !important; height: auto !important; padding: 16px !important; }
          .admin-responsive-nav { flex-direction: row !important; overflow-x: auto; padding-bottom: 4px; }
          .admin-responsive-nav a { white-space: nowrap; flex-shrink: 0; }
          .admin-responsive-main { padding: 16px !important; }
        }
      ` }} />
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F5F7FA' },
  sidebar: { width: '280px', background: 'linear-gradient(180deg, #1A3A2A 0%, #0E251B 100%)', padding: '28px 20px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoWrapper: { width: '42px', height: '42px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%', objectFit: 'cover' },
  logoContainer: { flex: 1 },
  logoText: { color: '#fff', fontSize: '1.1rem', fontWeight: '700' },
  sidebarBadge: { display: 'inline-block', background: '#C8410A', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  navLink: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: '12px', fontSize: '0.85rem', transition: 'all 0.2s ease' },
  sidebarFooter: { marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '8px' },
  userAvatar: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '600', color: '#fff' },
  userName: { color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '2px' },
  userEmail: { color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' },
  deconnexionBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', width: '100%' },
  main: { flex: 1, minWidth: 0, padding: 'clamp(18px, 4vw, 28px) clamp(16px, 4vw, 36px)', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  titre: { fontSize: '1.6rem', fontWeight: '700', color: '#112219', marginBottom: '6px' },
  sousTitre: { color: '#666', fontSize: '0.85rem' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '40px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #E8E8E8', transition: 'all 0.2s ease' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  catIcon: { fontSize: '1.8rem' },
  cardActions: { display: 'flex', alignItems: 'center', gap: '6px' },
  editBtn: { background: '#F0F0F0', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  toggleBtn: { border: 'none', borderRadius: '20px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { background: '#FEF0EE', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  catNom: { fontSize: '1.1rem', fontWeight: '700', color: '#112219', margin: '0 0 6px' },
  catDesc: { fontSize: '0.8rem', color: '#777', margin: '0 0 12px', lineHeight: 1.4 },
  catDate: { fontSize: '0.7rem', color: '#aaa' },
  loadingState: { textAlign: 'center', padding: '80px', color: '#999' },
  spinnerLarge: { width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTopColor: '#C8410A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' },
  emptyState: { textAlign: 'center', padding: '80px', color: '#999' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #E8E8E8' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#112219', margin: 0 },
  modalClose: { width: '34px', height: '34px', border: 'none', background: '#F8F9FA', borderRadius: '10px', cursor: 'pointer', fontSize: '1.2rem', color: '#666' },
  formGroup: { marginBottom: '20px' },
  formLabel: { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#444', marginBottom: '6px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E8E8E8' },
  cancelBtn: { padding: '12px 24px', border: '1.5px solid #E2E8F0', background: '#fff', borderRadius: '40px', cursor: 'pointer', fontSize: '0.85rem' },
  confirmBtn: { padding: '12px 28px', border: 'none', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', borderRadius: '40px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
};
