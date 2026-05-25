import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Icon from './Icon';
import logot from '../assets/images/logot.jpg';

const navItemsClient = [
  { to: '/', label: 'Accueil', icon: 'home', match: ['/', '/accueil'] },
  { to: '/catalogue', label: 'Catalogue', icon: 'package', match: ['/catalogue'] },
  { to: '/mes-commandes', label: 'Mes commandes', icon: 'file-text', match: ['/mes-commandes'] },
  { to: '/profil', label: 'Mon profil', icon: 'user', match: ['/profil'] },
  { to: '/panier', label: 'Panier', icon: 'cart', match: ['/panier'] },
];

const navItemsVisiteur = [
  { to: '/', label: 'Accueil', icon: 'home', match: ['/', '/accueil'] },
  { to: '/catalogue', label: 'Catalogue', icon: 'package', match: ['/catalogue'] },
  { to: '/panier', label: 'Panier', icon: 'cart', match: ['/panier'] },
  { to: '/connexion', label: 'Connexion', icon: 'login', match: ['/connexion'] },
  { to: '/inscription', label: 'Inscription', icon: 'user', match: ['/inscription'] },
];

const isCurrentPage = (item, pathname) => item.match.some((path) => path === pathname);

export default function ClientNav({ searchSlot = null }) {
  const { user, deconnexion } = useAuth();
  const { nombreArticles } = useCart();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = (user ? navItemsClient : navItemsVisiteur).filter((item) => !isCurrentPage(item, pathname));

  const renderItem = (item, mobile = false) => {
    const isCart = item.to === '/panier';
    const style = mobile ? styles.mobileItem : (isCart ? styles.cartBtn : styles.navLink);

    return (
      <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={style} className={mobile ? 'em-mobile-nav-item' : 'em-nav-item'}>
        <Icon name={item.icon} size={mobile ? 18 : 16} />
        <span>{item.label}</span>
        {isCart && nombreArticles > 0 && <span style={mobile ? styles.mobileBadge : styles.cartBadge}>{nombreArticles}</span>}
      </Link>
    );
  };

  return (
    <>
      <nav style={{ ...styles.nav, ...(isMobile && searchSlot ? styles.navWithMobileSearch : {}) }} className="em-client-nav">
        <Link to="/" style={styles.logoLink}>
          <img src={logot} alt="TeyShop" style={styles.logoImage} />
          <span style={styles.logoText}>TEY<span style={styles.logoAccent}>SHOP</span></span>
        </Link>

        {searchSlot && <div style={{ ...styles.searchSlot, ...(isMobile ? styles.mobileSearchSlot : {}) }}>{searchSlot}</div>}

        <div style={{ ...styles.desktopMenu, display: isMobile ? 'none' : 'flex' }}>
          {items.map((item) => renderItem(item))}
          {user && (
            <button onClick={deconnexion} style={styles.decoBtn} className="em-nav-item">
              <Icon name="logout" size={16} />
              <span>Deconnexion</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          style={{ ...styles.mobileMenuBtn, display: isMobile ? 'flex' : 'none' }}
          className="em-menu-button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} color="#fff" />
        </button>
      </nav>

      {menuOpen && isMobile && (
        <div style={styles.mobileMenu} className="em-mobile-menu">
          {items.map((item) => renderItem(item, true))}
          {user && (
            <button onClick={() => { deconnexion(); setMenuOpen(false); }} style={styles.mobileDecoBtn} className="em-mobile-nav-item">
              <Icon name="logout" size={18} />
              <span>Deconnexion</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    width: '100%',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, rgba(13, 34, 24, 0.98), rgba(18, 50, 36, 0.98) 55%, rgba(31, 90, 67, 0.98))',
    padding: '0 clamp(14px, 5vw, 8%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '78px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 16px 42px rgba(11, 24, 17, 0.22)',
    gap: '16px',
  },
  navWithMobileSearch: {
    height: 'auto',
    minHeight: '76px',
    flexWrap: 'wrap',
    paddingTop: '10px',
    paddingBottom: '10px',
    rowGap: '10px',
    columnGap: '8px',
  },
  logoLink: {
    color: '#fff',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  logoImage: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
  },
  logoText: {
    fontSize: '1.28rem',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '0',
  },
  logoAccent: {
    color: '#F4A76A',
  },
  searchSlot: {
    flex: 1,
    maxWidth: '520px',
    minWidth: 0,
  },
  mobileSearchSlot: {
    order: 3,
    flex: '0 0 100%',
    maxWidth: '100%',
    minWidth: '100%',
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  navLink: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 600,
    padding: '10px 14px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  cartBtn: {
    background: 'linear-gradient(135deg, #C8410A, #E8622A)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
  },
  cartBadge: {
    background: '#fff',
    color: '#C8410A',
    borderRadius: '8px',
    width: '21px',
    height: '21px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 800,
  },
  decoBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'linear-gradient(135deg, rgba(200,65,10,0.95), rgba(244,167,106,0.92))',
    border: '1px solid rgba(244, 167, 106, 0.45)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    padding: '10px 12px',
    flexShrink: 0,
  },
  mobileMenu: {
    position: 'fixed',
    top: '78px',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, rgba(13,34,24,0.98), rgba(31,90,67,0.98))',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 999,
    borderBottom: '2px solid rgba(244, 167, 106, 0.3)',
    boxShadow: '0 26px 60px rgba(0,0,0,0.32)',
  },
  mobileItem: {
    color: '#fff',
    textDecoration: 'none',
    padding: '13px 16px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.09)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  mobileBadge: {
    marginLeft: 'auto',
    background: 'linear-gradient(135deg, #C8410A, #F4A76A)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 800,
  },
  mobileDecoBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'rgba(231, 76, 60, 0.15)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    color: '#ffb5ae',
    padding: '13px 16px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
};
