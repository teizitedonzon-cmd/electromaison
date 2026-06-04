import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import ClientNav from '../../components/ClientNav';

export default function Profil() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ 
    nom: user?.nom || '', 
    prenom: user?.prenom || '', 
    email: user?.email || '',
    telephone: user?.telephone || '',
    currentMotDePasse: '',
    motDePasse: ''
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.photoProfil ? mediaUrl(user.photoProfil) : '');
  const [chargement, setChargement] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  useEffect(() => {
    setForm({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      currentMotDePasse: '',
      motDePasse: ''
    });
    setPreview(user?.photoProfil ? mediaUrl(user.photoProfil) : '');
  }, [user]);

  const changerPhoto = (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setPhoto(fichier);
    setPreview(URL.createObjectURL(fichier));
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      // Validation cliente : si nouvel mdp renseigné, exiger ancien mdp
      if (form.motDePasse && !form.currentMotDePasse) {
        toast.error("L'ancien mot de passe est requis pour le changement.");
        setChargement(false);
        return;
      }

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) payload.append(key, value);
      });
      if (photo) payload.append('photoProfil', photo);
      const { data } = await api.put('/users/profil', payload);

      // Mise à jour locale immédiate
      updateUser(data.user || form);
      toast.success('Profil mis à jour !');
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour.';
      toast.error(message);
    } finally { setChargement(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--em-page)', fontFamily:"'DM Sans',sans-serif" }}>
      {user?.role === 'vendeur' && (
        <div style={styles.vendeurHeader}>
          <button onClick={() => window.history.back()} style={styles.backButton}>← Retour</button>
        </div>
      )}
      {user?.role !== 'vendeur' && <ClientNav />}

      <div style={styles.content}>
        <h1 style={styles.title}>Mon Profil</h1>
        <p style={{marginBottom:'28px', color:'#666'}}>Ravie de vous revoir, {user?.prenom}</p>

        <div style={styles.card}>
          <div style={{textAlign:'center', marginBottom:'28px'}}>
            <div style={styles.avatarWrapper}>
              <div style={styles.avatarLabel} onClick={() => preview && setShowPhotoPreview(true)} title="Voir la photo en grand">
                {preview ? (
                  <img src={preview} alt="Profil" style={styles.avatarImg} />
                ) : (
                  <span>{user?.prenom?.[0]?.toUpperCase()}{user?.nom?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div style={styles.avatarActions}>
                <label htmlFor="photoProfilInput" style={styles.uploadButton}>Modifier</label>
                <input id="photoProfilInput" type="file" accept="image/*" onChange={changerPhoto} style={{ display: 'none' }} />
              </div>
            </div>
            <p style={styles.photoHint}>Cliquez sur la photo pour la voir en grand</p>
            <p style={{color:'#888', fontSize:'0.85rem'}}>{user?.email}</p>
          </div>

          <form onSubmit={sauvegarder}>
            <div style={{marginBottom:'16px'}}>
              <label style={styles.label}>Prénom</label>
              <input type="text" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} style={styles.input} required />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={styles.label}>Nom</label>
              <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} style={styles.input} required />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="vous@exemple.com"
                style={styles.input}
                required
              />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={styles.label}>Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={e => setForm({...form, telephone: e.target.value})}
                placeholder="+237699123456"
                style={styles.input}
              />
            </div>
            <div style={{marginBottom:'12px'}}>
              <p style={{color:'#666', fontSize:'0.9rem', margin:'6px 0'}}>Changer le mot de passe (optionnel) :</p>
              <label style={styles.label}>Ancien mot de passe</label>
              <input
                type="password"
                value={form.currentMotDePasse}
                onChange={e => setForm({...form, currentMotDePasse: e.target.value})}
                style={styles.input}
                placeholder="Entrez l'ancien mot de passe"
              />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={e => setForm({...form, motDePasse: e.target.value})}
                style={styles.input}
                placeholder="Au moins 6 caracteres"
              />
            </div>
            <button type="submit" disabled={chargement} style={styles.btnAction}>
              {chargement ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </form>

          {showPhotoPreview && preview && (
            <div style={styles.modalOverlay} onClick={() => setShowPhotoPreview(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <img src={preview} alt="Aperçu complet" style={styles.modalImage} />
                <button type="button" onClick={() => setShowPhotoPreview(false)} style={styles.modalClose}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  vendeurHeader: { background:'#1A3A2A', padding:'16px 20px', display:'flex', alignItems:'center', minHeight:'60px' },
  backButton: { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem', fontWeight:'600', transition:'all 0.2s ease' },
  nav: { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' },
  logo: { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff', textDecoration:'none', fontWeight:'bold' },
  navLink: { color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem' },
  decoBtn: { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'8px 16px', borderRadius:'50px', cursor:'pointer' },
  content: { maxWidth:'500px', margin:'0 auto', padding:'clamp(24px, 6vw, 40px) 20px' },
  title: { fontSize:'clamp(1.35rem, 5vw, 1.8rem)', fontWeight:'700', marginBottom:'10px' },
  card: { background:'var(--em-surface)', borderRadius:'8px', padding:'clamp(22px, 6vw, 32px)', boxShadow:'var(--em-shadow-sm)', border:'1px solid var(--em-border)' },
  avatarWrapper: { display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', flexWrap:'wrap', margin:'0 auto 8px' },
  avatarLabel: { width:'86px', height:'86px', borderRadius:'50%', background:'#1A3A2A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', overflow:'hidden', cursor:'pointer', border:'3px solid #C8410A', position:'relative' },
  avatarImg: { width:'100%', height:'100%', objectFit:'cover' },
  avatarActions: { display:'flex', alignItems:'center', justifyContent:'center' },
  uploadButton: { fontSize:'0.85rem', background:'#F8F8F8', color:'#1F2937', border:'1px solid #D1D5DB', borderRadius:'999px', padding:'8px 14px', cursor:'pointer', transition:'all 0.2s ease' },
  photoHint: { color:'#888', fontSize:'0.78rem', margin:'0 0 8px' },
  modalOverlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:9999 },
  modalContent: { position:'relative', width:'100%', maxWidth:'560px', background:'#fff', borderRadius:'16px', padding:'18px', boxShadow:'0 22px 60px rgba(0,0,0,0.18)' },
  modalImage: { width:'100%', height:'auto', borderRadius:'12px', display:'block' },
  modalClose: { marginTop:'14px', width:'100%', border:'none', borderRadius:'10px', padding:'12px 0', background:'#C8410A', color:'#fff', fontWeight:'700', cursor:'pointer' },
  label: { display:'block', marginBottom:'6px', fontSize:'0.88rem', fontWeight:'600' },
  input: { width:'100%', padding:'11px', borderRadius:'8px', border:'1.5px solid #E2DAD0', boxSizing:'border-box' },
  btnAction: { width:'100%', padding:'14px', background:'linear-gradient(135deg, #C8410A, #E8622A)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', boxShadow:'0 12px 28px rgba(200,65,10,0.2)' }
};
