import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      await api.post('/auth/mot-de-passe-oublie', { email });
      toast.success('Si un compte existe, un email de réinitialisation a été envoyé.');
      setEmail('');
      // optional: navigate('/connexion');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la demande de réinitialisation.');
    } finally { setChargement(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--em-page)'}}>
      <div style={{width:420,background:'var(--em-surface)',padding:28,borderRadius:8,border:'1px solid var(--em-border)'}}>
        <h2>Mot de passe oublié</h2>
        <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',marginBottom:6}}>Email</label>
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          </div>
          <button type="submit" disabled={chargement} style={{width:'100%',padding:12,background:'#C8410A',color:'#fff',border:'none',borderRadius:8,fontWeight:700}}>
            {chargement ? 'Envoi...' : 'Recevoir le lien'}
          </button>
        </form>
      </div>
    </div>
  );
}
