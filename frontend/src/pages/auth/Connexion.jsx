import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

export default function Connexion() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [chargement, setChargement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const user = await connexion(form.email, form.motDePasse);
      toast.success(`Bienvenue ${user.prenom} !`);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'vendeur') {
        navigate('/vendeur/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="card">
        {/* Logo centré avec nom en dessous */}
        <Link to="/" style={styles.logoLink}>
          <div style={styles.logoContainer}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
            <div style={styles.logoText}>TEY<span style={styles.logoAccent}>SHOP</span></div>
          </div>
        </Link>
        
        {/* Titre Connexion SUPPRIMÉ */}
        
        <p style={styles.sousTitre}>Connectez-vous à votre compte</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.champ}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Icon name="mail" size={18} style={styles.inputIcon} className="inputIcon" />
              <input
                type="email" name="email" required
                value={form.email} onChange={handleChange}
                style={styles.input} className="input" placeholder="vous@exemple.com"
              />
            </div>
          </div>
          
          <div style={styles.champ}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.inputWrapper}>
              <Icon name="lock" size={18} style={styles.inputIcon} className="inputIcon" />
              <input
                type={showPassword ? "text" : "password"} name="motDePasse" required
                value={form.motDePasse} onChange={handleChange}
                style={styles.input} placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} className="eye-btn">
                <Icon name={showPassword ? "eye-off" : "eye"} size={18} color="#999" />
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={chargement} style={styles.bouton}>
            {chargement ? (
              <div style={styles.spinner}></div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div style={styles.separateur}>
          <span style={styles.separateurTexte}>ou</span>
        </div>

        <p style={styles.lienTexte}>
          Pas encore de compte ?{' '}
          <Link to="/inscription" style={styles.lien}>Créer un compte</Link>
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
    background: 'var(--em-page)',
    padding: 'clamp(16px, 5vw, 20px)',
  },
  card: {
    background: 'var(--em-surface)',
    padding: 'clamp(30px, 5vw, 48px) clamp(20px, 5vw, 40px)',
    borderRadius: '8px',
    width: '100%',
    maxWidth: 'clamp(350px, 90%, 440px)',
    boxShadow: 'var(--em-shadow-lg)',
    border: '1px solid var(--em-border)',
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
  champ: {
    marginBottom: 'clamp(16px, 4vw, 20px)',
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
    padding: 'clamp(12px, 3vw, 14px) clamp(12px, 3vw, 14px) clamp(12px, 3vw, 14px) 45px',
    borderRadius: '8px',
    border: '1.5px solid #E2E8F0',
    fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
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
  bouton: {
    width: '100%',
    padding: 'clamp(12px, 3vw, 14px)',
    background: 'linear-gradient(135deg, #C8410A, #E8622A)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
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
  
  .lien:hover {
    color: #E8622A;
    text-decoration: underline;
  }
  
  .retour-btn:hover {
    color: #C8410A;
  }
  
  .eye-btn:hover {
    opacity: 0.7;
  }
  
  /* Responsive pour très petits écrans */
  @media (max-width: 480px) {
    .logoImage {
      height: 45px;
    }
    .logoText {
      font-size: 1.1rem;
    }
    .input {
      padding-left: 38px;
    }
    .inputIcon svg {
      width: 16px;
      height: 16px;
    }
  }
`;
document.head.appendChild(styleSheet);
