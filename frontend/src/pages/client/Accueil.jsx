// src/pages/client/Accueil.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Accueil() {
  const { user, deconnexion } = useAuth();
  const { nombreArticles } = useCart();
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#F5F0E8' }}>
      <nav style={styles.nav}>
        <span style={styles.logo}>Electro<span style={{color:'#F4A76A'}}>Maison</span></span>
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
          <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
          <Link to="/mes-commandes" style={styles.navLink}>Mes commandes</Link>
          <Link to="/profil" style={styles.navLink}>Profil</Link>
          <Link to="/panier" style={styles.cartBtn}>
            🛒 {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
          </Link>
          <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div>
          <h1 style={styles.heroTitre}>Bienvenue, <span style={{color:'#F4A76A'}}>{user?.prenom}</span> 👋</h1>
          <p style={styles.heroSub}>Découvrez notre sélection d'appareils électroménagers au meilleur prix.</p>
          <Link to="/catalogue" style={styles.heroCta}>Voir le catalogue →</Link>
        </div>
      </section>

      {/* Catégories rapides */}
      <section style={{padding:'60px 40px'}}>
        <h2 style={styles.sectionTitre}>Parcourir par catégorie</h2>
        <div style={styles.catGrid}>
          {[['🍳','Cuisine','cuisine'],['🧊','Réfrigération','froid'],['🫧','Lavage','lavage'],['❄️','Climatisation','climatisation'],['⚡','Petit Élec.','petit_electromenager']].map(([ic,lb,id]) => (
            <Link key={id} to={`/catalogue?categorie=${id}`} style={styles.catCard}>
              <div style={{fontSize:'2.5rem', marginBottom:'10px'}}>{ic}</div>
              <div style={{fontWeight:'600', fontSize:'0.9rem'}}>{lb}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
const styles = {
  nav:         { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', position:'sticky', top:0, zIndex:100 },
  logo:        { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff' },
  navLink:     { color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
  cartBtn:     { background:'#C8410A', color:'#fff', padding:'10px 18px', borderRadius:'50px', textDecoration:'none', fontSize:'0.88rem', fontWeight:'700', display:'flex', alignItems:'center', gap:'6px' },
  cartBadge:   { background:'#fff', color:'#C8410A', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'700' },
  decoBtn:     { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'50px', cursor:'pointer', fontSize:'0.82rem' },
  hero:        { background:'#1A3A2A', color:'#fff', padding:'80px 40px' },
  heroTitre:   { fontFamily:'Georgia,serif', fontSize:'2.8rem', marginBottom:'16px', lineHeight:'1.2' },
  heroSub:     { fontSize:'1.05rem', color:'rgba(255,255,255,0.7)', marginBottom:'28px', maxWidth:'500px' },
  heroCta:     { background:'#C8410A', color:'#fff', padding:'14px 32px', borderRadius:'50px', textDecoration:'none', fontWeight:'700', fontSize:'1rem' },
  sectionTitre:{ fontSize:'1.6rem', fontWeight:'700', marginBottom:'24px', color:'#1C1C1C' },
  catGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'16px' },
  catCard:     { background:'#fff', borderRadius:'16px', padding:'28px 16px', textAlign:'center', textDecoration:'none', color:'#1C1C1C', border:'1.5px solid #E2DAD0', transition:'transform 0.2s' },
};
