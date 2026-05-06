import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Profil() {
  const { user, deconnexion, updateUser } = useAuth();
  const [form, setForm] = useState({ 
    nom: user?.nom || '', 
    prenom: user?.prenom || '', 
    telephone: user?.telephone || '' 
  });
  const [chargement, setChargement] = useState(false);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      // Envoi au backend (nécessite une route PUT /users/profil)
      const { data } = await api.put('/users/profil', form);
      
      // Mise à jour locale immédiate[cite: 25]
      updateUser(data.user || form);
      toast.success('Profil mis à jour !');
    } catch (err) { 
      toast.error('Erreur lors de la mise à jour.'); 
    } finally { setChargement(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F5F0E8', fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Tey<span style={{color:'#F4A76A'}}>Shop</span></Link>
        <div style={{display:'flex', gap:'20px'}}>
          <Link to="/" style={styles.navLink}>Accueil</Link>
          <Link to="/mes-commandes" style={styles.navLink}>Commandes</Link>
          <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
        </div>
      </nav>

      <div style={{maxWidth:'500px', margin:'0 auto', padding:'40px 20px'}}>
        <h1 style={{fontSize:'1.8rem', fontWeight:'700', marginBottom:'10px'}}>Mon Profil</h1>
        <p style={{marginBottom:'28px', color:'#666'}}>Ravie de vous revoir, {user?.prenom}</p>

        <div style={{background:'#fff', borderRadius:'20px', padding:'32px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{textAlign:'center', marginBottom:'28px'}}>
            <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#1A3A2A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 12px'}}>
              {user?.prenom?.[0]?.toUpperCase()}{user?.nom?.[0]?.toUpperCase()}
            </div>
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
              <label style={styles.label}>Téléphone</label>
              <input type="tel" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} style={styles.input} />
            </div>
            <button type="submit" disabled={chargement} style={styles.btnAction}>
              {chargement ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  nav: { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' },
  logo: { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff', textDecoration:'none', fontWeight:'bold' },
  navLink: { color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem' },
  decoBtn: { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'8px 16px', borderRadius:'50px', cursor:'pointer' },
  label: { display:'block', marginBottom:'6px', fontSize:'0.88rem', fontWeight:'600' },
  input: { width:'100%', padding:'11px', borderRadius:'10px', border:'1.5px solid #E2DAD0', boxSizing:'border-box' },
  btnAction: { width:'100%', padding:'14px', background:'#C8410A', color:'#fff', border:'none', borderRadius:'50px', fontWeight:'700', cursor:'pointer' }
};
