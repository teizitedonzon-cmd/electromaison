// import React, { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useCart } from '../../context/CartContext';
// import Icon from '../../components/Icon';

// // Importation des images locales
// import font from '../../assets/images/font.jpg';
// import autre from '../../assets/images/autre.jpg';
// import aliment from '../../assets/images/alimentation.jpg';
// import sport from '../../assets/images/sport.jpg';
// import immobilier from '../../assets/images/immobilier.jpg';
// import vetement from '../../assets/images/vetement.jpg';
// import logot from '../../assets/images/logot.jpg';


// const IMAGES = {
//   electronique: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600",
//   vetements: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600",
//   alimentation: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600",
//   electromenager: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600",
//   beaute: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600",
//   immobilier: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600",
//   sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600",
//   autre: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"
// };

// // Images de fond
// const backgroundImages = [
//   font,
//     autre,
//   aliment,
//   sport,
//   immobilier,
//   vetement

// ];

// const CategoryIcons = {
//   Électronique: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <rect x="5" y="2" width="14" height="20" rx="2" />
//       <line x1="12" y1="18" x2="12.01" y2="18" />
//     </svg>
//   ),
//   Vêtements: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
//     </svg>
//   ),
//   Alimentation: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
//       <path d="M8.5 14s1.5 2 3.5 2 3.5-2 3.5-2" />
//       <line x1="9" y1="9" x2="9.01" y2="9" />
//       <line x1="15" y1="9" x2="15.01" y2="9" />
//     </svg>
//   ),
//   electromenager: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <rect x="2" y="3" width="20" height="14" rx="2" />
//       <line x1="8" y1="21" x2="16" y2="21" />
//       <line x1="12" y1="17" x2="12" y2="21" />
//     </svg>
//   ),
//   Beauté: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//     </svg>
//   ),
//   immobilier: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//       <polyline points="9 22 9 12 15 12 15 22" />
//     </svg>
//   ),
//   Sport: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <circle cx="12" cy="12" r="10" />
//       <path d="M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
//     </svg>
//   ),
//   Autre: (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
//       <circle cx="12" cy="12" r="1" fill="#F4A76A" />
//       <circle cx="19" cy="12" r="1" fill="#F4A76A" />
//       <circle cx="5" cy="12" r="1" fill="#F4A76A" />
//     </svg>
//   ),
// };

// export default function Accueil() {
//   const { user, deconnexion } = useAuth();
//   const { nombreArticles } = useCart();
//   const [hoveredLink, setHoveredLink] = useState(null);
//   const [hoveredCard, setHoveredCard] = useState(null);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isHoveringHero, setIsHoveringHero] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const intervalRef = useRef(null);

//   // Fonction pour passer à l'image suivante
//   const nextImage = () => {
//     if (isTransitioning) return;
    
//     setIsTransitioning(true);
    
//     setTimeout(() => {
//       setActiveIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
//       setIsTransitioning(false);
//     }, 1000);
//   };

//   // Démarrer le carrousel
//   useEffect(() => {
//     // Lancer l'intervalle toutes les 8 secondes
//     intervalRef.current = setInterval(nextImage,4000);
    
//     // Nettoyer l'intervalle au démontage
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [isTransitioning]);

//   // Préchargement des images
//   useEffect(() => {
//     backgroundImages.forEach((src) => {
//       if (src) {
//         const img = new Image();
//         img.src = src;
//       }
//     });
//   }, []);

//   const getNavLinkStyle = (id) => ({
//     ...styles.navLink,
//     color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
//     transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
//     background: hoveredLink === id ? 'rgba(255,255,255,0.08)' : 'transparent',
//   });

//   const getCatCardStyle = (id) => ({
//     ...styles.catCard,
//     transform: hoveredCard === id ? 'translateY(-8px)' : 'translateY(0)',
//     boxShadow: hoveredCard === id
//       ? '0 20px 40px rgba(0,0,0,0.12)'
//       : '0 4px 12px rgba(0,0,0,0.05)',
//   });

//   const categoriesData = [
//     { lb: 'Électronique',   id: 'Électronique',  img: IMAGES.electronique,  desc: 'Smartphones et Gadgets' },
//     { lb: 'Vêtements',      id: 'Vêtements',     img: IMAGES.vetements,     desc: 'Mode et Accessoires' },
//     { lb: 'Alimentation',   id: 'Alimentation',  img: IMAGES.alimentation,  desc: 'Produits frais' },
//     { lb: 'Électroménager', id: 'electromenager',img: IMAGES.electromenager, desc: 'Équipements maison' },
//     { lb: 'Beauté',         id: 'Beauté',        img: IMAGES.beaute,        desc: 'Soins et cosmétiques' },
//     { lb: 'Immobilier',     id: 'immobilier',    img: IMAGES.immobilier,    desc: 'Ventes et locations' },
//     { lb: 'Sport',          id: 'Sport',         img: IMAGES.sport,         desc: 'Articles de sport' },
//     { lb: 'Autre',          id: 'Autre',         img: IMAGES.autre,         desc: 'Divers articles' },
//   ];

//   return (
//     <div style={styles.container}>
//       {/* Navigation avec menu burger */}
//       <nav style={styles.nav}>
//         <div style={styles.logoContainer}>
//           <Link to="/" style={styles.logoLink}>
//             <img src={logot} alt="TeyShop" style={styles.logoImage} />
//           </Link>
//           <Link to="/" style={styles.logoText}>
//             TEY<span style={{ color: '#F4A76A' }}>SHOP</span>
//           </Link>
//         </div>
        
//         {/* Menu Desktop */}
//         <div className="desktop-menu" style={styles.desktopMenu}>
//           <Link to="/catalogue" style={getNavLinkStyle('cat')} onMouseEnter={() => setHoveredLink('cat')} onMouseLeave={() => setHoveredLink(null)}>Catalogue</Link>
          
//           {user ? (
//             <>
//               <Link to="/mes-commandes" style={getNavLinkStyle('cmd')} onMouseEnter={() => setHoveredLink('cmd')} onMouseLeave={() => setHoveredLink(null)}>Mes commandes</Link>
//               <Link to="/profil" style={getNavLinkStyle('prof')} onMouseEnter={() => setHoveredLink('prof')} onMouseLeave={() => setHoveredLink(null)}>Mon profil</Link>
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

//         {/* Bouton Menu Mobile */}
//         <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={styles.mobileMenuBtn}>
//           <Icon name={menuOpen ? "x" : "menu"} size={24} color="#fff" />
//         </button>
//       </nav>

//       {/* Menu Mobile Déroulant */}
//       {menuOpen && (
//         <div style={styles.mobileMenu}>
//           <Link to="/catalogue" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Catalogue</Link>
//           {user ? (
//             <>
//               <Link to="/mes-commandes" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Mes commandes</Link>
//               <Link to="/profil" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Mon profil</Link>
//               <Link to="/panier" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>
//                 Panier {nombreArticles > 0 && <span style={styles.mobileBadge}>{nombreArticles}</span>}
//               </Link>
//               <button onClick={() => { deconnexion(); setMenuOpen(false); }} style={styles.mobileDecoBtn}>Déconnexion</button>
//             </>
//           ) : (
//             <>
//               <Link to="/panier" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>
//                 Panier {nombreArticles > 0 && <span style={styles.mobileBadge}>{nombreArticles}</span>}
//               </Link>
//               <Link to="/connexion" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Connexion</Link>
//               <Link to="/inscription" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Inscription</Link>
//             </>
//           )}
//         </div>
//       )}

//       {/* Hero Section - Texte de bienvenue visible sur toutes les images */}
//       <div 
//         style={styles.heroWrapper}
//         onMouseEnter={() => setIsHoveringHero(true)}
//         onMouseLeave={() => setIsHoveringHero(false)}
//       >
//         {/* Conteneur des images avec transition */}
//         <div style={styles.imageContainer}>
//           {backgroundImages.map((img, idx) => (
//             <div
//               key={idx}
//               style={{
//                 ...styles.heroImage,
//                 backgroundImage: `url(${img})`,
//                 opacity: idx === activeIndex ? 1 : 0,
//                 zIndex: idx === activeIndex ? 2 : 1,
//                 transform: isHoveringHero ? 'scale(1.08)' : 'scale(1)',
//                 transition: `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${isTransitioning ? '1s' : '0s'} ease-in-out`,
//               }}
//             />
//           ))}
//         </div>
        
//         {/* Overlay et texte de bienvenue - TOUJOURS VISIBLE */}
//         <div style={styles.heroOverlay}>
//           <div style={styles.heroContent}>
//             <div style={styles.heroBadge}>✦</div>
//             <h1 style={styles.heroTitre}>
//               {user ? (
//                 <>
//                   Bonjour, <span style={styles.userName}>{user?.prenom} {user?.nom}</span>
//                 </>
//               ) : (
//                 <>
//                   Bienvenue chez <span style={styles.brandName}>TEYSHOP</span>
//                 </>
//               )}
//             </h1>
//             <p style={styles.heroSub}>L'excellence au service de votre quotidien</p>
//           </div>
//         </div>
        
//         {/* Barre de progression */}
//         <div style={styles.progressBarContainer}>
//           <div 
//             style={{
//               ...styles.progressBar,
//               animation: 'progress 8s linear infinite',
//             }}
//             key={activeIndex}
//           />
//         </div>
//       </div>

//       {/* Catégories */}
//       <section style={styles.section}>
//         <div style={styles.sectionHeader}>
//           <h2 style={styles.sectionTitre}>Explorez nos Univers</h2>
//           <div style={styles.divider}></div>
//           <p style={styles.sectionSub}>Trouvez rapidement ce dont vous avez besoin</p>
//         </div>

//         <div style={styles.catGrid}>
//           {categoriesData.map((cat) => (
//             <Link
//               key={cat.id}
//               to={`/catalogue?categorie=${cat.id}`}
//               style={getCatCardStyle(cat.id)}
//               onMouseEnter={() => setHoveredCard(cat.id)}
//               onMouseLeave={() => setHoveredCard(null)}
//             >
//               <div style={styles.cardImageWrapper}>
//                 <img
//                   src={cat.img}
//                   alt={cat.lb}
//                   style={{
//                     ...styles.cardImage,
//                     transform: hoveredCard === cat.id ? 'scale(1.08)' : 'scale(1)',
//                   }}
//                 />
//                 <div style={styles.iconBadge}>{CategoryIcons[cat.id]}</div>
//               </div>
//               <div style={styles.cardInfo}>
//                 <h3 style={styles.cardLabel}>{cat.lb}</h3>
//                 <p style={styles.cardDesc}>{cat.desc}</p>
//                 <span style={styles.cardArrow}>Voir les produits →</span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* Styles responsives injectés */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         /* ===== MEDIA QUERIES RESPONSIVES ===== */
        
//         /* Tablette et mobile */
//         @media (max-width: 992px) {
//           .cat-grid {
//             grid-template-columns: repeat(2, 1fr) !important;
//             gap: 20px !important;
//           }
//           .section {
//             padding: 50px 5% !important;
//           }
//           .section-titre {
//             font-size: 1.8rem !important;
//           }
//         }
        
//         /* Mobile */
//         @media (max-width: 768px) {
//           /* Menu desktop caché */
//           .desktop-menu {
//             display: none !important;
//           }
//           .mobile-menu-btn {
//             display: flex !important;
//           }
          
//           /* Navbar */
//           .nav {
//             padding: 0 16px !important;
//             height: 65px !important;
//           }
//           .logo-image {
//             height: 35px !important;
//           }
//           .logo-text {
//             font-size: 1.2rem !important;
//           }
          
//           /* Hero */
//           .hero-wrapper {
//             min-height: 50vh !important;
//           }
//           .hero-badge {
//             font-size: 1.2rem !important;
//             margin-bottom: 10px !important;
//           }
//           .hero-titre {
//             font-size: 1.5rem !important;
//           }
//           .hero-sub {
//             font-size: 0.85rem !important;
//           }
          
//           /* Section */
//           .section {
//             padding: 40px 16px !important;
//           }
//           .section-titre {
//             font-size: 1.4rem !important;
//           }
//           .section-sub {
//             font-size: 0.85rem !important;
//           }
          
//           /* Catégories */
//           .cat-grid {
//             grid-template-columns: repeat(2, 1fr) !important;
//             gap: 15px !important;
//           }
//           .card-image-wrapper {
//             height: 140px !important;
//           }
//           .card-label {
//             font-size: 0.85rem !important;
//           }
//           .card-desc {
//             font-size: 0.65rem !important;
//           }
//           .card-arrow {
//             font-size: 0.7rem !important;
//           }
//           .card-info {
//             padding: 12px !important;
//           }
//           .icon-badge {
//             width: 30px !important;
//             height: 30px !important;
//           }
//           .icon-badge svg {
//             width: 14px !important;
//             height: 14px !important;
//           }
          
//           /* Bouton panier */
//           .cart-btn span {
//             display: none;
//           }
//           .cart-btn {
//             padding: 8px 12px !important;
//           }
//         }
        
//         /* Très petit mobile */
//         @media (max-width: 480px) {
//           .cat-grid {
//             grid-template-columns: 1fr !important;
//           }
//           .card-image-wrapper {
//             height: 180px !important;
//           }
//           .hero-wrapper {
//             min-height: 40vh !important;
//           }
//           .hero-titre {
//             font-size: 1.2rem !important;
//           }
//           .progress-bar-container {
//             display: none !important;
//           }
//         }
        
//         /* Animation menu mobile */
//         .mobile-menu {
//           animation: slideDown 0.3s ease-out;
//         }
        
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       ` }} />
//     </div>
//   );
// }

// const styles = {
//   container: {
//     fontFamily: "'Inter', -apple-system, sans-serif",
//     minHeight: '100vh',
//     background: '#F8F9FA',
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
//   logoContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px',
//   },
//   logoLink: {
//     textDecoration: 'none',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   logoImage: {
//     height: '40px',
//     width: 'auto',
//     objectFit: 'contain',
//   },
//   logoText: {
//     fontSize: '1.5rem',
//     fontWeight: '800',
//     color: '#fff',
//     textDecoration: 'none',
//     letterSpacing: '-0.5px',
//   },
//   desktopMenu: {
//     display: 'flex',
//     gap: '8px',
//     alignItems: 'center',
//   },
//   mobileMenuBtn: {
//     display: 'none',
//     background: 'none',
//     border: 'none',
//     cursor: 'pointer',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   mobileMenu: {
//     position: 'absolute',
//     top: '80px',
//     left: 0,
//     right: 0,
//     background: '#112219',
//     padding: '16px',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px',
//     zIndex: 99,
//     borderBottom: '1px solid rgba(255,255,255,0.1)',
//   },
//   mobileMenuItem: {
//     color: '#fff',
//     textDecoration: 'none',
//     padding: '12px 16px',
//     borderRadius: '10px',
//     fontSize: '0.9rem',
//     fontWeight: '500',
//     background: 'rgba(255,255,255,0.05)',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   mobileBadge: {
//     background: '#C8410A',
//     color: '#fff',
//     padding: '2px 8px',
//     borderRadius: '20px',
//     fontSize: '0.7rem',
//   },
//   mobileDecoBtn: {
//     width: '100%',
//     textAlign: 'left',
//     background: 'rgba(231, 76, 60, 0.2)',
//     border: 'none',
//     color: '#E74C3C',
//     padding: '12px 16px',
//     borderRadius: '10px',
//     fontSize: '0.9rem',
//     fontWeight: '500',
//     cursor: 'pointer',
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
  
//   // Hero Wrapper
//   heroWrapper: {
//     position: 'relative',
//     minHeight: '75vh',
//     overflow: 'hidden',
//   },
  
//   // Image Container
//   imageContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
  
//   // Hero Image
//   heroImage: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundSize: 'cover',
//     backgroundPosition: 'center center',
//     backgroundRepeat: 'no-repeat',
//     willChange: 'transform, opacity',
//   },
  
//   // Overlay (toujours visible)
//   heroOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 10,
//   },
//   heroContent: {
//     maxWidth: '900px',
//     padding: '0 20px',
//     textAlign: 'center',
//     animation: 'fadeInUp 0.8s ease-out',
//   },
//   heroBadge: {
//     fontSize: '2rem',
//     fontWeight: '300',
//     color: '#F4A76A',
//     marginBottom: '20px',
//     opacity: 0.9,
//   },
//   heroTitre: {
//     fontSize: 'clamp(1.5rem, 5vw, 3.8rem)',
//     fontWeight: '800',
//     marginBottom: '16px',
//     lineHeight: 1.2,
//     color: '#fff',
//     textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
//   },
//   userName: {
//     color: '#F4A76A',
//     fontWeight: '900',
//     background: 'linear-gradient(135deg, #F4A76A, #C8410A)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//     backgroundClip: 'text',
//   },
//   brandName: {
//     background: 'linear-gradient(135deg, #F4A76A, #C8410A)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//     backgroundClip: 'text',
//     display: 'inline-block',
//     animation: 'pulse 2s ease-in-out infinite',
//   },
//   heroSub: {
//     fontSize: 'clamp(0.85rem, 3vw, 1.15rem)',
//     fontWeight: '400',
//     color: 'rgba(255,255,255,0.95)',
//     textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
//   },
  
//   // Barre de progression
//   progressBarContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: '3px',
//     background: 'rgba(255,255,255,0.2)',
//     zIndex: 20,
//   },
//   progressBar: {
//     height: '100%',
//     width: '0%',
//     background: 'linear-gradient(90deg, #F4A76A, #C8410A)',
//     borderRadius: '3px',
//   },
  
//   // Section
//   section: {
//     padding: '80px 8%',
//     position: 'relative',
//     zIndex: 5,
//     background: '#F8F9FA',
//   },
//   sectionHeader: {
//     textAlign: 'center',
//     marginBottom: 'clamp(30px, 5vw, 60px)',
//   },
//   sectionTitre: {
//     fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
//     fontWeight: '900',
//     color: '#112219',
//     marginBottom: '16px',
//   },
//   divider: {
//     width: '60px',
//     height: '4px',
//     background: 'linear-gradient(90deg, #C8410A, #F4A76A)',
//     margin: '0 auto 16px',
//     borderRadius: '10px',
//   },
//   sectionSub: {
//     color: '#666',
//     fontSize: 'clamp(0.8rem, 3vw, 1rem)',
//   },
  
//   // Catégories Grid
//   catGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
//     gap: '30px',
//   },
//   catCard: {
//     background: '#fff',
//     borderRadius: '24px',
//     overflow: 'hidden',
//     textDecoration: 'none',
//     color: '#1A1A1A',
//     transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
//     display: 'block',
//   },
//   cardImageWrapper: {
//     height: '200px',
//     width: '100%',
//     overflow: 'hidden',
//     background: '#f5f5f5',
//     position: 'relative',
//   },
//   cardImage: {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//     transition: 'transform 0.4s ease',
//   },
//   iconBadge: {
//     position: 'absolute',
//     bottom: '12px',
//     right: '12px',
//     width: '38px',
//     height: '38px',
//     background: '#112219',
//     borderRadius: '12px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cardInfo: {
//     padding: '20px',
//   },
//   cardLabel: {
//     fontWeight: '800',
//     fontSize: '1.1rem',
//     margin: '0 0 6px',
//     color: '#112219',
//   },
//   cardDesc: {
//     color: '#777',
//     fontSize: '0.85rem',
//     margin: '0 0 12px',
//   },
//   cardArrow: {
//     fontWeight: '700',
//     fontSize: '0.8rem',
//     color: '#C8410A',
//     display: 'inline-block',
//     transition: 'transform 0.3s ease',
//   },
// };

// // Animations globales
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
  
//   @keyframes pulse {
//     0%, 100% {
//       opacity: 1;
//     }
//     50% {
//       opacity: 0.85;
//     }
//   }
  
//   @keyframes progress {
//     0% {
//       width: 0%;
//     }
//     100% {
//       width: 100%;
//     }
//   }
  
//   .cat-card:hover .card-arrow {
//     transform: translateX(8px);
//   }
  
//   .cart-btn:hover, .hero-btn:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 20px rgba(200, 65, 10, 0.3);
//   }
  
//   .deco-btn:hover {
//     background: rgba(255,255,255,0.15);
//     transform: translateY(-2px);
//   }
  
//   .nav-link:hover {
//     background: rgba(255,255,255,0.08);
//     transform: translateY(-2px);
//   }
// `;
// document.head.appendChild(styleSheet);


import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Icon from '../../components/Icon';

// Importation des images locales
import font from '../../assets/images/font.jpg';
import autre from '../../assets/images/autre.jpg';
import aliment from '../../assets/images/alimentation.jpg';
import sport from '../../assets/images/sport.jpg';
import immobilier from '../../assets/images/immobilier.jpg';
import vetement from '../../assets/images/vetement.jpg';
import logot from '../../assets/images/logot.jpg';


const IMAGES = {
  electronique: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600",
  vetements: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600",
  alimentation: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600",
  electromenager: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600",
  beaute: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600",
  immobilier: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600",
  sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600",
  autre: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"
};

// Images de fond
const backgroundImages = [
  font,
    autre,
  aliment,
  sport,
  immobilier,
  vetement

];

const CategoryIcons = {
  Électronique: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Vêtements: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  ),
  Alimentation: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
      <path d="M8.5 14s1.5 2 3.5 2 3.5-2 3.5-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  electromenager: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Beauté: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  immobilier: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Sport: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
    </svg>
  ),
  Autre: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F4A76A" strokeWidth="1.8">
      <circle cx="12" cy="12" r="1" fill="#F4A76A" />
      <circle cx="19" cy="12" r="1" fill="#F4A76A" />
      <circle cx="5" cy="12" r="1" fill="#F4A76A" />
    </svg>
  ),
};

export default function Accueil() {
  const { user, deconnexion } = useAuth();
  const { nombreArticles } = useCart();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const intervalRef = useRef(null);

  // Détecter la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonction pour passer à l'image suivante
  const nextImage = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
      setIsTransitioning(false);
    }, 1000);
  };

  // Démarrer le carrousel
  useEffect(() => {
    intervalRef.current = setInterval(nextImage, 4000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTransitioning]);

  // Préchargement des images
  useEffect(() => {
    backgroundImages.forEach((src) => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, []);

  const getNavLinkStyle = (id) => ({
    ...styles.navLink,
    color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
    transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
    background: hoveredLink === id ? 'rgba(255,255,255,0.08)' : 'transparent',
  });

  const getCatCardStyle = (id) => ({
    ...styles.catCard,
    transform: hoveredCard === id ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: hoveredCard === id
      ? '0 20px 40px rgba(0,0,0,0.12)'
      : '0 4px 12px rgba(0,0,0,0.05)',
  });

  const categoriesData = [
    { lb: 'Électronique',   id: 'Électronique',  img: IMAGES.electronique,  desc: 'Smartphones & Gadgets' },
    { lb: 'Vêtements',      id: 'Vêtements',     img: IMAGES.vetements,     desc: 'Mode & Accessoires' },
    { lb: 'Alimentation',   id: 'Alimentation',  img: IMAGES.alimentation,  desc: 'Produits frais' },
    { lb: 'Électroménager', id: 'electromenager',img: IMAGES.electromenager, desc: 'Équipements maison' },
    { lb: 'Beauté',         id: 'Beauté',        img: IMAGES.beaute,        desc: 'Soins & cosmétiques' },
    { lb: 'Immobilier',     id: 'immobilier',    img: IMAGES.immobilier,    desc: 'Ventes & locations' },
    { lb: 'Sport',          id: 'Sport',         img: IMAGES.sport,         desc: 'Articles de sport' },
    { lb: 'Autre',          id: 'Autre',         img: IMAGES.autre,         desc: 'Divers articles' },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation avec menu burger */}
      <nav style={styles.nav}>
        <div style={styles.logoContainer}>
          <Link to="/" style={styles.logoLink}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
          </Link>
          <Link to="/" style={styles.logoText}>
            TEY<span style={{ color: '#F4A76A' }}>SHOP</span>
          </Link>
        </div>
        
        {/* Menu Desktop */}
        <div className="desktop-menu" style={styles.desktopMenu}>
          <Link to="/catalogue" style={getNavLinkStyle('cat')} onMouseEnter={() => setHoveredLink('cat')} onMouseLeave={() => setHoveredLink(null)}>Catalogue</Link>
          
          {user ? (
            <>
              <Link to="/mes-commandes" style={getNavLinkStyle('cmd')} onMouseEnter={() => setHoveredLink('cmd')} onMouseLeave={() => setHoveredLink(null)}>Mes commandes</Link>
              <Link to="/profil" style={getNavLinkStyle('prof')} onMouseEnter={() => setHoveredLink('prof')} onMouseLeave={() => setHoveredLink(null)}>Mon profil</Link>
              <Link to="/panier" style={styles.cartBtn}>
                <Icon name="cart" size={17} />
                <span>Panier</span>
                {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
              </Link>
              <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/panier" style={styles.cartBtn}>
                <Icon name="cart" size={17} />
                <span>Panier</span>
                {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
              </Link>
              <Link to="/connexion" style={styles.navLink}>Connexion</Link>
              <Link to="/inscription" style={styles.navLink}>Inscription</Link>
            </>
          )}
        </div>

        {/* Bouton Menu Mobile - toujours visible sur mobile */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)} 
          style={{
            ...styles.mobileMenuBtn,
            display: isMobile ? 'flex' : 'none'
          }}
        >
          {menuOpen ? (
            <Icon name="x" size={24} color="#fff" />
          ) : (
            <div style={styles.burgerIcon}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </button>
      </nav>

      {/* Menu Mobile Déroulant - Amélioré */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/catalogue" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Catalogue</Link>
          {user ? (
            <>
              <Link to="/mes-commandes" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Mes commandes</Link>
              <Link to="/profil" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Mon profil</Link>
              <Link to="/panier" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>
                Panier {nombreArticles > 0 && <span style={styles.mobileBadge}>{nombreArticles}</span>}
              </Link>
              <button onClick={() => { deconnexion(); setMenuOpen(false); }} style={styles.mobileDecoBtn}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/panier" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>
                Panier {nombreArticles > 0 && <span style={styles.mobileBadge}>{nombreArticles}</span>}
              </Link>
              <Link to="/connexion" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Connexion</Link>
              <Link to="/inscription" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Inscription</Link>
            </>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div 
        style={styles.heroWrapper}
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        <div style={styles.imageContainer}>
          {backgroundImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                ...styles.heroImage,
                backgroundImage: `url(${img})`,
                opacity: idx === activeIndex ? 1 : 0,
                zIndex: idx === activeIndex ? 2 : 1,
                transform: isHoveringHero ? 'scale(1.08)' : 'scale(1)',
                transition: `transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${isTransitioning ? '1s' : '0s'} ease-in-out`,
              }}
            />
          ))}
        </div>
        
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>✦</div>
            <h1 style={styles.heroTitre}>
              {user ? (
                <>
                  Bonjour, <span style={styles.userName}>{user?.prenom} {user?.nom}</span>
                </>
              ) : (
                <>
                  Bienvenue chez <span style={styles.brandName}>TEYSHOP</span>
                </>
              )}
            </h1>
            <p style={styles.heroSub}>L'excellence au service de votre quotidien</p>
          </div>
        </div>
        
        <div style={styles.progressBarContainer}>
          <div 
            style={{
              ...styles.progressBar,
              animation: 'progress 4s linear infinite',
            }}
            key={activeIndex}
          />
        </div>
      </div>

      {/* Catégories */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitre}>Explorez nos Univers</h2>
          <div style={styles.divider}></div>
          <p style={styles.sectionSub}>Trouvez rapidement ce dont vous avez besoin</p>
        </div>

        <div style={styles.catGrid}>
          {categoriesData.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogue?categorie=${cat.id}`}
              style={getCatCardStyle(cat.id)}
              onMouseEnter={() => setHoveredCard(cat.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardImageWrapper}>
                <img
                  src={cat.img}
                  alt={cat.lb}
                  style={{
                    ...styles.cardImage,
                    transform: hoveredCard === cat.id ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
                <div style={styles.iconBadge}>{CategoryIcons[cat.id]}</div>
              </div>
              <div style={styles.cardInfo}>
                <h3 style={styles.cardLabel}>{cat.lb}</h3>
                <p style={styles.cardDesc}>{cat.desc}</p>
                <span style={styles.cardArrow}>Voir les produits →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Styles responsives améliorés */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== ANIMATIONS ===== */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* ===== STYLES GLOBAUX ===== */
        .cat-card:hover .card-arrow { transform: translateX(8px); }
        .cart-btn:hover, .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(200,65,10,0.3); }
        .deco-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .nav-link:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
        .mobile-menu { animation: slideDown 0.3s ease-out; }
        
        /* ===== BURGER ICON ===== */
        .burger-icon {
          width: 24px;
          height: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .burger-icon span {
          display: block;
          width: 100%;
          height: 2px;
          background-color: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .mobile-menu-btn:hover .burger-icon span:first-child { transform: translateY(-2px); }
        .mobile-menu-btn:hover .burger-icon span:last-child { transform: translateY(2px); }
        
        /* ===== RESPONSIVE TABLETTE ===== */
        @media (max-width: 992px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          .section { padding: 50px 5% !important; }
          .section-titre { font-size: 1.8rem !important; }
        }
        
        /* ===== RESPONSIVE MOBILE ===== */
        @media (max-width: 768px) {
          /* Menu */
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { 
            display: flex !important; 
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 8px;
          }
          
          /* Navbar */
          .nav { padding: 0 16px !important; height: 65px !important; }
          .logo-image { height: 30px !important; }
          .logo-text { font-size: 1.1rem !important; }
          
          /* Hero */
          .hero-wrapper { min-height: 55vh !important; }
          .hero-badge { font-size: 1rem !important; margin-bottom: 8px !important; }
          .hero-titre { font-size: 1.3rem !important; }
          .hero-sub { font-size: 0.8rem !important; margin-bottom: 0 !important; }
          
          /* Section */
          .section { padding: 30px 16px !important; }
          .section-titre { font-size: 1.3rem !important; }
          .section-sub { font-size: 0.8rem !important; }
          .section-header { margin-bottom: 30px !important; }
          
          /* Catégories */
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .card-image-wrapper { height: 130px !important; }
          .card-label { font-size: 0.8rem !important; }
          .card-desc { font-size: 0.6rem !important; }
          .card-arrow { font-size: 0.65rem !important; }
          .card-info { padding: 10px !important; }
          .icon-badge { width: 28px !important; height: 28px !important; }
          .icon-badge svg { width: 12px !important; height: 12px !important; }
          
          /* Bouton panier */
          .cart-btn span { display: none; }
          .cart-btn { padding: 6px 10px !important; }
          .cart-btn svg { width: 16px !important; height: 16px !important; }
          .cart-badge { width: 16px !important; height: 16px !important; font-size: 0.6rem !important; }
          
          /* Progression */
          .progress-bar-container { display: none !important; }
        }
        
        /* ===== TRÈS PETIT MOBILE ===== */
        @media (max-width: 480px) {
          .cat-grid { grid-template-columns: 1fr !important; }
          .card-image-wrapper { height: 160px !important; }
          .hero-wrapper { min-height: 45vh !important; }
          .hero-titre { font-size: 1.1rem !important; }
          .hero-badge { font-size: 0.8rem !important; }
          .hero-sub { font-size: 0.7rem !important; }
        }
        
        /* ===== SCROLLBAR ===== */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F1F1F1; }
        ::-webkit-scrollbar-thumb { background: #C8410A; border-radius: 10px; }
        ::selection { background: #C8410A; color: #fff; }
      ` }} />
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: '100vh',
    background: '#F8F9FA',
  },
  
  // Navigation
  nav: {
    background: '#112219',
    padding: '0 8%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '80px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  logoImage: {
    height: '40px',
    width: 'auto',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  desktopMenu: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
  },
  burgerIcon: {
    width: '24px',
    height: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mobileMenu: {
    position: 'absolute',
    top: '80px',
    left: 0,
    right: 0,
    background: '#112219',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 99,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  mobileMenuItem: {
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '500',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileBadge: {
    background: '#C8410A',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '0.7rem',
  },
  mobileDecoBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'rgba(231, 76, 60, 0.2)',
    border: 'none',
    color: '#E74C3C',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  navLink: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    padding: '10px 18px',
    borderRadius: '12px',
  },
  cartBtn: {
    background: '#C8410A',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '40px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  cartBadge: {
    background: '#fff',
    color: '#C8410A',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800',
  },
  decoBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  // Hero Wrapper
  heroWrapper: {
    position: 'relative',
    minHeight: '70vh',
    overflow: 'hidden',
  },
  
  // Image Container
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Hero Image
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    willChange: 'transform, opacity',
  },
  
  // Overlay
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heroContent: {
    maxWidth: '900px',
    padding: '0 20px',
    textAlign: 'center',
    animation: 'fadeInUp 0.8s ease-out',
  },
  heroBadge: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#F4A76A',
    marginBottom: '20px',
    opacity: 0.9,
  },
  heroTitre: {
    fontSize: 'clamp(1.2rem, 5vw, 3.8rem)',
    fontWeight: '800',
    marginBottom: '16px',
    lineHeight: 1.2,
    color: '#fff',
    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
  },
  userName: {
    color: '#F4A76A',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #F4A76A, #C8410A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandName: {
    background: 'linear-gradient(135deg, #F4A76A, #C8410A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
    animation: 'pulse 2s ease-in-out infinite',
  },
  heroSub: {
    fontSize: 'clamp(0.8rem, 3vw, 1.15rem)',
    fontWeight: '400',
    color: 'rgba(255,255,255,0.95)',
    textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
  },
  
  // Barre de progression
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'rgba(255,255,255,0.2)',
    zIndex: 20,
  },
  progressBar: {
    height: '100%',
    width: '0%',
    background: 'linear-gradient(90deg, #F4A76A, #C8410A)',
    borderRadius: '3px',
  },
  
  // Section
  section: {
    padding: '80px 8%',
    position: 'relative',
    zIndex: 5,
    background: '#F8F9FA',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 'clamp(30px, 5vw, 60px)',
  },
  sectionTitre: {
    fontSize: 'clamp(1.3rem, 4vw, 2.2rem)',
    fontWeight: '900',
    color: '#112219',
    marginBottom: '16px',
  },
  divider: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #C8410A, #F4A76A)',
    margin: '0 auto 16px',
    borderRadius: '10px',
  },
  sectionSub: {
    color: '#666',
    fontSize: 'clamp(0.8rem, 3vw, 1rem)',
  },
  
  // Catégories Grid
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '30px',
  },
  catCard: {
    background: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#1A1A1A',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    display: 'block',
  },
  cardImageWrapper: {
    height: '200px',
    width: '100%',
    overflow: 'hidden',
    background: '#f5f5f5',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  iconBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    width: '38px',
    height: '38px',
    background: '#112219',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: '20px',
  },
  cardLabel: {
    fontWeight: '800',
    fontSize: '1.1rem',
    margin: '0 0 6px',
    color: '#112219',
  },
  cardDesc: {
    color: '#777',
    fontSize: '0.85rem',
    margin: '0 0 12px',
  },
  cardArrow: {
    fontWeight: '700',
    fontSize: '0.8rem',
    color: '#C8410A',
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  },
};

// Animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
  
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .cat-card:hover .card-arrow {
    transform: translateX(8px);
  }
  
  .cart-btn:hover, .hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(200, 65, 10, 0.3);
  }
  
  .deco-btn:hover {
    background: rgba(255,255,255,0.15);
    transform: translateY(-2px);
  }
  
  .nav-link:hover {
    background: rgba(255,255,255,0.08);
    transform: translateY(-2px);
  }
  
  .mobile-menu {
    animation: slideDown 0.3s ease-out;
  }
  
  .burger-icon span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .burger-icon span {
      background-color: #fff;
    }
  }
  
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #F1F1F1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #C8410A;
    border-radius: 10px;
  }
  
  ::selection {
    background: #C8410A;
    color: #fff;
  }
`;
document.head.appendChild(styleSheet);