// // src/pages/client/Accueil.jsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useCart } from '../../context/CartContext';

// export default function Accueil() {
//   const { user, deconnexion } = useAuth();
//   const { nombreArticles } = useCart();
//   return (
//     <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#F5F0E8' }}>
//       <nav style={styles.nav}>
//         <span style={styles.logo}>Electro<span style={{color:'#F4A76A'}}>Maison</span></span>
//         <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
//           <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>
//           <Link to="/mes-commandes" style={styles.navLink}>Mes commandes</Link>
//           <Link to="/profil" style={styles.navLink}>Profil</Link>
//           <Link to="/panier" style={styles.cartBtn}>
//             🛒 {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
//           </Link>
//           <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
//         </div>
//       </nav>

//       {/* Hero */}
//       <section style={styles.hero}>
//         <div>
//           <h1 style={styles.heroTitre}>Bienvenue, <span style={{color:'#F4A76A'}}>{user?.prenom}</span> 👋</h1>
//           <p style={styles.heroSub}>Découvrez notre sélection d'appareils électroménagers au meilleur prix.</p>
//           <Link to="/catalogue" style={styles.heroCta}>Voir le catalogue →</Link>
//         </div>
//       </section>

//       {/* Catégories rapides */}
//       <section style={{padding:'60px 40px'}}>
//         <h2 style={styles.sectionTitre}>Parcourir par catégorie</h2>
//         <div style={styles.catGrid}>
//           {[['🍳','Cuisine','cuisine'],['🧊','Réfrigération','froid'],['🫧','Lavage','lavage'],['❄️','Climatisation','climatisation'],['⚡','Petit Élec.','petit_electromenager']].map(([ic,lb,id]) => (
//             <Link key={id} to={`/catalogue?categorie=${id}`} style={styles.catCard}>
//               <div style={{fontSize:'2.5rem', marginBottom:'10px'}}>{ic}</div>
//               <div style={{fontWeight:'600', fontSize:'0.9rem'}}>{lb}</div>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
// const styles = {
//   nav:         { background:'#1A3A2A', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', position:'sticky', top:0, zIndex:100 },
//   logo:        { fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#fff' },
//   navLink:     { color:'rgba(255,255,255,0.75)', textDecoration:'none', fontSize:'0.9rem', fontWeight:'500' },
//   cartBtn:     { background:'#C8410A', color:'#fff', padding:'10px 18px', borderRadius:'50px', textDecoration:'none', fontSize:'0.88rem', fontWeight:'700', display:'flex', alignItems:'center', gap:'6px' },
//   cartBadge:   { background:'#fff', color:'#C8410A', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'700' },
//   decoBtn:     { background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'50px', cursor:'pointer', fontSize:'0.82rem' },
//   hero:        { background:'#1A3A2A', color:'#fff', padding:'80px 40px' },
//   heroTitre:   { fontFamily:'Georgia,serif', fontSize:'2.8rem', marginBottom:'16px', lineHeight:'1.2' },
//   heroSub:     { fontSize:'1.05rem', color:'rgba(255,255,255,0.7)', marginBottom:'28px', maxWidth:'500px' },
//   heroCta:     { background:'#C8410A', color:'#fff', padding:'14px 32px', borderRadius:'50px', textDecoration:'none', fontWeight:'700', fontSize:'1rem' },
//   sectionTitre:{ fontSize:'1.6rem', fontWeight:'700', marginBottom:'24px', color:'#1C1C1C' },
//   catGrid:     { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'16px' },
//   catCard:     { background:'#fff', borderRadius:'16px', padding:'28px 16px', textAlign:'center', textDecoration:'none', color:'#1C1C1C', border:'1.5px solid #E2DAD0', transition:'transform 0.2s' },
// };
// import React from 'react';

// import { Link } from 'react-router-dom';

// import { useAuth } from '../../context/AuthContext';

// import { useCart } from '../../context/CartContext';



// const IMAGES = {

//   // Image de showroom premium (Electroménager moderne encastré)

//   heroBanner: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop", 

  

//   cuisine: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",

//   froid: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",

//   lavage: "https://images.unsplash.com/photo-1626806819282-2c1dc61a0e91?q=80&w=600&auto=format&fit=crop",

//   climatisation: "https://images.unsplash.com/photo-1621905252509-b4545d7a6e14?q=80&w=600&auto=format&fit=crop",

//   petit_elec: "https://images.unsplash.com/photo-1570222165780-e85d41ed1584?q=80&w=600&auto=format&fit=crop"

// };



// export default function Accueil() {

//   const { user, deconnexion } = useAuth();

//   const { nombreArticles } = useCart();



//   return (

//     <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#F8F9FA', color: '#1A1A1A' }}>

      

//       {/* Navbar avec flou (Glassmorphism) */}

//       <nav style={styles.nav}>

//         <span style={styles.logo}>ELECTRO<span style={{ color: '#F4A76A' }}>MAISON</span></span>

//         <div style={styles.navLinks}>

//           <Link to="/catalogue" style={styles.navLink}>Catalogue</Link>

//           <Link to="/mes-commandes" style={styles.navLink}>Commandes</Link>

//           <Link to="/profil" style={styles.navLink}>Profil</Link>

//           <Link to="/panier" style={styles.cartBtn}>

//             🛒 Panier {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}

//           </Link>

//           <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>

//         </div>

//       </nav>



//       {/* Hero Section - Image Plein Écran & Dynamique */}

//       <header style={{ 

//         ...styles.hero, 

//         backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${IMAGES.heroBanner})` 

//       }}>

//         <div style={styles.heroContent}>

//           <h1 style={styles.heroTitre}>

//             Bienvenue chez vous, <span style={{ color: '#F4A76A' }}>{user?.prenom || 'Cher client'}</span>

//           </h1>

//           <p style={styles.heroSub}>

//             L'excellence technologique au cœur de votre foyer. 

//             Découvrez nos solutions TV, Gros Électroménager et Ameublement.

//           </p>

//           <div style={{marginTop: '30px'}}>

//              <Link to="/catalogue" style={styles.mainCta}>Explorer le Showroom</Link>

//           </div>

//         </div>

//       </header>



//       {/* Section Univers / Catégories */}

//       <section style={{ padding: '100px 8%' }}>

//         <div style={{ textAlign: 'center', marginBottom: '60px' }}>

//           <h2 style={styles.sectionTitre}>Nos Univers</h2>

//           <div style={styles.divider}></div>

//         </div>



//         <div style={styles.catGrid}>

//           {[

//             { lb: 'Cuisine', id: 'cuisine', img: IMAGES.cuisine, desc: 'Fours, plaques et cuisson' },

//             { lb: 'Réfrigération', id: 'froid', img: IMAGES.froid, desc: 'Réfrigérateurs haute performance' },

//             { lb: 'Lavage', id: 'lavage', img: IMAGES.lavage, desc: 'Lave-linges et entretien du linge' },

//             { lb: 'Climatisation', id: 'climatisation', img: IMAGES.climatisation, desc: 'Confort thermique et air pur' },

//             { lb: 'Petit Électro.', id: 'petit_electromenager', img: IMAGES.petit_elec, desc: 'Aspirateurs et robots' }

//           ].map((cat) => (

//             <Link 

//                 key={cat.id} 

//                 to={`/catalogue?categorie=${cat.id}`} 

//                 style={styles.catCard}

//                 onMouseEnter={(e) => {

//                     e.currentTarget.style.transform = 'translateY(-10px)';

//                     e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';

//                 }}

//                 onMouseLeave={(e) => {

//                     e.currentTarget.style.transform = 'translateY(0)';

//                     e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';

//                 }}

//             >

//               <div style={styles.cardImageWrapper}>

//                 <img src={cat.img} alt={cat.lb} style={styles.cardImage} />

//               </div>

//               <div style={styles.cardInfo}>

//                 <h3 style={styles.cardLabel}>{cat.lb}</h3>

//                 <p style={styles.cardDesc}>{cat.desc}</p>

//                 <span style={styles.cardArrow}>Découvrir l'univers →</span>

//               </div>

//             </Link>

//           ))}

//         </div>

//       </section>

//     </div>

//   );

// }



// const styles = {

//   nav: { 

//     background: 'rgba(17, 34, 25, 0.95)', 

//     backdropFilter: 'blur(10px)',

//     padding: '0 8%', 

//     display: 'flex', alignItems: 'center', 

//     justifyContent: 'space-between', height: '80px', position: 'sticky', top: 0, zIndex: 100,

//     borderBottom: '1px solid rgba(255,255,255,0.1)'

//   },

//   logo: { fontSize: '1.6rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' },

//   navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },

//   navLink: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500', transition: '0.3s' },

//   cartBtn: { 

//     background: '#C8410A', color: '#fff', padding: '12px 20px', borderRadius: '8px', 

//     textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px',

//     transition: '0.3s'

//   },

//   cartBadge: { background: '#fff', color: '#C8410A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' },

//   decoBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' },



//   hero: { 

//     height: '85vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',

//     display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff' 

//   },

//   heroContent: { maxWidth: '900px', padding: '0 20px' },

//   heroTitre: { fontSize: '4.5rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' },

//   heroSub: { fontSize: '1.4rem', fontWeight: '300', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto' },

//   mainCta: { 

//     display: 'inline-block', background: '#F4A76A', color: '#112219', padding: '18px 40px', borderRadius: '50px', 

//     textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', transition: '0.3s transform' 

//   },



//   sectionTitre: { fontSize: '2.8rem', fontWeight: '900', color: '#112219', letterSpacing: '-1px' },

//   divider: { width: '80px', height: '5px', background: '#F4A76A', margin: '20px auto', borderRadius: '10px' },

//   catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' },

//   catCard: { 

//     background: '#fff', borderRadius: '24px', overflow: 'hidden', textDecoration: 'none', 

//     color: '#1A1A1A', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 

//   },

//   cardImageWrapper: { height: '280px', width: '100%', overflow: 'hidden' },

//   cardImage: { width: '100%', height: '100%', objectFit: 'cover' },

//   cardInfo: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '10px' },

//   cardLabel: { fontWeight: '800', fontSize: '1.4rem', margin: 0, color: '#112219' },

//   cardDesc: { color: '#777', fontSize: '1rem', margin: 0, lineHeight: '1.5' },

//   cardArrow: { color: '#C8410A', fontWeight: '700', fontSize: '0.9rem', marginTop: '15px' }

// };
// src/pages/client/Accueil.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
// On importe chaque image et on lui donne un nom (ex: imgCuisine)
import imgCuisine from '../../assets/images/cuisine.jpg';
import imgFroid from '../../assets/images/frigo.jpg';
import imgLavage from '../../assets/images/lavage.jpg';
import imgClim from '../../assets/images/clim.jpg';
import imgTech from '../../assets/images/hightech.jpg';
import imgHero from '../../assets/images/elect.jpg';
const IMAGES = {
  // Hero: Cuisine de luxe moderne
  heroBanner: imgHero,
  
  // Cuisine: Four encastré et plaque à induction
  cuisine: imgCuisine,
  
  // Réfrigération: Réfrigérateur américain Side-by-Side
  froid: imgFroid,
  
  // Lavage: Machine à laver frontale moderne
  lavage: imgLavage,
  
  // Climatisation: Unité de climatisation murale split
  climatisation: imgClim,
  
  // High-Tech & Petit Électro: Smart TV OLED et multimédia
  highTech: imgTech
};

export default function Accueil() {
  const { user, deconnexion } = useAuth();
  const { nombreArticles } = useCart();
  const [hoveredLink, setHoveredLink] = useState(null);

  const getNavLinkStyle = (id) => ({
    ...styles.navLink,
    color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.8)',
    transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
    background: hoveredLink === id ? 'rgba(255,255,255,0.05)' : 'transparent',
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#F8F9FA' }}>
      
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>ELECTRO<span style={{ color: '#F4A76A' }}>MAISON</span></span>
        <div style={styles.navLinks}>
          {[
            { name: 'Catalogue', path: '/catalogue', id: 'cat' },
            { name: 'Commandes', path: '/mes-commandes', id: 'cmd' },
            { name: 'Profil', path: '/profil', id: 'prof' }
          ].map((link) => (
            <Link 
              key={link.id}
              to={link.path} 
              style={getNavLinkStyle(link.id)}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/panier" style={styles.cartBtn}>
            🛒 Panier {nombreArticles > 0 && <span style={styles.cartBadge}>{nombreArticles}</span>}
          </Link>
          <button onClick={deconnexion} style={styles.decoBtn}>Déconnexion</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ 
        ...styles.hero, 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${IMAGES.heroBanner})` 
      }}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitre}>
            Bienvenue chez vous, <span style={{ color: '#F4A76A' }}>{user?.prenom || 'Cher client'}</span>
          </h1>
          <p style={styles.heroSub}>
            L'excellence technologique au cœur de votre foyer. 
            Découvrez notre sélection de pointe pour un confort inégalé.
          </p>
        </div>
      </header>

      {/* Section Domaines d'Expertise */}
      <section style={{ padding: '80px 8%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={styles.sectionTitre}>Explorez nos Domaines d'Expertise</h2>
          <p style={{ color: '#777', fontSize: '1.1rem', marginTop: '10px' }}>
            Des équipements performants sélectionnés par nos experts
          </p>
          <div style={styles.divider}></div>
        </div>

        <div style={styles.catGrid}>
          {[
            { lb: 'Cuisine', id: 'cuisine', img: IMAGES.cuisine, desc: 'Plaques à induction et fours encastrés' },
            { lb: 'Réfrigération', id: 'froid', img: IMAGES.froid, desc: 'Réfrigérateurs et congélateurs haute capacité' },
            { lb: 'Lavage', id: 'lavage', img: IMAGES.lavage, desc: 'Lave-linges et sèche-linges intelligents' },
            { lb: 'Climatisation', id: 'climatisation', img: IMAGES.climatisation, desc: 'Climatiseurs split et solutions d\'air' },
            { lb: 'Multimédia & High-Tech', id: 'hightech', img: IMAGES.highTech, desc: 'TV, Informatique et Protection électrique' }
          ].map((cat) => (
            <Link 
                key={cat.id} 
                to={`/catalogue?categorie=${cat.id}`} 
                style={styles.catCard}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                }}
            >
              <div style={styles.cardImageWrapper}>
                <img src={cat.img} alt={cat.lb} style={styles.cardImage} />
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
    </div>
  );
}

const styles = {
  nav: { 
    background: '#112219', padding: '0 8%', display: 'flex', alignItems: 'center', 
    justifyContent: 'space-between', height: '80px', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { fontSize: '1.6rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' },
  navLinks: { display: 'flex', gap: '15px', alignItems: 'center' },
  navLink: { 
    color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', 
    fontWeight: '600', transition: '0.3s ease', padding: '10px 15px'
  },
  cartBtn: { 
    background: '#C8410A', color: '#fff', padding: '12px 20px', borderRadius: '10px', 
    textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px'
  },
  cartBadge: { background: '#fff', color: '#C8410A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' },
  decoBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' },
  hero: { 
    height: '70vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff' 
  },
  heroContent: { maxWidth: '900px', padding: '0 20px' },
  heroTitre: { fontSize: '4.2rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' },
  heroSub: { fontSize: '1.4rem', fontWeight: '300', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto' },
  sectionTitre: { fontSize: '2.8rem', fontWeight: '900', color: '#112219' },
  divider: { width: '80px', height: '5px', background: '#F4A76A', margin: '20px auto', borderRadius: '10px' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' },
  catCard: { 
    background: '#fff', borderRadius: '28px', overflow: 'hidden', textDecoration: 'none', 
    color: '#1A1A1A', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'all 0.4s ease' 
  },
  cardImageWrapper: { height: '280px', width: '100%', overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardInfo: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardLabel: { fontWeight: '800', fontSize: '1.5rem', margin: 0, color: '#112219' },
  cardDesc: { color: '#666', fontSize: '1rem', margin: 0 },
  cardArrow: { color: '#C8410A', fontWeight: '700', fontSize: '0.9rem', marginTop: '10px' }
};