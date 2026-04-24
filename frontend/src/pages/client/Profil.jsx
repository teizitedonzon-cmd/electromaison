// src/pages/client/Profil.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Profil() {
  const { user, deconnexion } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom||'', prenom: user?.prenom||'', telephone: user?.telephone||'' });
  const [chargement, setChargement] = useState(false);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      await api.put('/users/profil', form);
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur.'); }
    finally { setChargement(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F5F0E8', fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Electro<span style={{color:'#F4A76A'}}>Maison</span></Link>
        <div style={{display:'flex', gap:'20px'}}>
          <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
          <Link to="/mes-commandes" style={styles.navLink}>Mes commandes</Link>
          <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
        </div>
      </nav>
      <div style={{maxWidth:'500px', margin:'0 auto', padding:'40px 20px'}}>
        <h1 style={{fontSize:'1.8rem', fontWeight:'700', marginBottom:'28px'}}>Mon Profil</h1>
        <div style={{background:'#fff', borderRadius:'20px', padding:'32px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{textAlign:'center', marginBottom:'28px'}}>
            <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#1A3A2A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 12px'}}>
              {user?.prenom?.[0]?.toUpperCase()}
            </div>
            <p style={{color:'#888', fontSize:'0.85rem'}}>{user?.email}</p>
            <span style={{background:'#D5F5E3', color:'#1E8449', padding:'3px 12px', borderRadius:'50px', fontSize:'0.75rem', fontWeight:'700'}}>
              {user?.role}
            </span>
          </div>
          <form onSubmit={sauvegarder}>
            {[['prenom','Prénom','text'],['nom','Nom','text'],['telephone','Téléphone','tel']].map(([name,label,type]) => (
              <div key={name} style={{marginBottom:'16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontSize:'0.88rem', fontWeight:'600', color:'#444'}}>{label}</label>
                <input type={type} value={form[name]} onChange={e => setForm({...form, [name]: e.target.value})}
                  style={{width:'100%', padding:'11px 14px', borderRadius:'10px', border:'1.5px solid #E2DAD0', fontSize:'0.93rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box'}} />
              </div>
            ))}
            <button type="submit" disabled={chargement}
              style={{width:'100%', padding:'14px', background:'#C8410A', color:'#fff', border:'none', borderRadius:'50px', fontWeight:'700', cursor:'pointer', fontSize:'0.95rem', marginTop:'8px'}}>
              {chargement ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const styles = {
  nav:    { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' },
  logo:   { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff', textDecoration:'none' },
  navLink:{ color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
  decoBtn:{ background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'50px', cursor:'pointer', fontSize:'0.82rem' },
};
