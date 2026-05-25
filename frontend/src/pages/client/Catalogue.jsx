import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import ClientNav from '../../components/ClientNav';

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

const venteFlashActive = (produit) =>
  produit?.venteFlash?.actif && produit.venteFlash?.prixFlash && produit.venteFlash?.dateFin && new Date(produit.venteFlash.dateFin) > new Date();

const tempsRestant = (dateFin) => {
  const diff = new Date(dateFin) - new Date();
  if (diff <= 0) return 'Terminee';
  const heures = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${heures}h ${minutes}min`;
};

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
      if (window.innerWidth > 768) {
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setMobileFiltersOpen(false);
  };

  const hasActiveFilters = !!(categorie || minPrix || maxPrix || recherche);

  return (
    <div style={styles.container}>
      
      <ClientNav
        searchSlot={(
          <div className="search-container" style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <input
                className="search-input"
                type="text"
                placeholder={isSmallMobile ? "Rechercher..." : (isMobile ? "Rechercher..." : "Rechercher un produit...")}
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                style={styles.searchInput}
              />
              <button className="search-btn" style={styles.searchBtn}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>
        )}
      />

      {/* Bouton Filtres Mobile - Ameliore et plus attrayant */}
      {isMobile && (
        <div className="mobile-filter-bar" style={styles.mobileFilterBar}>
          <button 
            onClick={() => setMobileFiltersOpen(true)} 
            className="filter-btn"
            style={{
              ...styles.mobileFilterBtn,
              ...(hasActiveFilters ? styles.mobileFilterBtnActive : {})
            }}
          >
            <span className="filter-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="10" y1="18" x2="14" y2="18"></line>
              </svg>
            </span>
            <span>Filtres</span>
            {hasActiveFilters && (
              <span className="filter-badge">
                <span className="filter-dot"></span>
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="reset-filter-btn" style={styles.mobileResetBtn}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Réinit.
            </button>
          )}
        </div>
      )}

      {/* Layout : Sidebar + Contenu */}
      <div className="main-layout" style={styles.mainLayout}>
        
        {/* Sidebar */}
        <aside className="sidebar" style={{ 
          ...styles.sidebar,
          display: isMobile ? (mobileFiltersOpen ? 'block' : 'none') : 'block',
          position: isMobile ? 'fixed' : 'sticky',
        }}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarHeaderTitle}>Filtres</h3>
            {isMobile && (
              <button onClick={() => setMobileFiltersOpen(false)} style={styles.closeSidebarBtn}>✕</button>
            )}
          </div>
          
          {/* Section Catégories */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Catégories</h3>
            <div style={styles.categoryList}>
              {CATEGORIES.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => { setCategorie(c.id); if(isMobile) setMobileFiltersOpen(false); }}
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

          {hasActiveFilters && (
            <button onClick={resetFilters} style={styles.resetSidebarBtn}>
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Overlay pour mobile */}
        {isMobile && mobileFiltersOpen && <div style={styles.overlay} onClick={() => setMobileFiltersOpen(false)}></div>}

        {/* Contenu principal */}
        <main style={styles.content}>
          <div className="results-header" style={styles.resultsHeader}>
            <div className="results-count" style={styles.resultsCount}>
              <span>{produits.length} résultat{produits.length > 1 ? 's' : ''}</span>
            </div>
            <div style={styles.sortSection}>
              <span style={styles.sortLabel}>Trier :</span>
              <select 
                className="sort-select"
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingGrid}>
              {[1,2,3,4,5,6].map(i => (
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
              <p style={styles.emptyText}>Essayez d'autres mots-clés ou ajustez vos filtres</p>
              <button className="empty-btn" onClick={resetFilters} style={styles.emptyBtn}>Voir tous les produits</button>
            </div>
          )}

          {!loading && produits.length > 0 && (
            <div className="grid" style={styles.grid}>
              {produits.map((p) => (
                <div 
                  key={p._id} 
                  style={styles.card}
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct(p._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link to={`/produit/${p._id}`} style={styles.cardLink}>
                    <div className="card-image-wrapper" style={styles.cardImageWrapper}>
                      {p.badge && <span style={styles.badge}>{p.badge}</span>}
                      {venteFlashActive(p) && <span style={styles.flashBadge}>Flash: {tempsRestant(p.venteFlash.dateFin)}</span>}
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
                      <h3 className="card-title" style={styles.cardTitle}>{p.nom}</h3>
                      <div style={styles.cardPrice}>
                        <span className="price-amount" style={styles.priceAmount}>
                          {Number(venteFlashActive(p) ? p.venteFlash.prixFlash : p.prix).toLocaleString('fr-FR')}
                        </span>
                        <span className="price-currency" style={styles.priceCurrency}>FCFA</span>
                        {venteFlashActive(p) && <span style={styles.oldPrice}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</span>}
                      </div>
                      {p.nombreAvis > 0 && <div style={styles.rating}>★ {p.noteMoyenne}/5 ({p.nombreAvis})</div>}
                      {!isSmallMobile && (
                        <p className="card-desc" style={styles.cardDesc}>{p.description?.substring(0, 60)}...</p>
                      )}
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
                    className="add-btn"
                    onClick={() => { ajouterAuPanier(p); toast.success(`${p.nom} ajouté au panier !`); }} 
                    style={{ ...styles.addBtn, opacity: p.stock === 0 ? 0.5 : 1 }} 
                    disabled={p.stock === 0}
                  >
                    {p.stock === 0 ? 'Rupture' : (isSmallMobile ? 'Ajouter' : 'Ajouter au panier')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Styles responsives améliorés */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== ANIMATIONS ===== */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        /* ===== BOUTON MENU MOBILE ===== */
        .mobile-menu-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        
        .mobile-menu-btn:hover {
          background: rgba(244, 167, 106, 0.3) !important;
          transform: scale(1.05);
        }
        
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(244, 167, 106, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(244, 167, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 167, 106, 0); }
        }
        
        .mobile-menu-btn {
          animation: pulse-ring 2s infinite;
        }
        
        /* ===== BOUTON FILTRE AMÉLIORÉ ===== */
        .filter-btn {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .filter-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 15px rgba(200, 65, 10, 0.4) !important;
        }
        
        .filter-btn:active {
          transform: translateY(0) scale(0.98) !important;
        }
        
        .filter-icon {
          transition: transform 0.3s ease;
          display: inline-flex;
        }
        
        .filter-btn:hover .filter-icon {
          transform: rotate(90deg);
        }
        
        .filter-badge {
          position: absolute;
          top: -4px;
          right: -4px;
        }
        
        .filter-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #2ECC71;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 0 2px #fff;
        }
        
        /* Animation d'attraction */
        @keyframes bounce-attention {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .filter-btn {
          animation: bounce-attention 2s ease-in-out infinite;
        }
        
        /* ===== PRODUITS ===== */
        .product-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        
        .product-card:hover .add-btn {
          background: #C8410A;
          transform: translateY(-2px);
        }
        
        /* ===== BOUTONS ===== */
        .search-btn:hover {
          background: #E8622A;
          transform: scale(1.02);
        }
        
        .cart-btn:hover, .add-btn:hover:not(:disabled), .empty-btn:hover {
          background: #C0392B;
          transform: translateY(-2px);
        }
        
        .category-btn:hover {
          transform: translateX(5px);
          color: #C8410A;
        }
        
        .reset-filter-btn:hover {
          background: #E74C3C !important;
          color: white !important;
          transform: translateY(-1px);
        }
        
        /* ===== MENU MOBILE ===== */
        .mobile-menu {
          animation: slideDown 0.3s ease-out;
        }
        
        .mobile-menu-item {
          transition: all 0.3s ease;
        }
        
        .mobile-menu-item:hover {
          transform: translateX(8px);
          background: rgba(244, 167, 106, 0.2) !important;
        }
        
        /* ===== RESPONSIVE DESKTOP ===== */
        @media (min-width: 769px) {
          .mobile-filter-bar {
            display: none !important;
          }
        }
        
        /* ===== RESPONSIVE TABLETTE ===== */
        @media (max-width: 992px) and (min-width: 769px) {
          .main-layout {
            padding: 16px !important;
            gap: 16px !important;
          }
          .sidebar {
            width: 240px !important;
          }
          .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 16px !important;
          }
          .search-container {
            max-width: 300px !important;
          }
        }
        
        /* ===== RESPONSIVE MOBILE ===== */
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
            background: rgba(244, 167, 106, 0.25);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 8px 10px;
            border: 1px solid rgba(244, 167, 106, 0.4);
          }
          .nav {
            padding: 0 12px !important;
            height: 60px !important;
            gap: 10px !important;
          }
          .logo {
            font-size: 1.1rem !important;
          }
          .search-container {
            max-width: 150px !important;
          }
          .search-input {
            padding: 6px 8px !important;
            font-size: 0.7rem !important;
          }
          .search-btn {
            padding: 0 10px !important;
          }
          .main-layout {
            padding: 10px !important;
            gap: 0 !important;
          }
          .sidebar {
            width: 85% !important;
            max-width: 300px !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            border-radius: 0 !important;
            z-index: 1001 !important;
            animation: slideInRight 0.3s ease-out !important;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .card-image-wrapper {
            height: 110px !important;
          }
          .card-title {
            font-size: 0.7rem !important;
          }
          .price-amount {
            font-size: 0.8rem !important;
          }
          .add-btn {
            padding: 6px 8px !important;
            font-size: 0.65rem !important;
          }
          .results-header {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 12px !important;
          }
          .results-count {
            font-size: 0.7rem !important;
            padding: 4px 10px !important;
          }
          .sort-label {
            font-size: 0.7rem !important;
          }
          .sort-select {
            font-size: 0.7rem !important;
            padding: 4px 8px !important;
          }
          .cart-btn span {
            display: none;
          }
          .cart-btn {
            padding: 6px 8px !important;
          }
          .cart-btn svg {
            width: 14px !important;
            height: 14px !important;
          }
          .cart-badge {
            width: 14px !important;
            height: 14px !important;
            font-size: 0.55rem !important;
          }
          .card-desc {
            display: none !important;
          }
          .card-content {
            padding: 8px !important;
          }
          .stock-info {
            font-size: 0.6rem !important;
          }
        }
        
        /* ===== TRÈS PETIT MOBILE (<= 480px) ===== */
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .card-image-wrapper {
            height: 95px !important;
          }
          .card-title {
            font-size: 0.6rem !important;
          }
          .price-amount {
            font-size: 0.7rem !important;
          }
          .search-container {
            max-width: 110px !important;
          }
          .search-input {
            font-size: 0.6rem !important;
            padding: 5px 6px !important;
          }
          .search-btn svg {
            width: 12px !important;
            height: 12px !important;
          }
          .mobile-filter-btn {
            padding: 6px 12px !important;
            font-size: 0.7rem !important;
          }
          .mobile-reset-btn {
            padding: 6px 10px !important;
            font-size: 0.65rem !important;
          }
          .results-count {
            font-size: 0.6rem !important;
            padding: 3px 8px !important;
          }
          .sort-select {
            font-size: 0.6rem !important;
            padding: 3px 6px !important;
          }
          .add-btn {
            padding: 5px 6px !important;
            font-size: 0.6rem !important;
          }
          .card-content {
            padding: 6px !important;
          }
          .stock-info {
            font-size: 0.55rem !important;
          }
          .price-currency {
            font-size: 0.55rem !important;
          }
          .logo {
            font-size: 1rem !important;
          }
        }
        
        /* ===== ÉCRANS TRÈS ÉTROITS (<= 360px) ===== */
        @media (max-width: 360px) {
          .grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .card-image-wrapper {
            height: 140px !important;
          }
          .search-container {
            max-width: 100px !important;
          }
          .mobile-filter-btn {
            padding: 5px 10px !important;
            font-size: 0.65rem !important;
          }
          .mobile-reset-btn {
            padding: 5px 8px !important;
            font-size: 0.6rem !important;
          }
        }
        
        /* ===== SCROLLBAR ===== */
        ::-webkit-scrollbar {
          width: 4px;
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
      ` }} />
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: '100vh',
    background: 'var(--em-page)',
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
    gap: '20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logoLink: {
    textDecoration: 'none',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '500px',
  },
  searchWrapper: {
    display: 'flex',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '12px 0 0 12px',
    outline: 'none',
    fontSize: '0.9rem',
    background: '#fff',
  },
  searchBtn: {
    background: '#F4A76A',
    border: 'none',
    borderRadius: '0 12px 12px 0',
    padding: '0 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: '#fff',
  },
  desktopMenu: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'rgba(244, 167, 106, 0.2)',
    border: '1px solid rgba(244, 167, 106, 0.3)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    padding: '10px 12px',
    transition: 'all 0.3s ease',
  },
  mobileMenu: {
    position: 'absolute',
    top: '80px',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #112219 0%, #1a3324 100%)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 99,
    borderBottom: '2px solid rgba(244, 167, 106, 0.3)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  mobileMenuItem: {
    color: '#fff',
    textDecoration: 'none',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  mobileMenuIcon: {
    fontSize: '1.2rem',
  },
  mobileBadge: {
    background: 'linear-gradient(135deg, #C8410A, #F4A76A)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    marginLeft: 'auto',
    fontWeight: 'bold',
  },
  mobileDecoBtn: {
    width: '100%',
    textAlign: 'left',
    background: 'rgba(231, 76, 60, 0.15)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    color: '#E74C3C',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
  },
  mobileFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#fff',
    borderBottom: '1px solid #E8E8E8',
    marginBottom: '10px',
    gap: '10px',
  },
  mobileFilterBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #C8410A, #E8622A)',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(200, 65, 10, 0.3)',
  },
  mobileFilterBtnActive: {
    background: 'linear-gradient(135deg, #C8410A, #A03208)',
    boxShadow: '0 0 0 2px rgba(200, 65, 10, 0.5)',
  },
  mobileResetBtn: {
    background: '#F5F5F5',
    color: '#C8410A',
    border: '1px solid #E8E8E8',
    padding: '8px 14px',
    borderRadius: '25px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
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
  
  // Main Layout
  mainLayout: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    gap: '24px',
  },
  
  // Sidebar
  sidebar: {
    width: '280px',
    background: 'var(--em-surface)',
    borderRadius: '8px',
    padding: '20px 0',
    height: 'fit-content',
    top: '100px',
    boxShadow: 'var(--em-shadow-sm)',
    border: '1px solid var(--em-border)',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    overflowY: 'auto',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px 16px 20px',
    borderBottom: '1px solid #E8E8E8',
    marginBottom: '16px',
  },
  sidebarHeaderTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#112219',
    margin: 0,
  },
  closeSidebarBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.2s ease',
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
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryBtn: {
    width: '100%',
    padding: '10px 12px',
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
    borderRadius: '8px',
  },
  categoryBtnActive: {
    color: '#C8410A',
    fontWeight: '600',
    background: 'rgba(200, 65, 10, 0.08)',
  },
  checkIcon: {
    color: '#C8410A',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
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
    borderRadius: '10px',
    border: '1px solid #E8E8E8',
    transition: 'all 0.2s ease',
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
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
    marginBottom: '24px',
    padding: '10px 0',
    flexWrap: 'wrap',
    gap: '10px',
  },
  resultsCount: {
    fontSize: '0.85rem',
    color: '#666',
    background: '#fff',
    padding: '6px 16px',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    fontWeight: '500',
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
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  
  // Loading
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
  },
  skeletonCard: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #E8E8E8',
  },
  skeletonImage: {
    height: '200px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skeletonInfo: {
    padding: '16px',
  },
  skeletonLine: {
    height: '14px',
    background: '#f0f0f0',
    borderRadius: '6px',
    marginBottom: '12px',
    width: '80%',
  },
  skeletonLineShort: {
    height: '12px',
    background: '#f0f0f0',
    borderRadius: '6px',
    marginBottom: '10px',
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
    padding: '80px 20px',
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #E8E8E8',
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
    borderRadius: '40px',
    border: 'none',
    background: '#C8410A',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  
  // Product Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'var(--em-surface)',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid var(--em-border)',
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
    background: 'linear-gradient(135deg, #fff7ef, #edf7f2)',
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
    top: '12px',
    left: '12px',
    background: '#C8410A',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  flashBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#112219',
    color: '#F4A76A',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  cardContent: {
    padding: '16px',
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
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
    flexWrap: 'wrap',
  },
  priceAmount: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#C8410A',
  },
  priceCurrency: {
    fontSize: '0.65rem',
    fontWeight: '500',
    color: '#C8410A',
    marginLeft: '2px',
  },
  oldPrice: {
    color: '#999',
    textDecoration: 'line-through',
    fontSize: '0.68rem',
  },
  rating: {
    color: '#B45309',
    fontSize: '0.72rem',
    fontWeight: '700',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '0.7rem',
    color: '#888',
    marginBottom: '8px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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
    margin: '0 16px 16px 16px',
    padding: '10px',
    background: '#112219',
    border: 'none',
    borderRadius: '40px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#fff',
  },
};

// Animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .mobile-menu {
    animation: slideDown 0.3s ease-out;
  }
  
  ::-webkit-scrollbar {
    width: 4px;
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
