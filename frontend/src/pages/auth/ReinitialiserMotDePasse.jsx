import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ReinitialiserMotDePasse() {
  const query = useQuery();
  const tokenFromQuery = query.get('token') || '';
  const [token, setToken] = useState(tokenFromQuery);
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (tokenFromQuery) setToken(tokenFromQuery); }, [tokenFromQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (motDePasse.length < 6) return toast.error('Le mot de passe doit contenir au moins 6 caractères.');
    if (motDePasse !== confirm) return toast.error('Les mots de passe ne correspondent pas.');
    setChargement(true);
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', { token, motDePasse });
      toast.success('Mot de passe réinitialisé. Connectez-vous.');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de réinitialiser le mot de passe.');
    } finally { setChargement(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--em-page)'}}>
      <div style={{width:420,background:'var(--em-surface)',padding:28,borderRadius:8,border:'1px solid var(--em-border)'}}>
        <h2>Réinitialiser le mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Nouveau mot de passe</label>
            <input required type="password" value={motDePasse} onChange={e=>setMotDePasse(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Confirmer</label>
            <input required type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          </div>
          <input type="hidden" value={token} />
          <button type="submit" disabled={chargement} style={{width:'100%',padding:12,background:'#C8410A',color:'#fff',border:'none',borderRadius:8,fontWeight:700}}>
            {chargement ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
