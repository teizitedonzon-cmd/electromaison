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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
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

  return (
    <div style={styles.container}>
      
      {/* Navigation avec menu burger */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>TEY<span style={{ color: '#F4A76A' }}>SHOP</span></Link>
        
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={styles.searchInput} 
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>
        </div>

        {/* Menu Desktop - SANS le bouton Catalogue */}
        <div className="desktop-menu" style={styles.desktopMenu}>
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

        {/* Bouton Menu Mobile */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} style={styles.mobileMenuBtn}>
          <Icon name={menuOpen ? "x" : "menu"} size={24} color="#fff" />
        </button>
      </nav>

      {/* Menu Mobile Déroulant - SANS le bouton Catalogue */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Accueil</Link>
          {user ? (
            <>
              <Link to="/mes-commandes" onClick={() => setMenuOpen(false)} style={styles.mobileMenuItem}>Commandes</Link>
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

      {/* Bouton Filtres Mobile (visible uniquement sur mobile) */}
      {isMobile && (
        <div style={styles.mobileFilterBar}>
          <button onClick={() => setMobileFiltersOpen(true)} style={styles.mobileFilterBtn}>
            🔍 Filtres
            {(categorie || minPrix || maxPrix) && <span style={styles.filterActiveDot}></span>}
          </button>
          <div style={styles.filterInfo}>
            {(categorie || minPrix || maxPrix) && <span style={styles.filterActiveText}>Filtres actifs</span>}
          </div>
        </div>
      )}

      {/* Layout : Sidebar + Contenu */}
      <div style={styles.mainLayout}>
        
        {/* Sidebar - Visible en desktop, overlay en mobile */}
        <aside style={{ 
          ...styles.sidebar,
          transform: isMobile ? (mobileFiltersOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          position: isMobile ? 'fixed' : 'sticky',
        }}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarHeaderTitle}>Filtres</h3>
            <button onClick={() => setMobileFiltersOpen(false)} style={styles.closeSidebarBtn}>✕</button>
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

          {(categorie || recherche || minPrix || maxPrix) && (
            <button onClick={resetFilters} style={styles.resetSidebarBtn}>
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        {/* Overlay pour mobile */}
        {isMobile && mobileFiltersOpen && <div style={styles.overlay} onClick={() => setMobileFiltersOpen(false)}></div>}

        {/* Contenu principal */}
        <main style={styles.content}>
          <div style={styles.resultsHeader}>
            <div style={styles.resultsCount}>
              <span>{produits.length} résultats</span>
            </div>
            <div style={styles.sortSection}>
              <span style={styles.sortLabel}>Trier :</span>
              <select 
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
              <p style={styles.emptyText}>Essayez d'autres mots-clés</p>
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

      {/* Styles responsives injectés */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .search-container {
            max-width: 160px !important;
          }
          .search-input {
            padding: 8px 10px !important;
            font-size: 0.7rem !important;
          }
          .search-btn {
            padding: 0 10px !important;
          }
          .main-layout {
            padding: 12px !important;
          }
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .card-image-wrapper {
            height: 130px !important;
          }
          .card-title {
            font-size: 0.7rem !important;
          }
          .price-amount {
            font-size: 0.85rem !important;
          }
          .add-btn {
            padding: 4px 6px !important;
            font-size: 0.6rem !important;
          }
          .results-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .cart-btn span {
            display: none;
          }
          .cart-btn {
            padding: 6px 8px !important;
          }
          .logo {
            font-size: 1.1rem !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-filter-bar {
            display: none !important;
          }
          .sidebar-header {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .card-image-wrapper {
            height: 110px !important;
          }
          .card-content {
            padding: 8px !important;
          }
          .search-container {
            max-width: 120px !important;
          }
          .hero-titre {
            font-size: 1rem !important;
          }
        }
      ` }} />
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
  desktopMenu: {
    display: 'flex',
    gap: '10px',
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
  mobileMenu: {
    position: 'absolute',
    top: '60px',
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
  mobileFilterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#fff',
    borderBottom: '1px solid #E8E8E8',
    marginBottom: '12px',
  },
  mobileFilterBtn: {
    background: '#C8410A',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
  },
  filterActiveDot: {
    width: '8px',
    height: '8px',
    background: '#2ECC71',
    borderRadius: '50%',
    position: 'absolute',
    top: '-2px',
    right: '-2px',
  },
  filterActiveText: {
    fontSize: '0.7rem',
    color: '#C8410A',
    fontWeight: '500',
  },
  filterInfo: {
    display: 'flex',
    alignItems: 'center',
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
    top: '80px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #E8E8E8',
    transition: 'transform 0.3s ease',
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
    fontSize: '1rem',
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
    marginBottom: '20px',
    padding: '10px 0',
    flexWrap: 'wrap',
    gap: '10px',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  skeletonCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  skeletonImage: {
    height: '180px',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
    height: '180px',
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
    fontSize: '0.85rem',
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
    margin: '0 12px 12px 12px',
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
  
  .mobile-menu {
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
    border-radius: 4px;
  }
  
  ::selection {
    background: #C8410A;
    color: #fff;
  }
`;
document.head.appendChild(styleSheet);