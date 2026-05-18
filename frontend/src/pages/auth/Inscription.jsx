import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

export default function Inscription() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '', telephone: '', role: 'client' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));
    if (photo) data.append('photoProfil', photo);

    try {
      const user = await inscription(data);
      toast.success(`Bienvenue ${user.prenom} ! Votre compte a été créé avec succès.`);
      
      // Redirection selon le rôle
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vendeur') {
        navigate('/vendeur/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        {/* Logo centré avec nom en dessous - Titre "Inscription" supprimé */}
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoContainer}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
            <div style={styles.logoText}>TEY<span style={styles.logoAccent}>SHOP</span></div>
          </div>
        </Link>
        
        {/* Titre "Inscription" SUPPRIMÉ */}
        
        <p style={styles.sousTitre}>Créez votre compte gratuitement</p>

        <form onSubmit={handleSubmit}>
          {/* Photo de profil */}
          <div style={styles.photoSection}>
            <div style={styles.photoWrapper} className="photo-wrapper" onClick={() => document.getElementById('photoInput').click()}>
              {preview ? (
                <img src={preview} alt="Profil" style={styles.photoPreview} />
              ) : (
                <div style={styles.photoPlaceholder}>
                  <Icon name="camera" size={24} color="#C8410A" />
                </div>
              )}
            </div>
            <input
              id="photoInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p style={styles.photoHint}>Cliquez pour ajouter une photo</p>
          </div>

          <div style={styles.formRow} className="formRow">
            <div style={styles.champ}>
              <label style={styles.label}>Prénom</label>
              <div style={styles.inputWrapper}>
                <Icon name="user" size={16} style={styles.inputIcon} className="inputIcon" />
                <input name="prenom" placeholder="Jean" onChange={handleChange} required style={styles.input} className="input" />
              </div>
            </div>
            <div style={styles.champ}>
              <label style={styles.label}>Nom</label>
              <div style={styles.inputWrapper}>
                <Icon name="user" size={16} style={styles.inputIcon} className="inputIcon" />
                <input name="nom" placeholder="Dupont" onChange={handleChange} required style={styles.input} className="input" />
              </div>
            </div>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Icon name="mail" size={16} style={styles.inputIcon} className="inputIcon" />
              <input name="email" type="email" placeholder="jean@exemple.com" onChange={handleChange} required style={styles.input} className="input" />
            </div>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Téléphone</label>
            <div style={styles.inputWrapper}>
              <Icon name="phone" size={16} style={styles.inputIcon} className="inputIcon" />
              <input name="telephone" placeholder="+225 XX XX XX XX" onChange={handleChange} style={styles.input} className="input" />
            </div>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.inputWrapper}>
              <Icon name="lock" size={16} style={styles.inputIcon} className="inputIcon" />
              <input
                name="motDePasse"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={handleChange}
                required
                style={styles.input}
                className="input"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Icon name={showPassword ? "eye-off" : "eye"} size={16} color="#999" />
              </button>
            </div>
          </div>

          <div style={styles.champ}>
            <label style={styles.label}>Je suis un :</label>
            <div style={styles.roleContainer} className="roleContainer">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'client' })}
                style={{ ...styles.roleBtn, ...(form.role === 'client' ? styles.roleActif : {}) }}
                className="role-btn"
              >
                <Icon name="user" size={16} />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'vendeur' })}
                style={{ ...styles.roleBtn, ...(form.role === 'vendeur' ? styles.roleActif : {}) }}
                className="role-btn"
              >
                <Icon name="store" size={16} />
                <span>Vendeur</span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={chargement} style={styles.bouton}>
            {chargement ? <div style={styles.spinner}></div> : 'Créer mon compte'}
          </button>
        </form>

        <div style={styles.separateur}>
          <span style={styles.separateurTexte}>ou</span>
        </div>

        <p style={styles.lienTexte}>
          Déjà inscrit ?{' '}
          <Link to="/connexion" style={styles.lien}>Se connecter</Link>
        </p>
        
        <Link to="/" style={styles.retourBtn}>
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
    padding: 'clamp(16px, 5vw, 20px)',
  },
  card: {
    background: '#fff',
    padding: 'clamp(30px, 5vw, 40px)',
    borderRadius: 'clamp(24px, 4vw, 32px)',
    width: '100%',
    maxWidth: 'clamp(350px, 90%, 520px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    transition: 'transform 0.3s ease',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(10px, 2vw, 15px)',
    marginBottom: 'clamp(20px, 4vw, 30px)',
  },
  logoImage: {
    height: 'clamp(50px, 12vw, 70px)',
    width: 'auto',
    objectFit: 'contain',
  },
  logoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
    fontWeight: '800',
    color: '#112219',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  logoAccent: {
    color: '#C8410A',
  },
  sousTitre: {
    fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
    color: '#666',
    textAlign: 'center',
    marginBottom: 'clamp(28px, 5vw, 36px)',
  },
  photoSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  photoWrapper: {
    width: 'clamp(80px, 15vw, 100px)',
    height: 'clamp(80px, 15vw, 100px)',
    margin: '0 auto',
    borderRadius: '50%',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '3px solid #C8410A',
    transition: 'all 0.3s ease',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F5F5F5',
  },
  photoHint: {
    fontSize: '0.7rem',
    color: '#999',
    marginTop: '8px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  champ: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: 'clamp(0.8rem, 3vw, 0.85rem)',
    fontWeight: '600',
    color: '#444',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#999',
  },
  input: {
    width: '100%',
    padding: 'clamp(10px, 3vw, 12px) clamp(12px, 3vw, 14px) clamp(10px, 3vw, 12px) 42px',
    borderRadius: 'clamp(10px, 3vw, 12px)',
    border: '1.5px solid #E2E8F0',
    fontSize: 'clamp(0.85rem, 3vw, 0.9rem)',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContainer: {
    display: 'flex',
    gap: '12px',
  },
  roleBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: 'clamp(10px, 3vw, 12px)',
    borderRadius: 'clamp(10px, 3vw, 12px)',
    border: '1.5px solid #E2E8F0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 'clamp(0.85rem, 3vw, 0.9rem)',
    fontWeight: '600',
    color: '#666',
    transition: 'all 0.3s ease',
  },
  roleActif: {
    borderColor: '#C8410A',
    background: '#FFF5F0',
    color: '#C8410A',
  },
  bouton: {
    width: '100%',
    padding: 'clamp(12px, 3vw, 14px)',
    background: '#C8410A',
    color: '#fff',
    border: 'none',
    borderRadius: 'clamp(12px, 3vw, 14px)',
    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  separateur: {
    position: 'relative',
    textAlign: 'center',
    margin: 'clamp(20px, 4vw, 24px) 0',
  },
  separateurTexte: {
    background: '#fff',
    padding: '0 12px',
    color: '#999',
    fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
    position: 'relative',
    zIndex: 1,
  },
  lienTexte: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: 'clamp(0.85rem, 3vw, 0.9rem)',
    color: '#666',
  },
  lien: {
    color: '#C8410A',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  retourBtn: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    color: '#999',
    textDecoration: 'none',
    fontSize: 'clamp(0.8rem, 3vw, 0.85rem)',
    transition: 'color 0.3s ease',
  },
};

// Injection des animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .card:hover {
    transform: translateY(-5px);
  }
  
  input:focus {
    border-color: #C8410A !important;
    box-shadow: 0 0 0 3px rgba(200, 65, 10, 0.1);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(200, 65, 10, 0.25);
  }
  
  .role-btn:hover {
    border-color: #C8410A;
    background: #FFF5F0;
    transform: translateY(-2px);
  }
  
  .photo-wrapper:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .lien:hover {
    color: #E8622A;
    text-decoration: underline;
  }
  
  .retour-btn:hover {
    color: #C8410A;
  }
  
  /* Responsive pour très petits écrans */
  @media (max-width: 480px) {
    .logoImage {
      height: 45px;
    }
    .logoText {
      font-size: 1.1rem;
    }
    .formRow {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .roleContainer {
      flex-direction: column;
    }
    .input {
      padding-left: 38px;
    }
    .inputIcon svg {
      width: 14px;
      height: 14px;
    }
  }
`;
document.head.appendChild(styleSheet);
