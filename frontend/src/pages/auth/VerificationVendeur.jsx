import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

const TYPES_PRODUITS = [
  'Electronique',
  'Electromenager',
  'Vetement',
  'Alimentation',
  'Beaute',
  'Sport',
  'Immobilier',
  'Autre',
];

const DELAIS = [
  { value: '', label: 'Non renseigne' },
  { value: 'moins_24h', label: 'Moins de 24 heures' },
  { value: '1_2_jours', label: '1 a 2 jours' },
  { value: '3_5_jours', label: '3 a 5 jours' },
  { value: 'plus_5_jours', label: 'Plus de 5 jours' },
];

export default function VerificationVendeur() {
  const { inscription } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const base = location.state?.inscription;
  const photoProfil = location.state?.photoProfil;
  const dateSignature = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [form, setForm] = useState({
    nomComplet: base ? `${base.prenom || ''} ${base.nom || ''}`.trim() : '',
    numeroPieceIdentite: '',
    villeResidence: '',
    quartierResidence: '',
    typesProduits: [],
    autreTypeProduit: '',
    delaiExpedition: '',
    declarationAcceptee: false,
    signatureElectronique: '',
  });
  const [photoIdentite, setPhotoIdentite] = useState(null);
  const [chargement, setChargement] = useState(false);

  if (!base) return <Navigate to="/inscription" replace />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleTypeProduit = (typeProduit) => {
    const existe = form.typesProduits.includes(typeProduit);
    setForm({
      ...form,
      typesProduits: existe
        ? form.typesProduits.filter((item) => item !== typeProduit)
        : [...form.typesProduits, typeProduit],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);

    const data = new FormData();
    Object.entries(base).forEach(([key, value]) => data.append(key, value));
    data.set('role', 'vendeur');
    if (photoProfil) data.append('photoProfil', photoProfil);
    if (photoIdentite) data.append('photoIdentiteEnMain', photoIdentite);

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'typesProduits') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value);
      }
    });
    data.append('dateSignature', dateSignature);

    try {
      const result = await inscription(data);
      toast.success(result.message || 'Dossier vendeur envoye. Votre compte est en attente de validation.');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible d envoyer le dossier vendeur.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoContainer}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
            <div style={styles.logoText}>TEY<span style={styles.logoAccent}>SHOP</span></div>
          </div>
        </Link>

        <h1 style={styles.title}>Verification vendeur</h1>
        <p style={styles.subtitle}>Ces informations aident l'administrateur a evaluer votre dossier avant validation.</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.champ}>
            <label style={styles.label}>Nom complet</label>
            <input name="nomComplet" value={form.nomComplet} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Numero de CNI / passport</label>
            <input name="numeroPieceIdentite" value={form.numeroPieceIdentite} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Photo avec la piece d'identite tenue en main</label>
            <label style={styles.fileBox}>
              <Icon name="camera" size={18} />
              <span>{photoIdentite ? photoIdentite.name : 'Choisir une photo'}</span>
              <input type="file" accept="image/*" onChange={(e) => setPhotoIdentite(e.target.files[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={styles.grid}>
            <div style={styles.champ}>
              <label style={styles.label}>Ville de residence</label>
              <input name="villeResidence" value={form.villeResidence} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.champ}>
              <label style={styles.label}>Quartier de residence</label>
              <input name="quartierResidence" value={form.quartierResidence} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Types de produits a commercialiser</label>
            <div style={styles.checkGrid}>
              {TYPES_PRODUITS.map((typeProduit) => (
                <label key={typeProduit} style={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={form.typesProduits.includes(typeProduit)}
                    onChange={() => toggleTypeProduit(typeProduit)}
                  />
                  <span>{typeProduit}</span>
                </label>
              ))}
            </div>
          </div>

          {form.typesProduits.includes('Autre') && (
            <div style={styles.champ}>
              <label style={styles.label}>Autre type de produit</label>
              <input name="autreTypeProduit" value={form.autreTypeProduit} onChange={handleChange} style={styles.input} />
            </div>
          )}

          <div style={styles.champ}>
            <label style={styles.label}>Delai d'expedition apres reception d'une commande</label>
            <select name="delaiExpedition" value={form.delaiExpedition} onChange={handleChange} style={styles.input}>
              {DELAIS.map((delai) => <option key={delai.value} value={delai.value}>{delai.label}</option>)}
            </select>
          </div>

          <div style={styles.declaration}>
            <p style={styles.declarationText}>
              Je certifie que toutes les informations fournies sont exactes et sinceres, je m'engage a respecter les conditions generale de vente sur Teyshop.
            </p>
            <label style={styles.checkItem}>
              <input name="declarationAcceptee" type="checkbox" checked={form.declarationAcceptee} onChange={handleChange} />
              <span>J'accepte et je signe electroniquement</span>
            </label>
          </div>

          <div style={styles.grid}>
            <div style={styles.champ}>
              <label style={styles.label}>Signature electronique</label>
              <input name="signatureElectronique" value={form.signatureElectronique} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.champ}>
              <label style={styles.label}>Date</label>
              <input value={dateSignature} readOnly style={{ ...styles.input, background: '#F8FAFC' }} />
            </div>
          </div>

          <button type="submit" disabled={chargement} style={styles.bouton}>
            {chargement ? 'Envoi en cours...' : 'Envoyer mon dossier vendeur'}
          </button>
        </form>

        <button type="button" onClick={() => navigate('/inscription')} style={styles.backBtn}>
          Retour a l'inscription
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--em-page)', padding: 'clamp(16px, 4vw, 28px)', fontFamily: "'DM Sans',sans-serif" },
  card: { width: '100%', maxWidth: 760, margin: '0 auto', background: 'var(--em-surface)', borderRadius: 8, padding: 'clamp(24px, 5vw, 38px)', boxShadow: 'var(--em-shadow-lg)', border: '1px solid var(--em-border)' },
  logoLink: { textDecoration: 'none' },
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 22 },
  logoImage: { height: 58, width: 'auto', objectFit: 'contain' },
  logoText: { fontSize: '1.35rem', fontWeight: 800, color: '#112219' },
  logoAccent: { color: '#C8410A' },
  title: { margin: '0 0 8px', color: '#112219', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' },
  subtitle: { color: '#666', margin: '0 0 24px', lineHeight: 1.5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  champ: { marginBottom: 16 },
  label: { display: 'block', marginBottom: 8, fontSize: '0.86rem', fontWeight: 700, color: '#444' },
  input: { width: '100%', boxSizing: 'border-box', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' },
  fileBox: { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed #C8410A', borderRadius: 8, padding: '13px 14px', color: '#C8410A', cursor: 'pointer', fontWeight: 700 },
  checkGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 },
  checkItem: { display: 'flex', alignItems: 'center', gap: 8, color: '#444', fontSize: '0.9rem' },
  declaration: { border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, marginBottom: 16, background: '#F8FAFC' },
  declarationText: { margin: '0 0 12px', color: '#444', lineHeight: 1.5 },
  bouton: { width: '100%', border: 'none', borderRadius: 8, padding: '14px 18px', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' },
  backBtn: { display: 'block', margin: '18px auto 0', border: 'none', background: 'transparent', color: '#777', cursor: 'pointer', fontWeight: 700 },
};
