// src/pages/client/Catalogue.jsx — Page catalogue client
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id:'', label:'Tous' },
  { id:'cuisine', label:'Cuisine' },
  { id:'froid', label:'Réfrigération' },
  { id:'lavage', label:'Lavage' },
  { id:'climatisation', label:'Climatisation' },
  { id:'petit_electromenager', label:'Petit Élec.' },
];

export default function Catalogue() {
  const { ajouterAuPanier, nombreArticles } = useCart();
  const { user, deconnexion } = useAuth();
  const [produits, setProduits]     = useState([]);
  const [categorie, setCategorie]   = useState('');
  const [recherche, setRecherche]   = useState('');

  const charger = async () => {
    try {
      const params = new URLSearchParams();
      if (categorie) params.append('categorie', categorie);
      if (recherche) params.append('recherche', recherche);
      const { data } = await api.get(`/produits?${params}`);
      setProduits(data.produits);
    } catch { toast.error('Erreur chargement.'); }
  };

  useEffect(() => { charger(); }, [categorie, recherche]);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#F5F0E8' }}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Electro<span style={{color:'#F4A76A'}}>Maison</span></Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Accueil</Link>
          <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
          <Link to="/mes-commandes" style={styles.navLink}>Mes commandes</Link>
          <Link to="/profil" style={styles.navLink}>Profil</Link>
        </div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <Link to="/panier" style={styles.cartBtn}>
            🛒 Panier {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
          </Link>
          <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
        </div>
      </nav>

      <div style={{padding:'40px'}}>
        <h1 style={styles.titre}>Catalogue</h1>

        {/* Recherche */}
        <input type="text" placeholder="🔍 Rechercher un produit..." value={recherche}
          onChange={e => setRecherche(e.target.value)}
          style={styles.searchInput} />

        {/* Filtres catégorie */}
        <div style={styles.filtres}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategorie(c.id)}
              style={{ ...styles.filtrBtn, ...(categorie === c.id ? styles.filtrActif : {}) }}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Grille produits */}
        <div style={styles.grid}>
          {produits.map((p) => (
            <div key={p._id} style={styles.card}>
              <div style={styles.imgZone}>
                {p.badge && <span style={styles.badge}>{p.badge}</span>}
                <span style={{fontSize:'4rem'}}>{p.categorie === 'froid' ? '🧊' : p.categorie === 'cuisine' ? '🍳' : p.categorie === 'lavage' ? '🫧' : p.categorie === 'climatisation' ? '❄️' : '⚡'}</span>
              </div>
              <div style={styles.info}>
                <div style={styles.catLabel}>{p.categorie}</div>
                <div style={styles.nomProduit}>{p.nom}</div>
                <div style={styles.desc}>{p.description?.substring(0, 80)}...</div>
                <div style={styles.footer}>
                  <div>
                    <span style={styles.prix}>{p.prix.toLocaleString('fr-FR')} FCFA</span>
                    {p.prixAncien && <span style={styles.prixBarre}>{p.prixAncien.toLocaleString('fr-FR')}</span>}
                  </div>
                  <button onClick={() => { ajouterAuPanier(p); toast.success('Ajouté au panier !'); }}
                    style={{ ...styles.addBtn, ...(p.stock === 0 ? styles.addBtnDis : {}) }}
                    disabled={p.stock === 0}>
                    {p.stock === 0 ? 'Rupture' : '+ Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {produits.length === 0 && <p style={{textAlign:'center', color:'#888', marginTop:'60px', fontSize:'1rem'}}>Aucun produit trouvé.</p>}
      </div>
    </div>
  );
}

const styles = {
  nav:         { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', position:'sticky', top:0, zIndex:100 },
  logo:        { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff', textDecoration:'none' },
  navLinks:    { display:'flex', gap:'24px' },
  navLink:     { color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
  cartBtn:     { background:'#C8410A', color:'#fff', padding:'10px 20px', borderRadius:'50px', textDecoration:'none', fontSize:'0.88rem', fontWeight:'700', display:'flex', alignItems:'center', gap:'6px' },
  cartBadge:   { background:'#fff', color:'#C8410A', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'700' },
  decoBtn:     { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'50px', cursor:'pointer', fontSize:'0.82rem' },
  titre:       { fontSize:'2rem', fontWeight:'700', marginBottom:'20px', color:'#1C1C1C' },
  searchInput: { padding:'12px 20px', borderRadius:'50px', border:'1.5px solid #E2DAD0', background:'#fff', fontSize:'0.95rem', fontFamily:'inherit', outline:'none', width:'100%', maxWidth:'400px', marginBottom:'20px', boxSizing:'border-box' },
  filtres:     { display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'28px' },
  filtrBtn:    { padding:'9px 20px', borderRadius:'50px', border:'1.5px solid #E2DAD0', background:'#fff', cursor:'pointer', fontSize:'0.85rem', fontWeight:'600', color:'#444' },
  filtrActif:  { background:'#1A3A2A', color:'#fff', borderColor:'#1A3A2A' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'24px' },
  card:        { background:'#fff', borderRadius:'20px', overflow:'hidden', border:'1.5px solid #E2DAD0', transition:'transform 0.2s' },
  imgZone:     { background:'linear-gradient(135deg,#f0ebe1,#e8e0d4)', height:'180px', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' },
  badge:       { position:'absolute', top:'12px', left:'12px', background:'#C8410A', color:'#fff', fontSize:'0.72rem', fontWeight:'700', padding:'4px 10px', borderRadius:'50px', textTransform:'uppercase' },
  info:        { padding:'18px' },
  catLabel:    { fontSize:'0.75rem', fontWeight:'700', color:'#C8410A', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' },
  nomProduit:  { fontFamily:'Georgia,serif', fontSize:'1.1rem', marginBottom:'6px', lineHeight:'1.3' },
  desc:        { fontSize:'0.82rem', color:'#888', marginBottom:'14px', lineHeight:'1.5' },
  footer:      { display:'flex', alignItems:'center', justifyContent:'space-between' },
  prix:        { fontSize:'1.15rem', fontWeight:'800', color:'#1A3A2A' },
  prixBarre:   { fontSize:'0.8rem', color:'#aaa', textDecoration:'line-through', marginLeft:'6px' },
  addBtn:      { background:'#1A3A2A', color:'#fff', border:'none', padding:'9px 18px', borderRadius:'50px', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer' },
  addBtnDis:   { background:'#ccc', cursor:'not-allowed' },
};
