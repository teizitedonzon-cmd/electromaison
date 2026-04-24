// src/pages/auth/Inscription.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function Inscription() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '' });
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      await inscription(form);
      toast.success('Compte créé avec succès !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setChargement(false);
    }
  };

  const champs = [
    { name: 'prenom',     label: 'Prénom',        type: 'text',     placeholder: 'Marie' },
    { name: 'nom',        label: 'Nom',            type: 'text',     placeholder: 'Dupont' },
    { name: 'email',      label: 'Email',          type: 'email',    placeholder: 'vous@exemple.com' },
    { name: 'telephone',  label: 'Téléphone',      type: 'tel',      placeholder: '+243 xxx xxx xxx' },
    { name: 'motDePasse', label: 'Mot de passe',   type: 'password', placeholder: 'Min. 6 caractères' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Electro<span style={styles.logoAccent}>Maison</span></h1>
        <h2 style={styles.titre}>Créer un compte</h2>

        <form onSubmit={handleSubmit}>
          {champs.map((c) => (
            <div key={c.name} style={styles.champ}>
              <label style={styles.label}>{c.label}</label>
              <input
                type={c.type} name={c.name} required={c.name !== 'telephone'}
                value={form[c.name]} onChange={handleChange}
                style={styles.input} placeholder={c.placeholder}
              />
            </div>
          ))}
          <button type="submit" disabled={chargement} style={styles.bouton}>
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.lienTexte}>
          Déjà un compte ?{' '}
          <Link to="/connexion" style={styles.lien}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', padding: '20px' },
  card:       { background: '#fff', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' },
  logo:       { fontFamily: 'Georgia, serif', fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px', color: '#1A3A2A' },
  logoAccent: { color: '#C8410A' },
  titre:      { fontSize: '1.2rem', fontWeight: '600', color: '#1C1C1C', marginBottom: '24px', textAlign: 'center' },
  champ:      { marginBottom: '16px' },
  label:      { display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: '600', color: '#444' },
  input:      { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2DAD0', fontSize: '0.93rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  bouton:     { width: '100%', padding: '14px', background: '#C8410A', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '6px' },
  lienTexte:  { textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: '#888' },
  lien:       { color: '#C8410A', fontWeight: '600', textDecoration: 'none' },
};
