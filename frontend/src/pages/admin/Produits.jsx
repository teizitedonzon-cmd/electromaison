// src/pages/admin/Produits.jsx — Gestion des produits avec upload d'images
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const CATEGORIES = [
  { value: 'cuisine',             label: '🍳 Cuisine' },
  { value: 'froid',               label: '🧊 Réfrigération' },
  { value: 'lavage',              label: '🫧 Lavage' },
  { value: 'climatisation',       label: '❄️ Climatisation' },
  { value: 'petit_electromenager',label: '⚡ Petit Électroménager' },
];
const BADGES = ['', 'Promo', 'Nouveau', 'Best-seller'];

const formVide = {
  nom: '', description: '', prix: '', prixAncien: '',
  categorie: 'cuisine', marque: '', stock: '', badge: '',
};

export default function AdminProduits() {
  const [produits, setProduits]           = useState([]);
  const [modal, setModal]                 = useState(false);
  const [produitEnCours, setProduitEnCours] = useState(null);
  const [form, setForm]                   = useState(formVide);
  const [fichiers, setFichiers]           = useState(null);
  const [previews, setPreviews]           = useState([]);
  const [chargement, setChargement]       = useState(false);
  const [recherche, setRecherche]         = useState('');

  // ── Chargement des produits ──────────────────────────────
  const chargerProduits = async () => {
    try {
      const { data } = await api.get('/produits/admin/tous');
      setProduits(data.produits);
    } catch {
      toast.error('Erreur chargement produits');
    }
  };

  useEffect(() => { chargerProduits(); }, []);

  // ── Gestion des previews d'images ────────────────────────
  const handleFichiers = (e) => {
    const files = e.target.files;
    setFichiers(files);
    // Génère les aperçus
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  // ── Ouvrir modal création ────────────────────────────────
  const ouvrirCreation = () => {
    setForm(formVide);
    setFichiers(null);
    setPreviews([]);
    setProduitEnCours(null);
    setModal(true);
  };

  // ── Ouvrir modal édition ─────────────────────────────────
  const ouvrirEdition = (produit) => {
    setForm({
      nom:         produit.nom         || '',
      description: produit.description || '',
      prix:        produit.prix        || '',
      prixAncien:  produit.prixAncien  || '',
      categorie:   produit.categorie   || 'cuisine',
      marque:      produit.marque      || '',
      stock:       produit.stock       || '',
      badge:       produit.badge       || '',
    });
    // Affiche les images existantes comme previews
    setPreviews(
      produit.images && produit.images.length > 0
        ? produit.images.map((img) => `http://localhost:5000${img}`)
        : []
    );
    setFichiers(null);
    setProduitEnCours(produit);
    setModal(true);
  };

  const fermerModal = () => {
    setModal(false);
    setPreviews([]);
    setFichiers(null);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Soumission du formulaire ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      // FormData pour envoyer texte + fichiers ensemble
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== '' && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });
      if (fichiers && fichiers.length > 0) {
        Array.from(fichiers).forEach((f) => formData.append('images', f));
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (produitEnCours) {
        await api.put(`/produits/${produitEnCours._id}`, formData, config);
        toast.success('✅ Produit modifié avec succès !');
      } else {
        await api.post('/produits', formData, config);
        toast.success('✅ Produit créé avec succès !');
      }
      fermerModal();
      chargerProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setChargement(false);
    }
  };

  // ── Suppression ──────────────────────────────────────────
  const supprimer = async (id) => {
    if (!window.confirm('Supprimer ce produit ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/produits/${id}`);
      toast.success('Produit supprimé.');
      chargerProduits();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  // ── Filtrage ─────────────────────────────────────────────
  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.marque?.toLowerCase().includes(recherche.toLowerCase())
  );

  // ── MENU SIDEBAR ─────────────────────────────────────────
  const menuItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icone: '📊' },
    { path: '/admin/produits',  label: 'Produits',         icone: '📦' },
    { path: '/admin/commandes', label: 'Commandes',        icone: '🛒' },
    { path: '/admin/clients',   label: 'Clients',          icone: '👥' },
  ];

  return (
    <div style={styles.layout}>

      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>⚡ Admin</div>
        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} style={styles.menuItem}>
              <span>{item.icone}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <main style={styles.main}>

        {/* En-tête */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.titre}>Gestion des Produits</h1>
            <p style={styles.sousTitre}>{produits.length} produit(s) au total</p>
          </div>
          <button onClick={ouvrirCreation} style={styles.btnPrimaire}>
            + Nouveau produit
          </button>
        </div>

        {/* Barre de recherche */}
        <div style={styles.searchWrap}>
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou marque..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Tableau des produits */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                {['Image','Produit','Catégorie','Prix','Stock','Badge','Statut','Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {produitsFiltres.map((p) => (
                <tr key={p._id} style={styles.tr}>

                  {/* Image */}
                  <td style={styles.td}>
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${p.images[0]}`}
                        alt={p.nom}
                        style={styles.thumb}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={styles.thumbPlaceholder}>
                        {CATEGORIES.find(c => c.value === p.categorie)?.label.split(' ')[0] || '📦'}
                      </div>
                    )}
                  </td>

                  {/* Nom + Marque */}
                  <td style={styles.td}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.nom}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>{p.marque}</div>
                  </td>

                  <td style={styles.td}>
                    <span style={styles.catTag}>
                      {CATEGORIES.find(c => c.value === p.categorie)?.label || p.categorie}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={{ fontWeight: '700', color: '#1A3A2A' }}>
                      {Number(p.prix).toLocaleString('fr-FR')} FCFA
                    </div>
                    {p.prixAncien && (
                      <div style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '0.78rem' }}>
                        {Number(p.prixAncien).toLocaleString('fr-FR')} FCFA
                      </div>
                    )}
                  </td>

                  <td style={styles.td}>
                    <span style={{
                      fontWeight: '700',
                      color: p.stock === 0 ? '#E74C3C' : p.stock < 5 ? '#E67E22' : '#27AE60'
                    }}>
                      {p.stock} unités
                    </span>
                  </td>

                  <td style={styles.td}>
                    {p.badge ? (
                      <span style={styles.badgeTag}>{p.badge}</span>
                    ) : <span style={{ color: '#ccc' }}>—</span>}
                  </td>

                  <td style={styles.td}>
                    <span style={{
                      ...styles.statutTag,
                      background: p.actif ? '#D5F5E3' : '#FADBD8',
                      color: p.actif ? '#1E8449' : '#C0392B',
                    }}>
                      {p.actif ? '✅ Actif' : '🚫 Masqué'}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => ouvrirEdition(p)} style={styles.btnEdit}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => supprimer(p._id)} style={styles.btnDel}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {produitsFiltres.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── MODAL CRÉATION / ÉDITION ── */}
      {modal && (
        <div style={styles.overlay} onClick={fermerModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {/* En-tête modal */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitre}>
                {produitEnCours ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
              </h2>
              <button onClick={fermerModal} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── Section : Informations générales ── */}
              <div style={styles.sectionLabel}>Informations générales</div>
              <div style={styles.gridDeux}>
                <div style={styles.champ}>
                  <label style={styles.label}>Nom du produit *</label>
                  <input
                    type="text" name="nom" required
                    value={form.nom} onChange={handleChange}
                    placeholder="Ex: Réfrigérateur Samsung 200L"
                    style={styles.input}
                  />
                </div>
                <div style={styles.champ}>
                  <label style={styles.label}>Marque *</label>
                  <input
                    type="text" name="marque" required
                    value={form.marque} onChange={handleChange}
                    placeholder="Ex: Samsung, LG, Bosch..."
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.champ}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description" required
                  value={form.description} onChange={handleChange}
                  placeholder="Décrivez le produit : caractéristiques, avantages..."
                  rows={3}
                  style={{ ...styles.input, resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

              {/* ── Section : Prix & Stock ── */}
              <div style={styles.sectionLabel}>Prix & Stock</div>
              <div style={styles.gridTrois}>
                <div style={styles.champ}>
                  <label style={styles.label}>Prix (FCFA) *</label>
                  <input
                    type="number" name="prix" required min="0"
                    value={form.prix} onChange={handleChange}
                    placeholder="Ex: 450000"
                    style={styles.input}
                  />
                </div>
                <div style={styles.champ}>
                  <label style={styles.label}>Ancien prix (optionnel)</label>
                  <input
                    type="number" name="prixAncien" min="0"
                    value={form.prixAncien} onChange={handleChange}
                    placeholder="Ex: 520000"
                    style={styles.input}
                  />
                </div>
                <div style={styles.champ}>
                  <label style={styles.label}>Stock *</label>
                  <input
                    type="number" name="stock" required min="0"
                    value={form.stock} onChange={handleChange}
                    placeholder="Ex: 15"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* ── Section : Catégorie & Badge ── */}
              <div style={styles.sectionLabel}>Classification</div>
              <div style={styles.gridDeux}>
                <div style={styles.champ}>
                  <label style={styles.label}>Catégorie *</label>
                  <select
                    name="categorie" value={form.categorie}
                    onChange={handleChange} style={styles.input}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.champ}>
                  <label style={styles.label}>Badge promotionnel</label>
                  <select
                    name="badge" value={form.badge}
                    onChange={handleChange} style={styles.input}
                  >
                    {BADGES.map((b) => (
                      <option key={b} value={b}>{b || 'Aucun badge'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Section : Images ── */}
              <div style={styles.sectionLabel}>Images du produit</div>
              <div style={styles.champ}>
                <label style={styles.label}>
                  Sélectionner des images (JPG, PNG, WEBP — max 3 fichiers, 5MB chacun)
                </label>

                {/* Zone de dépôt d'images */}
                <label style={styles.uploadZone}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFichiers}
                    style={{ display: 'none' }}
                  />
                  <div style={styles.uploadIcone}>📷</div>
                  <div style={styles.uploadTexte}>
                    {fichiers && fichiers.length > 0
                      ? `${fichiers.length} fichier(s) sélectionné(s)`
                      : 'Cliquer pour choisir des images'}
                  </div>
                  <div style={styles.uploadSous}>
                    ou glisser-déposer ici
                  </div>
                </label>

                {/* Aperçus des images */}
                {previews.length > 0 && (
                  <div style={styles.previewsWrap}>
                    {previews.map((url, i) => (
                      <div key={i} style={styles.previewItem}>
                        <img
                          src={url}
                          alt={`Aperçu ${i + 1}`}
                          style={styles.previewImg}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div style={styles.previewLabel}>Image {i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}

                {produitEnCours && (!fichiers || fichiers.length === 0) && previews.length === 0 && (
                  <p style={{ color: '#888', fontSize: '0.82rem', marginTop: '8px' }}>
                    ℹ️ Ce produit n'a pas encore d'images. Sélectionne des fichiers pour en ajouter.
                  </p>
                )}
              </div>

              {/* ── Boutons d'action ── */}
              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={fermerModal}
                  style={styles.btnSecondaire}
                  disabled={chargement}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={styles.btnPrimaire}
                  disabled={chargement}
                >
                  {chargement
                    ? '⏳ Enregistrement...'
                    : produitEnCours
                      ? '✅ Enregistrer les modifications'
                      : '✅ Créer le produit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────
const styles = {
  layout:        { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#F5F0E8' },

  // Sidebar
  sidebar:       { width: '240px', background: '#1A3A2A', padding: '32px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  sidebarLogo:   { color: '#fff', fontFamily: 'Georgia, serif', fontSize: '1.3rem', marginBottom: '32px', paddingLeft: '8px' },
  menuItem:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '4px', fontWeight: '500' },

  // Main
  main:          { flex: 1, padding: '36px 40px', overflowY: 'auto' },
  topBar:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titre:         { fontSize: '1.8rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' },
  sousTitre:     { color: '#888', fontSize: '0.88rem' },

  // Recherche
  searchWrap:    { marginBottom: '24px' },
  searchInput:   { padding: '11px 20px', borderRadius: '50px', border: '1.5px solid #E2DAD0', background: '#fff', fontSize: '0.93rem', fontFamily: 'inherit', outline: 'none', width: '360px' },

  // Tableau
  tableWrap:     { background: '#fff', borderRadius: '16px', overflow: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  theadRow:      { background: '#f8f6f2', borderBottom: '2px solid #EDE8E0' },
  th:            { padding: '13px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' },
  tr:            { borderBottom: '1px solid #F5F0E8', transition: 'background 0.15s' },
  td:            { padding: '14px 16px', fontSize: '0.88rem', verticalAlign: 'middle' },

  // Miniature image
  thumb:         { width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2DAD0' },
  thumbPlaceholder: { width: '52px', height: '52px', borderRadius: '10px', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: '1px solid #E2DAD0' },

  // Tags
  catTag:        { background: '#EAF3DE', color: '#3B6D11', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' },
  badgeTag:      { background: '#FDE8DC', color: '#993C1D', padding: '4px 10px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '700' },
  statutTag:     { padding: '4px 12px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '700' },

  // Boutons tableau
  btnEdit:       { background: '#EBF5FB', color: '#2980B9', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' },
  btnDel:        { background: '#FADBD8', color: '#C0392B', border: 'none', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem' },

  // Boutons principaux
  btnPrimaire:   { background: '#C8410A', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' },
  btnSecondaire: { background: '#eee', color: '#555', border: 'none', padding: '12px 22px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit' },

  // Modal
  overlay:       { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal:         { background: '#fff', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  modalTitre:    { fontSize: '1.3rem', fontWeight: '700', color: '#1C1C1C' },
  closeBtn:      { background: '#F5F0E8', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalActions:  { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F0EDE8' },

  // Sections dans le formulaire
  sectionLabel:  { fontSize: '0.75rem', fontWeight: '700', color: '#C8410A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', marginTop: '24px', paddingBottom: '8px', borderBottom: '1px solid #F0EDE8' },

  // Grilles
  gridDeux:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  gridTrois:     { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },

  // Champs
  champ:         { marginBottom: '16px' },
  label:         { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#444' },
  input:         { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2DAD0', fontSize: '0.93rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#FDFCFA' },

  // Zone upload
  uploadZone:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '2px dashed #D4C8BC', borderRadius: '14px', padding: '32px 20px', cursor: 'pointer', background: '#FDFCFA', transition: 'border-color 0.2s', textAlign: 'center' },
  uploadIcone:   { fontSize: '2.4rem' },
  uploadTexte:   { fontSize: '0.93rem', fontWeight: '600', color: '#444' },
  uploadSous:    { fontSize: '0.8rem', color: '#999' },

  // Previews
  previewsWrap:  { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' },
  previewItem:   { textAlign: 'center' },
  previewImg:    { width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #E2DAD0', display: 'block' },
  previewLabel:  { fontSize: '0.75rem', color: '#888', marginTop: '4px' },
};
