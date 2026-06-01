import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';
import ClientNav from '../../components/ClientNav';
import { useCategories } from '../../hooks/useCategories';

const venteFlashActive = (produit) =>
  produit?.venteFlash?.actif &&
  produit.venteFlash?.prixFlash &&
  produit.venteFlash?.dateFin &&
  new Date(produit.venteFlash.dateFin) > new Date();

const tempsRestant = (dateFin) => {
  const diff = new Date(dateFin) - new Date();
  if (diff <= 0) return 'Terminée';
  const heures = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${heures}h ${minutes}min`;
};

// Composant d'affichage des étoiles (sans texte X/5)
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div style={styles.starRating}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} style={styles.starFull}>★</span>
      ))}
      {hasHalfStar && (
        <span style={styles.starHalf}>½</span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} style={styles.starEmpty}>★</span>
      ))}
    </div>
  );
};

export default function Catalogue() {
  const { ajouterAuPanier } = useCart();
  const location = useLocation();
  const { categories: categoriesDispo } = useCategories();

  const CATEGORIES = [
    { id: '', label: 'Tous les produits' },
    ...categoriesDispo.map(c => ({ id: c.nom, label: c.nom }))
  ];

  const [produits, setProduits] = useState([]);
  const [categorie, setCategorie] = useState('');
  const [recherche, setRecherche] = useState('');
  const [minPrix, setMinPrix] = useState('');
  const [maxPrix, setMaxPrix] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
      if (window.innerWidth > 768) setMobileFiltersOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catDepuisUrl = params.get('categorie');
    setCategorie(catDepuisUrl || '');
  }, [location.search]);

  const charger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categorie) params.append('categorie', categorie);
      if (recherche) params.append('recherche', recherche);
      if (minPrix) params.append('minPrix', minPrix);
      if (maxPrix) params.append('maxPrix', maxPrix);
      params.append('limite', '100');
      const { data } = await api.get(`/produits?${params}`);
      let produitsData = data.produits;
      if (sortBy === 'price_asc') produitsData = [...produitsData].sort((a, b) => a.prix - b.prix);
      else if (sortBy === 'price_desc') produitsData = [...produitsData].sort((a, b) => b.prix - a.prix);
      else produitsData = [...produitsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProduits(produitsData);
    } catch (err) {
      toast.error('Erreur lors du chargement des produits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, [categorie, recherche, minPrix, maxPrix, sortBy]);

  const resetFilters = () => {
    setMinPrix(''); setMaxPrix(''); setRecherche(''); setCategorie(''); setSortBy('recent');
    setMobileFiltersOpen(false);
  };

  const hasActiveFilters = !!(categorie || minPrix || maxPrix || recherche);

  return (
    <div style={styles.container}>
      <ClientNav
        searchSlot={(
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <input
                type="text"
                placeholder={isSmallMobile ? 'Rechercher...' : 'Rechercher un produit...'}
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                style={styles.searchInput}
              />
              <button style={styles.searchBtn}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>
        )}
      />

      {isMobile && (
        <div style={styles.mobileFilterBar}>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            style={{ ...styles.mobileFilterBtn, ...(hasActiveFilters ? styles.mobileFilterBtnActive : {}) }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            <span>Filtres</span>
            {hasActiveFilters && <span style={styles.filterDot}></span>}
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} style={styles.mobileResetBtn}>Réinit.</button>
          )}
        </div>
      )}

      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <aside style={{
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

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Catégories</h3>
            <div style={styles.categoryList}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCategorie(c.id); if (isMobile) setMobileFiltersOpen(false); }}
                  style={{ ...styles.categoryBtn, ...(categorie === c.id ? styles.categoryBtnActive : {}) }}
                >
                  <span>{c.label}</span>
                  {categorie === c.id && <span style={styles.checkIcon}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Prix</h3>
            <div style={styles.priceRange}>
              <div style={styles.priceInputGroup}>
                <span style={styles.priceLabel}>Min</span>
                <input type="number" min="0" placeholder="0" value={minPrix} onChange={e => setMinPrix(e.target.value)} style={styles.sidebarPriceInput} />
              </div>
              <span style={styles.priceDash}>—</span>
              <div style={styles.priceInputGroup}>
                <span style={styles.priceLabel}>Max</span>
                <input type="number" min="0" placeholder="Illimité" value={maxPrix} onChange={e => setMaxPrix(e.target.value)} style={styles.sidebarPriceInput} />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} style={styles.resetSidebarBtn}>Réinitialiser les filtres</button>
          )}
        </aside>

        {isMobile && mobileFiltersOpen && (
          <div style={styles.overlay} onClick={() => setMobileFiltersOpen(false)}></div>
        )}

        {/* Contenu principal */}
        <main style={styles.content}>
          <div style={styles.resultsHeader}>
            <div style={styles.resultsCount}>
              <span>{produits.length} résultat{produits.length > 1 ? 's' : ''}</span>
            </div>
            <div style={styles.sortSection}>
              <span style={styles.sortLabel}>Trier :</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.sortSelect}>
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
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
              <button onClick={resetFilters} style={styles.emptyBtn}>Voir tous les produits</button>
            </div>
          )}

          {!loading && produits.length > 0 && (
            <div className="catalogue-grid" style={styles.grid}>
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
                      {p.badge && (p.badge !== 'Vente flash' || venteFlashActive(p)) && <span style={styles.badge}>{p.badge}</span>}
                      {venteFlashActive(p) && (
                        <span style={styles.flashBadge}>⚡ {tempsRestant(p.venteFlash.dateFin)}</span>
                      )}
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={mediaUrl(p.images[0])}
                          alt={p.nom}
                          loading="lazy"
                          style={{
                            ...styles.productImg,
                            transform: hoveredProduct === p._id ? 'scale(1.08)' : 'scale(1)',
                          }}
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={styles.noImage}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Aucune image</span>
                        </div>
                      )}
                    </div>
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>{p.nom}</h3>
                      <div style={styles.cardPrice}>
                        <span style={styles.priceAmount}>
                          {Number(venteFlashActive(p) ? p.venteFlash.prixFlash : p.prix).toLocaleString('fr-FR')}
                        </span>
                        <span style={styles.priceCurrency}>FCFA</span>
                        {venteFlashActive(p) && (
                          <span style={styles.oldPrice}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</span>
                        )}
                      </div>
                      {p.nombreAvis > 0 && p.noteMoyenne > 0 ? (
                        <StarRating rating={p.noteMoyenne} />
                      ) : p.nombreAvis === 0 ? (
                        <div style={styles.noRating}>⭐ Aucun avis</div>
                      ) : null}
                      {!isSmallMobile && (
                        <p style={styles.cardDesc}>{p.description?.substring(0, 60)}...</p>
                      )}
                      <p style={styles.stockInfo}>
                        {p.stock > 0
                          ? <span style={styles.inStock}>✓ En stock</span>
                          : <span style={styles.outStock}>Rupture</span>
                        }
                      </p>
                    </div>
                  </Link>
                  <button
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .product-card { transition: all 0.3s ease; }
        .product-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .product-card:hover .add-btn { background: #C8410A !important; }
        @media (min-width: 769px) { .mobile-filter-bar { display: none !important; } }
        @media (max-width: 992px) and (min-width: 769px) {
          .catalogue-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px !important; }
        }
        @media (max-width: 768px) {
          .catalogue-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        }
        @media (max-width: 480px) {
          .catalogue-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
        }
        @media (max-width: 360px) {
          .catalogue-grid { grid-template-columns: 1fr !important; }
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
  searchContainer: { flex: 1, maxWidth: '500px' },
  searchWrapper: { display: 'flex' },
  searchInput: {
    flex: 1, padding: '10px 14px', border: 'none',
    borderRadius: '8px 0 0 8px', outline: 'none', fontSize: '0.9rem', background: '#fff',
  },
  searchBtn: {
    background: '#F4A76A', border: 'none', borderRadius: '0 8px 8px 0',
    padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff',
  },
  mobileFilterBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px', background: '#fff', borderBottom: '1px solid #E8E8E8',
    marginBottom: '10px', gap: '10px',
  },
  mobileFilterBtn: {
    flex: 1, background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff',
    border: 'none', padding: '8px 14px', borderRadius: '25px', fontSize: '0.8rem',
    fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', position: 'relative',
  },
  mobileFilterBtnActive: { background: 'linear-gradient(135deg, #C8410A, #A03208)' },
  filterDot: {
    width: '8px', height: '8px', background: '#2ECC71',
    borderRadius: '50%', display: 'inline-block',
  },
  mobileResetBtn: {
    background: '#F5F5F5', color: '#C8410A', border: '1px solid #E8E8E8',
    padding: '8px 14px', borderRadius: '25px', fontSize: '0.75rem',
    fontWeight: '600', cursor: 'pointer',
  },
  mainLayout: {
    display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '24px', gap: '24px',
  },
  sidebar: {
    width: '280px', background: 'var(--em-surface)', borderRadius: '8px',
    padding: '20px 0', height: 'fit-content', top: '100px',
    boxShadow: 'var(--em-shadow-sm)', border: '1px solid var(--em-border)',
    zIndex: 1000, overflowY: 'auto',
  },
  sidebarHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 20px 16px 20px', borderBottom: '1px solid #E8E8E8', marginBottom: '16px',
  },
  sidebarHeaderTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#112219', margin: 0 },
  closeSidebarBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' },
  sidebarSection: { padding: '0 20px 20px 20px', borderBottom: '1px solid #E8E8E8', marginBottom: '20px' },
  sidebarTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#112219', marginBottom: '15px' },
  categoryList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  categoryBtn: {
    width: '100%', padding: '10px 12px', background: 'transparent', border: 'none',
    fontSize: '0.85rem', fontWeight: '500', color: '#444', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.2s ease', textAlign: 'left', borderRadius: '8px',
  },
  categoryBtnActive: { color: '#C8410A', fontWeight: '600', background: 'rgba(200, 65, 10, 0.08)' },
  checkIcon: { color: '#C8410A', fontWeight: 'bold', fontSize: '0.8rem' },
  priceRange: { display: 'flex', alignItems: 'center', gap: '10px' },
  priceInputGroup: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '5px',
    background: '#F8F9FA', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E8E8E8',
  },
  priceLabel: { fontSize: '0.7rem', color: '#666', fontWeight: '500' },
  sidebarPriceInput: { width: '70px', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem' },
  priceDash: { color: '#999', fontSize: '0.9rem' },
  resetSidebarBtn: {
    width: 'calc(100% - 40px)', margin: '0 20px', padding: '10px', background: '#F0F0F0',
    border: 'none', borderRadius: '10px', color: '#C8410A', fontSize: '0.8rem',
    fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 },
  content: { flex: 1 },
  resultsHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', padding: '10px 0', flexWrap: 'wrap', gap: '10px',
  },
  resultsCount: {
    fontSize: '0.85rem', color: '#666', background: '#fff',
    padding: '6px 16px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', fontWeight: '500',
  },
  sortSection: { display: 'flex', alignItems: 'center', gap: '8px' },
  sortLabel: { fontSize: '0.8rem', color: '#666' },
  sortSelect: {
    padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd',
    background: '#fff', fontSize: '0.8rem', cursor: 'pointer', outline: 'none',
  },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  skeletonCard: { background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8E8E8' },
  skeletonImage: {
    height: '240px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
  skeletonInfo: { padding: '16px' },
  skeletonLine: { height: '14px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '12px', width: '80%' },
  skeletonLineShort: { height: '12px', background: '#f0f0f0', borderRadius: '6px', marginBottom: '10px', width: '60%' },
  skeletonPrice: { height: '18px', background: '#f0f0f0', borderRadius: '6px', width: '40%' },
  emptyState: { textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #E8E8E8' },
  emptyIcon: { fontSize: '4rem', marginBottom: '20px' },
  emptyTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '10px' },
  emptyText: { color: '#999', marginBottom: '25px' },
  emptyBtn: {
    padding: '10px 28px', borderRadius: '40px', border: 'none',
    background: '#C8410A', color: '#fff', fontWeight: '600', cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'var(--em-surface)', borderRadius: '12px', overflow: 'hidden',
    border: '1px solid var(--em-border)', display: 'flex', flexDirection: 'column',
    boxShadow: 'var(--em-shadow-sm)',
  },
  cardLink: { textDecoration: 'none', flex: 1 },
  cardImageWrapper: {
    position: 'relative',
    height: '260px',
    overflow: 'hidden',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.4s ease',
    display: 'block',
    padding: '12px',
  },
  noImage: {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '8px',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)', color: '#bbb', fontSize: '0.75rem',
  },
  badge: {
    position: 'absolute', top: '12px', left: '12px', background: '#C8410A',
    color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', zIndex: 2,
  },
  flashBadge: {
    position: 'absolute', top: '12px', right: '12px', background: '#112219',
    color: '#F4A76A', fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', zIndex: 2,
  },
  cardContent: { padding: '14px 16px' },
  cardTitle: {
    fontSize: '0.9rem', fontWeight: '600', color: '#112219', marginBottom: '8px',
    lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardPrice: { marginBottom: '6px', display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' },
  priceAmount: { fontSize: '1.1rem', fontWeight: '700', color: '#C8410A' },
  priceCurrency: { fontSize: '0.65rem', fontWeight: '500', color: '#C8410A' },
  oldPrice: { color: '#999', textDecoration: 'line-through', fontSize: '0.68rem' },
  rating: { color: '#B45309', fontSize: '0.72rem', fontWeight: '700', marginBottom: '6px' },
  starRating: { display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' },
  starFull: { color: '#FFC107', fontSize: '0.7rem' },
  starHalf: { color: '#FFC107', fontSize: '0.65rem' },
  starEmpty: { color: '#E0E0E0', fontSize: '0.7rem' },
  noRating: { color: '#999', fontSize: '0.65rem', marginBottom: '6px' },
  cardDesc: {
    fontSize: '0.7rem', color: '#888', marginBottom: '6px', lineHeight: 1.3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  stockInfo: { fontSize: '0.7rem', marginTop: '4px' },
  inStock: { color: '#2ECC71', fontWeight: '600' },
  outStock: { color: '#E74C3C', fontWeight: '600' },
  addBtn: {
    margin: '0 12px 12px 12px', padding: '10px', background: '#E74C3C',
    border: 'none', borderRadius: '40px', fontSize: '0.8rem', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.3s ease', color: '#fff',
  },
};