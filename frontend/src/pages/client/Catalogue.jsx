// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import api from '../../utils/api';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
// import Icon from '../../components/Icon';

// // 1. Mise à jour de la liste des catégories
// const CATEGORIES = [
//   { id: '', label: 'Tous les produits' },
//   { id: 'Électronique',  label: '📱 Électronique' },
//   { id: 'Vêtements',     label: '👕 Vêtements' },
//   { id: 'Alimentation',  label: '🍎 Alimentation' },
//   { id: 'electromenager', label: 'Electromenager' },
//   { id: 'Beauté',        label: '💄 Beauté' },
//   { id: 'immobilier',    label: '🏠 Immobilier' },
//   { id: 'Sport',         label: '⚽ Sport' },
//   { id: 'Autre',         label: 'Autre' },
// ];

// export default function Catalogue() {
//   const { ajouterAuPanier, nombreArticles } = useCart();
//   const { deconnexion } = useAuth();
//   const location = useLocation();
  
//   const [produits, setProduits] = useState([]);
//   const [categorie, setCategorie] = useState('');
//   const [recherche, setRecherche] = useState('');
//   const [minPrix, setMinPrix] = useState('');
//   const [maxPrix, setMaxPrix] = useState('');
//   const [hoveredLink, setHoveredLink] = useState(null);

//   // 2. Écoute de l'URL pour filtrer automatiquement (ex: /catalogue?categorie=immobilier)
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const catDepuisUrl = params.get('categorie');
//     if (catDepuisUrl) {
//       setCategorie(catDepuisUrl);
//     } else {
//       setCategorie('');
//     }
//   }, [location.search]);

//   // 3. Appel API avec filtres
//   const charger = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (categorie) params.append('categorie', categorie);
//       if (recherche) params.append('recherche', recherche);
//       if (minPrix) params.append('minPrix', minPrix);
//       if (maxPrix) params.append('maxPrix', maxPrix);
//       const { data } = await api.get(`/produits?${params}`);
//       setProduits(data.produits);
//     } catch (err) { 
//       toast.error('Erreur lors du chargement des produits.'); 
//     }
//   };

//   useEffect(() => {
//     charger();
//   }, [categorie, recherche, minPrix, maxPrix]);

//   const getNavLinkStyle = (id) => ({
//     ...styles.navLink,
//     color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.8)',
//     transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
//   });

//   return (
//     <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#F8F9FA' }}>
//       <nav style={styles.nav}>
//         <Link to="/" style={styles.logo}>TEY<span style={{ color: '#F4A76A' }}>SHOP</span></Link>
//         <div style={styles.navLinks}>
//           <Link to="/" style={getNavLinkStyle('home')} onMouseEnter={() => setHoveredLink('home')} onMouseLeave={() => setHoveredLink(null)}>Accueil</Link>
//           <Link to="/catalogue" style={getNavLinkStyle('cat')} onMouseEnter={() => setHoveredLink('cat')} onMouseLeave={() => setHoveredLink(null)}>Catalogue</Link>
//           <Link to="/mes-commandes" style={getNavLinkStyle('cmd')} onMouseEnter={() => setHoveredLink('cmd')} onMouseLeave={() => setHoveredLink(null)}>Commandes</Link>
//         </div>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <Link to="/panier" style={styles.cartBtn}>
//             <Icon name="cart" size={17} /> Panier {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
//           </Link>
//           <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
//         </div>
//       </nav>

//       <div style={{ padding: '60px 8%' }}>
//         <header style={{ marginBottom: '50px' }}>
//           <h1 style={styles.sectionTitre}>Notre Catalogue</h1>
//           <div style={styles.dividerLeft}></div>
//           <div style={{ marginTop: '30px', position: 'relative', maxWidth: '600px' }}>
//             <input 
//               type="text" 
//               placeholder="Rechercher un produit..." 
//               value={recherche}
//               onChange={e => setRecherche(e.target.value)}
//               style={styles.searchInput} 
//             />
//             <Icon name="eye" size={17} style={{ position: 'absolute', right: '20px', top: '15px', color: '#777' }} />
//           </div>
//         </header>

//         {/* Boutons de filtres mis à jour */}
//         <div style={styles.filtres}>
//           {CATEGORIES.map(c => (
//             <button 
//               key={c.id} 
//               onClick={() => setCategorie(c.id)}
//               style={{ ...styles.filtrBtn, ...(categorie === c.id ? styles.filtrActif : {}) }}
//             >
//               {c.label}
//             </button>
//           ))}
//         </div>

//         <div style={styles.priceFilters}>
//           <input
//             type="number"
//             min="0"
//             placeholder="Prix min"
//             value={minPrix}
//             onChange={e => setMinPrix(e.target.value)}
//             style={styles.priceInput}
//           />
//           <input
//             type="number"
//             min="0"
//             placeholder="Prix max"
//             value={maxPrix}
//             onChange={e => setMaxPrix(e.target.value)}
//             style={styles.priceInput}
//           />
//           <button onClick={() => { setMinPrix(''); setMaxPrix(''); }} style={styles.resetBtn}>
//             Reinitialiser
//           </button>
//         </div>

//         {produits.length === 0 && (
//           <div style={styles.emptyState}>
//             Aucun produit ne correspond a votre recherche.
//           </div>
//         )}

//         <div style={styles.grid}>
//           {produits.map((p) => (
//             <div key={p._id} style={styles.card}>
//               <div style={styles.imgZone}>
//                 {p.badge && <span style={styles.badge}>{p.badge}</span>}
//                 {p.images && p.images.length > 0 ? (
//                   <img src={p.images?.[0]?.startsWith('http')  ? p.images[0] : `http://localhost:5000${p.images[0]}`} alt={p.nom} style={styles.productImg} onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Image+Indisponible"; }} />
//                 ) : (
//                   <Icon name="package" size={58} color="#d8d0c6" />
//                 )}
//               </div>
//               <div style={styles.info}>
//                 <div style={styles.catLabel}>{p.marque || p.categorie}</div>
//                 <h3 style={styles.nomProduit}>{p.nom}</h3>
//                 <p style={styles.desc}>{p.description?.substring(0, 80)}...</p>
//                 <div style={styles.footer}>
//                   <div style={styles.prix}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</div>
//                   <button onClick={() => { ajouterAuPanier(p); toast.success('Ajouté !'); }} style={styles.addBtn} disabled={p.stock === 0}>
//                     {p.stock === 0 ? 'Rupture' : '+ Ajouter'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   nav: { background: '#112219', padding: '0 8%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', position: 'sticky', top: 0, zIndex: 100 },
//   logo: { fontSize: '1.6rem', fontWeight: '900', color: '#fff', textDecoration: 'none' },
//   navLinks: { display: 'flex', gap: '25px' },
//   navLink: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: '600', transition: '0.3s' },
//   cartBtn: { background: '#C8410A', color: '#fff', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
//   cartBadge: { background: '#fff', color: '#C8410A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
//   decoBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' },
//   sectionTitre: { fontSize: '2.5rem', fontWeight: '900', color: '#112219' },
//   dividerLeft: { width: '60px', height: '5px', background: '#F4A76A', borderRadius: '10px' },
//   searchInput: { width: '100%', padding: '16px 25px', borderRadius: '15px', border: 'none', background: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', outline: 'none' },
//   filtres: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' },
//   filtrBtn: { padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#555', transition: '0.3s' },
//   filtrActif: { background: '#112219', color: '#fff' },
//   priceFilters: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '30px', alignItems: 'center' },
//   priceInput: { width: '150px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2DAD0', outline: 'none' },
//   resetBtn: { padding: '12px 18px', borderRadius: '10px', border: 'none', background: '#EDE8E0', color: '#112219', fontWeight: '700', cursor: 'pointer' },
//   emptyState: { background: '#fff', borderRadius: '14px', padding: '30px', color: '#666', marginBottom: '24px', textAlign: 'center' },
//   grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '35px' },
//   card: { background: '#fff', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
//   imgZone: { height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#fff' },
//   productImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
//   badge: { position: 'absolute', top: '20px', left: '20px', background: '#C8410A', color: '#fff', fontSize: '0.7rem', fontWeight: '900', padding: '6px 14px', borderRadius: '8px' },
//   info: { padding: '25px' },
//   catLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#C8410A', textTransform: 'uppercase' },
//   nomProduit: { fontSize: '1.3rem', fontWeight: '800', color: '#112219' },
//   desc: { fontSize: '0.9rem', color: '#666', marginBottom: '20px' },
//   footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
//   prix: { fontSize: '1.4rem', fontWeight: '900', color: '#112219' },
//   addBtn: { background: '#112219', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '12px', cursor: 'pointer' }
// };


// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import api from '../../utils/api';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
// import Icon from '../../components/Icon';

// const CATEGORIES = [
//   { id: '', label: 'Tous les produits' },
//   { id: 'Électronique',  label: '📱 Électronique' },
//   { id: 'Vêtements',     label: '👕 Vêtements' },
//   { id: 'Alimentation',  label: '🍎 Alimentation' },
//   { id: 'electromenager', label: '🔌 Électroménager' },
//   { id: 'Beauté',        label: '💄 Beauté' },
//   { id: 'immobilier',    label: '🏠 Immobilier' },
//   { id: 'Sport',         label: '⚽ Sport' },
//   { id: 'Autre',         label: '📦 Autre' },
// ];

// export default function Catalogue() {
//   const { user, deconnexion } = useAuth();
//   const { ajouterAuPanier, nombreArticles } = useCart();
//   const location = useLocation();
  
//   const [produits, setProduits] = useState([]);
//   const [categorie, setCategorie] = useState('');
//   const [recherche, setRecherche] = useState('');
//   const [minPrix, setMinPrix] = useState('');
//   const [maxPrix, setMaxPrix] = useState('');
//   const [hoveredLink, setHoveredLink] = useState(null);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const catDepuisUrl = params.get('categorie');
//     if (catDepuisUrl) setCategorie(catDepuisUrl);
//     else setCategorie('');
//   }, [location.search]);

//   const charger = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (categorie) params.append('categorie', categorie);
//       if (recherche) params.append('recherche', recherche);
//       if (minPrix) params.append('minPrix', minPrix);
//       if (maxPrix) params.append('maxPrix', maxPrix);
//       const { data } = await api.get(`/produits?${params}`);
//       setProduits(data.produits);
//     } catch (err) { 
//       toast.error('Erreur lors du chargement des produits.'); 
//     }
//   };

//   useEffect(() => {
//     charger();
//   }, [categorie, recherche, minPrix, maxPrix]);

//   const getNavLinkStyle = (id) => ({
//     ...styles.navLink,
//     color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
//     transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
//   });

//   return (
//     <div style={styles.container}>
//       {/* Navigation */}
//       <nav style={styles.nav}>
//         <Link to="/" style={styles.logo}>TEY<span style={{ color: '#F4A76A' }}>SHOP</span></Link>
//         <div style={styles.navLinks}>
//           <Link to="/" style={getNavLinkStyle('home')} onMouseEnter={() => setHoveredLink('home')} onMouseLeave={() => setHoveredLink(null)}>Accueil</Link>
//           <Link to="/catalogue" style={getNavLinkStyle('cat')} onMouseEnter={() => setHoveredLink('cat')} onMouseLeave={() => setHoveredLink(null)}>Catalogue</Link>
          
//           {user ? (
//             <>
//               <Link to="/mes-commandes" style={getNavLinkStyle('cmd')} onMouseEnter={() => setHoveredLink('cmd')} onMouseLeave={() => setHoveredLink(null)}>Mes commandes</Link>
//               <Link to="/panier" style={styles.cartBtn}>
//                 <Icon name="cart" size={17} />
//                 <span>Panier</span>
//                 {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
//               </Link>
//               <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
//             </>
//           ) : (
//             <>
//               <Link to="/panier" style={styles.cartBtn}>
//                 <Icon name="cart" size={17} />
//                 <span>Panier</span>
//                 {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
//               </Link>
//               <Link to="/connexion" style={styles.navLink}>Connexion</Link>
//               <Link to="/inscription" style={styles.navLink}>Inscription</Link>
//             </>
//           )}
//         </div>
//       </nav>

//       {/* Contenu principal */}
//       <div style={styles.main}>
//         <div style={styles.headerSection}>
//           <h1 style={styles.title}>Notre Catalogue</h1>
//           <div style={styles.divider}></div>
          
//           {/* Barre de recherche */}
//           <div style={styles.searchWrapper}>
//             <Icon name="search" size={18} style={styles.searchIcon} />
//             <input 
//               type="text" 
//               placeholder="Rechercher un produit..." 
//               value={recherche}
//               onChange={e => setRecherche(e.target.value)}
//               style={styles.searchInput} 
//             />
//           </div>
//         </div>

//         {/* Filtres catégories */}
//         <div style={styles.filtres}>
//           {CATEGORIES.map(c => (
//             <button 
//               key={c.id} 
//               onClick={() => setCategorie(c.id)}
//               style={{ ...styles.filtrBtn, ...(categorie === c.id ? styles.filtrActif : {}) }}
//             >
//               {c.label}
//             </button>
//           ))}
//         </div>

//         {/* Filtres prix */}
//         <div style={styles.priceFilters}>
//           <input
//             type="number"
//             min="0"
//             placeholder="Prix min"
//             value={minPrix}
//             onChange={e => setMinPrix(e.target.value)}
//             style={styles.priceInput}
//           />
//           <span style={styles.priceSeparator}>—</span>
//           <input
//             type="number"
//             min="0"
//             placeholder="Prix max"
//             value={maxPrix}
//             onChange={e => setMaxPrix(e.target.value)}
//             style={styles.priceInput}
//           />
//           <button onClick={() => { setMinPrix(''); setMaxPrix(''); setRecherche(''); setCategorie(''); }} style={styles.resetBtn}>
//             Réinitialiser
//           </button>
//         </div>

//         {/* Résultats */}
//         {produits.length === 0 && (
//           <div style={styles.emptyState}>
//             <Icon name="package" size={48} color="#ccc" />
//             <p>Aucun produit ne correspond à votre recherche.</p>
//           </div>
//         )}

//         {/* Grille produits */}
//         <div style={styles.grid}>
//           {produits.map((p, idx) => (
//             <div key={p._id} style={{ ...styles.card, animationDelay: `${idx * 0.05}s` }} className="product-card">
//               <div style={styles.imgZone}>
//                 {p.badge && <span style={styles.badge}>{p.badge}</span>}
//                 {p.images && p.images.length > 0 ? (
//                   <img 
//                     src={p.images?.[0]?.startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`} 
//                     alt={p.nom} 
//                     style={styles.productImg} 
//                     onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Image+Indisponible"; }} 
//                   />
//                 ) : (
//                   <div style={styles.noImage}><Icon name="package" size={48} color="#ccc" /></div>
//                 )}
//               </div>
//               <div style={styles.info}>
//                 <div style={styles.catLabel}>{p.marque || p.categorie}</div>
//                 <h3 style={styles.nomProduit}>{p.nom}</h3>
//                 <p style={styles.desc}>{p.description?.substring(0, 80)}...</p>
//                 <div style={styles.footer}>
//                   <div style={styles.prix}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</div>
//                   <button 
//                     onClick={() => { ajouterAuPanier(p); toast.success(`${p.nom} ajouté au panier !`); }} 
//                     style={styles.addBtn} 
//                     disabled={p.stock === 0}
//                   >
//                     {p.stock === 0 ? 'Rupture' : '+ Ajouter'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: {
//     fontFamily: "'Inter', -apple-system, sans-serif",
//     minHeight: '100vh',
//     background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
//   },
  
//   // Navigation
//   nav: {
//     background: '#112219',
//     padding: '0 8%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: '80px',
//     position: 'sticky',
//     top: 0,
//     zIndex: 100,
//     boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//   },
//   logo: {
//     fontSize: '1.8rem',
//     fontWeight: '900',
//     color: '#fff',
//     textDecoration: 'none',
//     letterSpacing: '-0.5px',
//   },
//   navLinks: {
//     display: 'flex',
//     gap: '8px',
//     alignItems: 'center',
//   },
//   navLink: {
//     color: 'rgba(255,255,255,0.85)',
//     textDecoration: 'none',
//     fontSize: '0.9rem',
//     fontWeight: '600',
//     transition: 'all 0.3s ease',
//     padding: '10px 18px',
//     borderRadius: '12px',
//   },
//   cartBtn: {
//     background: '#C8410A',
//     color: '#fff',
//     padding: '10px 20px',
//     borderRadius: '40px',
//     textDecoration: 'none',
//     fontSize: '0.9rem',
//     fontWeight: '600',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     transition: 'all 0.3s ease',
//   },
//   cartBadge: {
//     background: '#fff',
//     color: '#C8410A',
//     borderRadius: '50%',
//     width: '22px',
//     height: '22px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '0.7rem',
//     fontWeight: '800',
//   },
//   decoBtn: {
//     background: 'rgba(255,255,255,0.08)',
//     border: '1px solid rgba(255,255,255,0.2)',
//     color: '#fff',
//     padding: '10px 18px',
//     borderRadius: '40px',
//     cursor: 'pointer',
//     fontSize: '0.9rem',
//     fontWeight: '600',
//     transition: 'all 0.3s ease',
//   },
  
//   // Main content
//   main: {
//     padding: '60px 8%',
//   },
//   headerSection: {
//     marginBottom: '50px',
//   },
//   title: {
//     fontSize: '2.5rem',
//     fontWeight: '900',
//     color: '#112219',
//     marginBottom: '16px',
//   },
//   divider: {
//     width: '60px',
//     height: '4px',
//     background: 'linear-gradient(90deg, #C8410A, #F4A76A)',
//     borderRadius: '10px',
//     marginBottom: '30px',
//   },
  
//   // Search
//   searchWrapper: {
//     position: 'relative',
//     maxWidth: '500px',
//   },
//   searchIcon: {
//     position: 'absolute',
//     left: '16px',
//     top: '50%',
//     transform: 'translateY(-50%)',
//     color: '#999',
//   },
//   searchInput: {
//     width: '100%',
//     padding: '14px 20px 14px 45px',
//     borderRadius: '50px',
//     border: 'none',
//     background: '#fff',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
//     outline: 'none',
//     fontSize: '0.9rem',
//     transition: 'all 0.3s ease',
//   },
  
//   // Filters
//   filtres: {
//     display: 'flex',
//     gap: '10px',
//     flexWrap: 'wrap',
//     marginBottom: '30px',
//   },
//   filtrBtn: {
//     padding: '10px 22px',
//     borderRadius: '40px',
//     border: 'none',
//     background: '#fff',
//     cursor: 'pointer',
//     fontWeight: '600',
//     color: '#555',
//     fontSize: '0.85rem',
//     transition: 'all 0.3s ease',
//     boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
//   },
//   filtrActif: {
//     background: '#112219',
//     color: '#fff',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//   },
  
//   // Price filters
//   priceFilters: {
//     display: 'flex',
//     gap: '12px',
//     flexWrap: 'wrap',
//     alignItems: 'center',
//     marginBottom: '40px',
//     padding: '16px',
//     background: '#fff',
//     borderRadius: '60px',
//     boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
//   },
//   priceInput: {
//     width: '130px',
//     padding: '12px 16px',
//     borderRadius: '40px',
//     border: '1px solid #E0E0E0',
//     outline: 'none',
//     fontSize: '0.85rem',
//     textAlign: 'center',
//   },
//   priceSeparator: {
//     color: '#999',
//     fontWeight: '600',
//   },
//   resetBtn: {
//     padding: '12px 24px',
//     borderRadius: '40px',
//     border: 'none',
//     background: '#F0F0F0',
//     color: '#555',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease',
//   },
  
//   // Empty state
//   emptyState: {
//     textAlign: 'center',
//     padding: '80px 20px',
//     background: '#fff',
//     borderRadius: '24px',
//     color: '#999',
//   },
  
//   // Product grid
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//     gap: '30px',
//   },
//   card: {
//     background: '#fff',
//     borderRadius: '20px',
//     overflow: 'hidden',
//     boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
//     transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
//     animation: 'fadeInUp 0.5s ease-out backwards',
//   },
//   imgZone: {
//     height: '250px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     background: '#FAFAFA',
//   },
//   productImg: {
//     maxWidth: '90%',
//     maxHeight: '90%',
//     objectFit: 'contain',
//   },
//   noImage: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     height: '100%',
//   },
//   badge: {
//     position: 'absolute',
//     top: '16px',
//     left: '16px',
//     background: '#C8410A',
//     color: '#fff',
//     fontSize: '0.7rem',
//     fontWeight: '800',
//     padding: '4px 12px',
//     borderRadius: '20px',
//   },
//   info: {
//     padding: '20px',
//   },
//   catLabel: {
//     fontSize: '0.7rem',
//     fontWeight: '700',
//     color: '#C8410A',
//     textTransform: 'uppercase',
//     letterSpacing: '1px',
//     marginBottom: '8px',
//   },
//   nomProduit: {
//     fontSize: '1.1rem',
//     fontWeight: '700',
//     color: '#112219',
//     marginBottom: '8px',
//   },
//   desc: {
//     fontSize: '0.85rem',
//     color: '#666',
//     marginBottom: '16px',
//     lineHeight: 1.4,
//   },
//   footer: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   prix: {
//     fontSize: '1.3rem',
//     fontWeight: '800',
//     color: '#C8410A',
//   },
//   addBtn: {
//     background: '#112219',
//     color: '#fff',
//     border: 'none',
//     padding: '10px 20px',
//     borderRadius: '40px',
//     cursor: 'pointer',
//     fontWeight: '600',
//     fontSize: '0.8rem',
//     transition: 'all 0.3s ease',
//   },
// };

// // Injection des animations globales
// const styleSheet = document.createElement("style");
// styleSheet.textContent = `
//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(30px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
  
//   .product-card {
//     animation: fadeInUp 0.5s ease-out backwards;
//   }
  
//   .product-card:hover {
//     transform: translateY(-8px);
//     box-shadow: 0 20px 40px rgba(0,0,0,0.12);
//   }
  
//   .product-card:hover .add-btn {
//     background: #C8410A;
//     transform: scale(1.02);
//   }
  
//   .cart-btn:hover, .hero-btn:hover, .add-btn:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 20px rgba(200, 65, 10, 0.3);
//   }
  
//   .filtr-btn:hover {
//     background: #112219;
//     color: #fff;
//     transform: translateY(-2px);
//   }
  
//   .reset-btn:hover {
//     background: #E0E0E0;
//     transform: translateY(-2px);
//   }
  
//   .deco-btn:hover {
//     background: rgba(255,255,255,0.15);
//     transform: translateY(-2px);
//   }
  
//   .nav-link:hover {
//     background: rgba(255,255,255,0.08);
//     transform: translateY(-2px);
//   }
  
//   .search-input:focus {
//     box-shadow: 0 4px 15px rgba(200, 65, 10, 0.15);
//     border: 1px solid #C8410A;
//   }
  
//   .category-card:hover .card-arrow {
//     transform: translateX(8px);
//   }
  
//   /* Scrollbar */
//   ::-webkit-scrollbar {
//     width: 8px;
//   }
//   ::-webkit-scrollbar-track {
//     background: #F1F1F1;
//   }
//   ::-webkit-scrollbar-thumb {
//     background: #C8410A;
//     border-radius: 10px;
//   }
//   ::-webkit-scrollbar-thumb:hover {
//     background: #E8622A;
//   }
// `;
// document.head.appendChild(styleSheet);

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

const CATEGORIES = [
  { id: '', label: 'Tous les produits' },
  { id: 'Électronique',  label: 'Électronique' },
  { id: 'Vêtements',     label: 'Vêtements' },
  { id: 'Alimentation',  label: 'Alimentation' },
  { id: 'electromenager', label: 'Électroménager' },
  { id: 'Beauté',        label: 'Beauté' },
  { id: 'immobilier',    label: 'Immobilier' },
  { id: 'Sport',         label: 'Sport' },
  { id: 'Autre',         label: 'Autre' },
];

export default function Catalogue() {
  const { user, deconnexion } = useAuth();
  const { ajouterAuPanier, nombreArticles } = useCart();
  const location = useLocation();
  
  const [produits, setProduits] = useState([]);
  const [categorie, setCategorie] = useState('');
  const [recherche, setRecherche] = useState('');
  const [minPrix, setMinPrix] = useState('');
  const [maxPrix, setMaxPrix] = useState('');
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catDepuisUrl = params.get('categorie');
    if (catDepuisUrl) setCategorie(catDepuisUrl);
    else setCategorie('');
  }, [location.search]);

  const charger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categorie) params.append('categorie', categorie);
      if (recherche) params.append('recherche', recherche);
      if (minPrix) params.append('minPrix', minPrix);
      if (maxPrix) params.append('maxPrix', maxPrix);
      const { data } = await api.get(`/produits?${params}`);
      let produitsData = data.produits;
      
      if (sortBy === 'price_asc') {
        produitsData = [...produitsData].sort((a, b) => a.prix - b.prix);
      } else if (sortBy === 'price_desc') {
        produitsData = [...produitsData].sort((a, b) => b.prix - a.prix);
      } else if (sortBy === 'recent') {
        produitsData = [...produitsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setProduits(produitsData);
    } catch (err) { 
      toast.error('Erreur lors du chargement des produits.'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, [categorie, recherche, minPrix, maxPrix, sortBy]);

  const getNavLinkStyle = (id) => ({
    ...styles.navLink,
    color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
    transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
    background: hoveredLink === id ? 'rgba(255,255,255,0.08)' : 'transparent',
  });

  const resetFilters = () => {
    setMinPrix('');
    setMaxPrix('');
    setRecherche('');
    setCategorie('');
    setSortBy('recent');
  };

  return (
    <div style={styles.container}>
      
      {/* Navigation */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>TEY<span style={{ color: '#F4A76A' }}>SHOP</span></Link>
        
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={styles.searchInput} 
            />
            <button style={styles.searchBtn}>
              🔍
            </button>
          </div>
        </div>

        <div style={styles.navRight}>
          <Link to="/" style={getNavLinkStyle('home')} onMouseEnter={() => setHoveredLink('home')} onMouseLeave={() => setHoveredLink(null)}>Accueil</Link>
          
          {user ? (
            <>
              <Link to="/mes-commandes" style={getNavLinkStyle('cmd')} onMouseEnter={() => setHoveredLink('cmd')} onMouseLeave={() => setHoveredLink(null)}>Commandes</Link>
              <Link to="/panier" style={styles.cartBtn}>
                🛒
                <span>Panier</span>
                {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
              </Link>
              <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/panier" style={styles.cartBtn}>
                🛒
                <span>Panier</span>
                {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
              </Link>
              <Link to="/connexion" style={styles.navLink}>Connexion</Link>
              <Link to="/inscription" style={styles.navLink}>Inscription</Link>
            </>
          )}
        </div>
      </nav>

      {/* Layout : Sidebar + Contenu */}
      <div style={styles.mainLayout}>
        
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          
          {/* Section Catégories */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Catégories</h3>
            <div style={styles.categoryList}>
              {CATEGORIES.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setCategorie(c.id)}
                  className="category-btn"
                  style={{ ...styles.categoryBtn, ...(categorie === c.id ? styles.categoryBtnActive : {}) }}
                >
                  <span>{c.label}</span>
                  {categorie === c.id && <span style={styles.checkIcon}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Section Prix */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Prix</h3>
            <div style={styles.priceRange}>
              <div style={styles.priceInputGroup}>
                <span style={styles.priceLabel}>Min</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minPrix}
                  onChange={e => setMinPrix(e.target.value)}
                  style={styles.sidebarPriceInput}
                />
              </div>
              <span style={styles.priceDash}>—</span>
              <div style={styles.priceInputGroup}>
                <span style={styles.priceLabel}>Max</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Illimité"
                  value={maxPrix}
                  onChange={e => setMaxPrix(e.target.value)}
                  style={styles.sidebarPriceInput}
                />
              </div>
            </div>
          </div>

          {(categorie || recherche || minPrix || maxPrix) && (
            <button onClick={resetFilters} style={styles.resetSidebarBtn}>
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Contenu principal */}
        <main style={styles.content}>
          <div style={styles.resultsHeader}>
            <div style={styles.resultsCount}>
              <span>{produits.length} résultats</span>
            </div>
            <div style={styles.sortSection}>
              <span style={styles.sortLabel}>Trier par :</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix : croissant</option>
                <option value="price_desc">Prix : décroissant</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingGrid}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={styles.skeletonCard}>
                  <div style={styles.skeletonImage}></div>
                  <div style={styles.skeletonInfo}>
                    <div style={styles.skeletonLine}></div>
                    <div style={styles.skeletonLineShort}></div>
                    <div style={styles.skeletonPrice}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && produits.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <h3 style={styles.emptyTitle}>Aucun résultat trouvé</h3>
              <p style={styles.emptyText}>Essayez d'autres mots-clés ou consultez nos meilleures ventes</p>
              <button onClick={resetFilters} style={styles.emptyBtn}>Voir tous les produits</button>
            </div>
          )}

          {!loading && produits.length > 0 && (
            <div style={styles.grid}>
              {produits.map((p) => (
                <div 
                  key={p._id} 
                  style={styles.card}
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct(p._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link to={`/produit/${p._id}`} style={styles.cardLink}>
                    <div style={styles.cardImageWrapper}>
                      {p.badge && <span style={styles.badge}>{p.badge}</span>}
                      {p.images && p.images.length > 0 ? (
                        <img 
                          src={mediaUrl(p.images?.[0])} 
                          alt={p.nom} 
                          style={{
                            ...styles.productImg,
                            transform: hoveredProduct === p._id ? 'scale(1.05)' : 'scale(1)',
                          }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Image+Indisponible"; }} 
                        />
                      ) : (
                        <div style={styles.noImage}>🖼️</div>
                      )}
                    </div>
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>{p.nom}</h3>
                      <div style={styles.cardPrice}>
                        <span style={styles.priceAmount}>{Number(p.prix).toLocaleString('fr-FR')}</span>
                        <span style={styles.priceCurrency}>FCFA</span>
                      </div>
                      <p style={styles.cardDesc}>{p.description?.substring(0, 60)}...</p>
                      <p style={styles.stockInfo}>
                        {p.stock > 0 ? (
                          <span style={styles.inStock}>✓ En stock</span>
                        ) : (
                          <span style={styles.outStock}>Rupture</span>
                        )}
                      </p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => { ajouterAuPanier(p); toast.success(`${p.nom} ajouté au panier !`); }} 
                    style={{ ...styles.addBtn, opacity: p.stock === 0 ? 0.5 : 1 }} 
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: '100vh',
    background: '#F5F7FA',
  },
  
  // Navigation
  nav: {
    background: '#112219',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    gap: '20px',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '500px',
    margin: '0 auto',
  },
  searchWrapper: {
    display: 'flex',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    padding: '10px 15px',
    border: 'none',
    borderRadius: '8px 0 0 8px',
    outline: 'none',
    fontSize: '0.9rem',
    background: '#fff',
  },
  searchBtn: {
    background: '#F4A76A',
    border: 'none',
    borderRadius: '0 8px 8px 0',
    padding: '0 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    transition: 'all 0.2s ease',
  },
  navRight: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  cartBtn: {
    background: '#E74C3C',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  cartBadge: {
    background: '#fff',
    color: '#E74C3C',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: '700',
  },
  decoBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  
  // Main Layout
  mainLayout: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    gap: '25px',
  },
  
  // Sidebar
  sidebar: {
    width: '260px',
    background: '#fff',
    borderRadius: '12px',
    padding: '20px 0',
    height: 'fit-content',
    position: 'sticky',
    top: '80px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #E8E8E8',
  },
  sidebarSection: {
    padding: '0 20px 20px 20px',
    borderBottom: '1px solid #E8E8E8',
    marginBottom: '20px',
  },
  sidebarTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#112219',
    marginBottom: '15px',
    letterSpacing: '0.3px',
  },
  
  // Boutons de catégories simplifiés (effet zoom + ombre)
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  categoryBtn: {
    width: '100%',
    padding: '10px 0',
    background: 'transparent',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  categoryBtnActive: {
    color: '#C8410A',
    fontWeight: '600',
  },
  checkIcon: {
    color: '#C8410A',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  
  // Prix
  priceRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  priceInputGroup: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#F8F9FA',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #E8E8E8',
  },
  priceLabel: {
    fontSize: '0.7rem',
    color: '#666',
    fontWeight: '500',
  },
  sidebarPriceInput: {
    width: '70px',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.8rem',
    padding: '0',
  },
  priceDash: {
    color: '#999',
    fontSize: '0.9rem',
  },
  resetSidebarBtn: {
    width: 'calc(100% - 40px)',
    margin: '0 20px',
    padding: '10px',
    background: '#F0F0F0',
    border: 'none',
    borderRadius: '10px',
    color: '#C8410A',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Results header
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px 0',
  },
  resultsCount: {
    fontSize: '0.85rem',
    color: '#666',
    background: '#fff',
    padding: '5px 14px',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sortSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortLabel: {
    fontSize: '0.8rem',
    color: '#666',
  },
  sortSelect: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    outline: 'none',
  },
  
  // Loading
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  skeletonCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  skeletonImage: {
    height: '200px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonInfo: {
    padding: '15px',
  },
  skeletonLine: {
    height: '14px',
    background: '#f0f0f0',
    borderRadius: '6px',
    marginBottom: '10px',
    width: '80%',
  },
  skeletonLineShort: {
    height: '12px',
    background: '#f0f0f0',
    borderRadius: '6px',
    marginBottom: '8px',
    width: '60%',
  },
  skeletonPrice: {
    height: '18px',
    background: '#f0f0f0',
    borderRadius: '6px',
    width: '40%',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#999',
    marginBottom: '25px',
  },
  emptyBtn: {
    padding: '10px 28px',
    borderRadius: '8px',
    border: 'none',
    background: '#C8410A',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Product Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid #E8E8E8',
    display: 'flex',
    flexDirection: 'column',
  },
  cardLink: {
    textDecoration: 'none',
    flex: 1,
  },
  cardImageWrapper: {
    position: 'relative',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FAFAFA',
    overflow: 'hidden',
  },
  productImg: {
    maxWidth: '85%',
    maxHeight: '85%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  noImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  badge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#C8410A',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  cardContent: {
    padding: '15px',
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#112219',
    marginBottom: '8px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardPrice: {
    marginBottom: '8px',
  },
  priceAmount: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#C8410A',
  },
  priceCurrency: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#C8410A',
    marginLeft: '2px',
  },
  cardDesc: {
    fontSize: '0.7rem',
    color: '#888',
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  stockInfo: {
    fontSize: '0.7rem',
    marginTop: '5px',
  },
  inStock: {
    color: '#2ECC71',
  },
  outStock: {
    color: '#E74C3C',
  },
  addBtn: {
    margin: '0 15px 15px 15px',
    padding: '8px',
    background: '#112219',
    border: 'none',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#fff',
  },
};

// Animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
  
  .product-card:hover .add-btn {
    background: #C8410A;
  }
  
  .search-btn:hover {
    background: #E8622A;
  }
  
  .cart-btn:hover, .add-btn:hover:not(:disabled), .empty-btn:hover, .reset-sidebar-btn:hover {
    background: #C0392B;
    transform: translateY(-1px);
  }
  
  /* Effet zoom + ombre au survol des boutons catégories */
  .category-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    color: #C8410A;
  }
  
  .category-btn:active {
    transform: scale(0.98);
  }
  
  .decoBtn:hover, .nav-link:hover {
    background: rgba(255,255,255,0.1);
  }
  
  .sort-select:focus {
    border-color: #C8410A;
    outline: none;
  }
  
  .price-input-group:focus-within {
    border-color: #C8410A;
    box-shadow: 0 0 0 2px rgba(200, 65, 10, 0.1);
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #F1F1F1;
  }
  ::-webkit-scrollbar-thumb {
    background: #C8410A;
    border-radius: 4px;
  }
  
  ::selection {
    background: #C8410A;
    color: #fff;
  }
`;
document.head.appendChild(styleSheet);
