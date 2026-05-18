import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

export default function AdminProduits() {
  const { user, deconnexion } = useAuth();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorie: '',
    marque: '',
    actif: true
  });
  const [images, setImages] = useState([]);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const categoriesList = ['Électronique', 'Vêtements', 'Alimentation', 'electromenager', 'Beauté', 'immobilier', 'Sport', 'Autre'];

  useEffect(() => {
    chargerProduits();
  }, []);

  const chargerProduits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/produits/admin/tous');
      const produitsData = data.produits || [];
      setProduits(produitsData);
      
      const catsMap = new Map();
      produitsData.forEach(p => {
        const cat = p.categorie || 'Non classé';
        if (!catsMap.has(cat)) {
          catsMap.set(cat, { nom: cat, totalStock: 0, produits: [] });
        }
        catsMap.get(cat).totalStock += p.stock || 0;
        catsMap.get(cat).produits.push(p);
      });
      setCategories(Array.from(catsMap.values()));
    } catch (err) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Array.from(images).forEach(img => data.append('images', img));

    try {
      if (selectedProduit) {
        await api.put(`/produits/${selectedProduit._id}`, data);
        toast.success('Produit modifié avec succès');
      } else {
        await api.post('/produits', data);
        toast.success('Produit créé avec succès');
      }
      setShowModal(false);
      setSelectedProduit(null);
      setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '', actif: true });
      setImages([]);
      chargerProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  const handleDelete = async (id, nomProduit) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${nomProduit}" ?`)) {
      try {
        await api.delete(`/produits/${id}`);
        toast.success('Produit supprimé avec succès');
        chargerProduits();
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (produit) => {
    setSelectedProduit(produit);
    setFormData({
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      stock: produit.stock,
      categorie: produit.categorie,
      marque: produit.marque || '',
      actif: produit.actif !== false
    });
    setImages([]);
    setShowModal(true);
  };

  const handleToggleActif = async (produit) => {
    try {
      await api.put(`/produits/${produit._id}`, { actif: !produit.actif });
      toast.success(`Produit ${!produit.actif ? 'activé' : 'désactivé'} avec succès`);
      chargerProduits();
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => deconnexion(), 500);
  };

  const getNavLinkStyle = (id) => ({
    ...styles.navLink,
    color: hoveredLink === id ? '#F4A76A' : 'rgba(255,255,255,0.85)',
    transform: hoveredLink === id ? 'translateY(-2px)' : 'translateY(0)',
    background: hoveredLink === id ? 'rgba(255,255,255,0.08)' : 'transparent',
  });

  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3l4 4-7 7H9v-4l7-7z" />
      <path d="M3 21l4-4" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  const produitsFiltres = produits.filter(p => {
    const matchSearch = p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.marque?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const produitsParCategorie = selectedCategorie 
    ? produits.filter(p => p.categorie === selectedCategorie.nom)
    : [];

  const totalStockGeneral = categories.reduce((sum, cat) => sum + cat.totalStock, 0);
  const totalProduits = produits.length;
  const produitsActifs = produits.filter(p => p.actif !== false).length;

  // Fonction pour obtenir une couleur de fond légère pour chaque catégorie
  const getCategoryColor = (nom, index) => {
    const colors = [
      '#FFF5F0', '#F0F7FF', '#F0FFF4', '#FFF9F0', '#FDF0FF', '#F0FFF9', '#FFF0F5', '#F0F5FF'
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={styles.layout} className="admin-responsive-layout">
      {/* Sidebar */}
      <aside style={styles.sidebar} className="admin-responsive-sidebar sidebar">
        <div style={styles.sidebarHeader}>
          <div style={styles.logoWrapper}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
          </div>
          <div style={styles.logoContainer}>
            <span style={styles.logoText}>TeyShop</span>
            <span style={styles.sidebarBadge}>Admin</span>
          </div>
        </div>
        
        <nav style={styles.nav} className="admin-responsive-nav">
          <Link to="/admin/dashboard" style={getNavLinkStyle('dashboard')} onMouseEnter={() => setHoveredLink('dashboard')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="dashboard" size={18} color="#fff" /> Tableau de bord
          </Link>
          <Link to="/admin/produits" style={getNavLinkStyle('produits')} onMouseEnter={() => setHoveredLink('produits')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="package" size={18} color="#fff" /> Produits
          </Link>
          <Link to="/admin/commandes" style={getNavLinkStyle('commandes')} onMouseEnter={() => setHoveredLink('commandes')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="shopping-cart" size={18} color="#fff" /> Commandes
          </Link>
          <Link to="/admin/clients" style={getNavLinkStyle('clients')} onMouseEnter={() => setHoveredLink('clients')} onMouseLeave={() => setHoveredLink(null)}>
            <Icon name="users" size={18} color="#fff" /> utilisateurs
          </Link>
        </nav>
        
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user?.prenom?.[0] || 'A'}</div>
            <div>
              <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.deconnexionBtn} className="logout-btn">
            <Icon name="log-out" size={18} color="#fff" />
            <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
            {!isLoggingOut && <span style={styles.logoutArrow}>→</span>}
            {isLoggingOut && <div style={styles.spinner}></div>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main} className="admin-responsive-main main">
        <div style={styles.header} className="responsive-header-row">
          <div>
            <h1 style={styles.titre}>Gestion des produits</h1>
            <p style={styles.sousTitre}>Gérez votre catalogue par catégorie</p>
          </div>
          <button onClick={() => { setSelectedProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '', actif: true }); setImages([]); setShowModal(true); }} style={styles.addBtn} className="responsive-full-button">
            <Icon name="plus" size={18} /> Nouveau produit
          </button>
        </div>

        {/* Statistiques */}
        <div style={styles.statsBar} className="stats-bar">
          <div style={styles.statItem} className="stat-item">
            <div style={styles.statIcon}>📦</div>
            <div>
              <div style={styles.statValue}>{totalProduits}</div>
              <div style={styles.statLabel}>Total produits</div>
            </div>
          </div>
          <div style={styles.statItem} className="stat-item">
            <div style={styles.statIcon}>✅</div>
            <div>
              <div style={styles.statValue}>{produitsActifs}</div>
              <div style={styles.statLabel}>Actifs</div>
            </div>
          </div>
          <div style={styles.statItem} className="stat-item">
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={styles.statValue}>{totalStockGeneral.toLocaleString('fr-FR')}</div>
              <div style={styles.statLabel}>Stock total</div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={styles.filtersBar}>
          <div style={styles.searchWrapper}>
            <Icon name="search" size={16} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput} 
            />
          </div>
        </div>

        {/* Vue Catégories ou Produits */}
        {selectedCategorie ? (
          <>
            <div style={styles.backButtonContainer}>
              <button onClick={() => setSelectedCategorie(null)} style={styles.backButton}>
                ← Retour aux catégories
              </button>
              <div style={styles.categoryHeaderInfo}>
                <h2 style={styles.categoryTitle}>{selectedCategorie.nom}</h2>
                <span style={styles.categoryCount}>{selectedCategorie.produits.length} produits</span>
              </div>
            </div>

            <div style={styles.tableContainer} className="table-container responsive-table">
              {loading ? (
                <div style={styles.loadingState}>
                  <div style={styles.spinnerLarge}></div>
                  <p>Chargement...</p>
                </div>
              ) : produitsParCategorie.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <h3>Aucun produit</h3>
                  <p>Aucun produit dans cette catégorie</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Produit</th>
                      <th>Marque</th>
                      <th>Prix</th>
                      <th>Stock</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produitsParCategorie.map((p) => (
                      <tr key={p._id} className="product-row" onMouseEnter={() => setHoveredProduct(p._id)} onMouseLeave={() => setHoveredProduct(null)}>
                        <td style={styles.imageCell}>
                          {p.images?.[0] ? (
                            <img src={mediaUrl(p.images[0])} alt={p.nom} style={styles.productImage} />
                          ) : (
                            <div style={styles.imagePlaceholder}>📷</div>
                          )}
                        </td>
                        <td style={styles.productNameCell}>
                          <div style={styles.productName}>{p.nom}</div>
                        </td>
                        <td style={styles.brandCell}>{p.marque || '—'}</td>
                        <td style={styles.priceCell}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</td>
                        <td style={styles.stockCell}>
                          <span className={`stock-badge ${p.stock > 10 ? 'stock-high' : p.stock > 0 ? 'stock-medium' : 'stock-low'}`}>
                            {p.stock || 0} unités
                          </span>
                        </td>
                        <td style={styles.statusCell}>
                          <button onClick={() => handleToggleActif(p)} className={`status-btn ${p.actif !== false ? 'active' : 'inactive'}`}>
                            {p.actif !== false ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td style={styles.actionsCell}>
                          <button onClick={() => handleEdit(p)} className="action-btn edit" title="Modifier">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.nom)} className="action-btn delete" title="Supprimer">
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={styles.categoriesHeader}>
              <h2 style={styles.categoriesTitle}>Catégories</h2>
              <p style={styles.categoriesSubtitle}>Cliquez sur une catégorie pour gérer ses produits</p>
            </div>

            <div style={styles.categoriesGrid} className="categories-grid responsive-grid">
              {categories.map((cat, idx) => (
                <div 
                  key={idx} 
                  className="category-card"
                  style={{ 
                    ...styles.categoryCard, 
                    background: getCategoryColor(cat.nom, idx),
                    transform: hoveredCategory === idx ? 'translateY(-8px)' : 'translateY(0)'
                  }}
                  onMouseEnter={() => setHoveredCategory(idx)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => setSelectedCategorie(cat)}
                >
                  <div style={styles.categoryCardInfo}>
                    <h3 style={styles.categoryCardName}>{cat.nom}</h3>
                    <div style={styles.categoryCardStats}>
                      <span>📦 {cat.produits.length} produits</span>
                      <span>📊 {cat.totalStock.toLocaleString('fr-FR')} unités</span>
                    </div>
                  </div>
                  <div style={styles.categoryCardArrow}>→</div>
                </div>
              ))}
            </div>

            {categories.length === 0 && !loading && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <h3>Aucune catégorie</h3>
                <p>Ajoutez des produits pour voir les catégories</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} className="responsive-modal" onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedProduit ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nom du produit</label>
                <input name="nom" placeholder="Ex: iPhone 13 Pro" value={formData.nom} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.formRow} className="form-row responsive-two-grid">
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Marque</label>
                  <input name="marque" placeholder="Apple, Samsung..." value={formData.marque} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Catégorie</label>
                  <select name="categorie" value={formData.categorie} onChange={handleChange} required style={styles.input}>
                    <option value="">Sélectionner</option>
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={styles.formRow} className="form-row responsive-two-grid">
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Prix (FCFA)</label>
                  <input name="prix" type="number" min="0" placeholder="0" value={formData.prix} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Stock</label>
                  <input name="stock" type="number" min="0" placeholder="0" value={formData.stock} onChange={handleChange} required style={styles.input} />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Description</label>
                <textarea name="description" placeholder="Description détaillée..." value={formData.description} onChange={handleChange} required style={{ ...styles.input, height: '80px', resize: 'vertical' }} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Statut</label>
                <div style={styles.radioGroup}>
                  <label className="radio-label">
                    <input type="radio" name="actif" value="true" checked={formData.actif === true} onChange={() => setFormData({ ...formData, actif: true })} />
                    <span>Actif</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="actif" value="false" checked={formData.actif === false} onChange={() => setFormData({ ...formData, actif: false })} />
                    <span>Inactif</span>
                  </label>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Images</label>
                <div style={styles.fileUploadArea}>
                  <Icon name="image" size={24} color="#C8410A" />
                  <p>Cliquez ou glissez des images</p>
                  <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} style={styles.fileInput} />
                </div>
                {images.length > 0 && (
                  <div style={styles.imagePreview}>
                    {Array.from(images).map((img, idx) => (
                      <span key={idx} style={styles.imagePreviewItem}>{img.name}</span>
                    ))}
                  </div>
                )}
              </div>
              {selectedProduit && selectedProduit.images?.length > 0 && images.length === 0 && (
                <div style={styles.existingImages}>
                  <p style={styles.existingImagesLabel}>Images actuelles :</p>
                  <div style={styles.existingImagesList}>
                    {selectedProduit.images.map((img, idx) => (
                      <img key={idx} src={mediaUrl(img)} alt={`Image ${idx + 1}`} style={styles.existingImage} />
                    ))}
                  </div>
                </div>
              )}
              <div style={styles.modalActions} className="responsive-actions-row">
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.confirmBtn}>{selectedProduit ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles globaux injectés */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .spinner-large {
          width: 40px;
          height: 40px;
          border: 3px solid #f0f0f0;
          border-top-color: #C8410A;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
          padding: 16px 12px;
          background: #F8F9FA;
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          border-bottom: 1px solid #E8E8E8;
        }
        
        td {
          padding: 16px 12px;
          border-bottom: 1px solid #F0F0F0;
        }
        
        .product-row:hover {
          background: #F8F9FA;
        }
        
        .stock-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .stock-high {
          background: #E8F5E9;
          color: #2E7D32;
        }
        
        .stock-medium {
          background: #FFF3E0;
          color: #F57C00;
        }
        
        .stock-low {
          background: #FFEBEE;
          color: #D32F2F;
        }
        
        .status-btn {
          padding: 5px 14px;
          border-radius: 30px;
          border: none;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .status-btn.active {
          background: #2ECC71;
          color: #fff;
        }
        
        .status-btn.inactive {
          background: #E74C3C;
          color: #fff;
        }
        
        .status-btn:hover {
          transform: scale(1.05);
          opacity: 0.85;
        }
        
        .action-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 4px;
        }
        
        .action-btn.edit {
          background: #F0F0F0;
          color: #666;
        }
        
        .action-btn.delete {
          background: #FEF0EE;
          color: #E74C3C;
        }
        
        .action-btn.edit:hover {
          background: #E0E0E0;
          transform: scale(1.08);
          color: #112219;
        }
        
        .action-btn.delete:hover {
          background: #FADBD8;
          transform: scale(1.08);
          color: #C0392B;
        }
        
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .sidebar {
            display: flex;
          }
          .main {
            padding: 16px;
          }
          .stats-bar {
            flex-direction: column;
          }
          .stat-item {
            width: 100%;
          }
          .table-container {
            overflow-x: auto;
          }
          table {
            min-width: 600px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
    </div>
  );
}

// Styles
const styles = {
  layout: { 
    display: 'flex', 
    minHeight: '100vh', 
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: '#F5F7FA'
  },
  sidebar: { 
    width: '280px', 
    background: 'linear-gradient(180deg, #1A3A2A 0%, #0E251B 100%)', 
    padding: '28px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    position: 'sticky', 
    top: 0, 
    height: '100vh',
    boxShadow: '4px 0 30px rgba(0,0,0,0.08)'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoWrapper: {
    width: '42px',
    height: '42px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  logoContainer: {
    flex: 1
  },
  logoText: {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '700'
  },
  sidebarBadge: {
    display: 'inline-block',
    background: '#C8410A',
    color: '#fff',
    fontSize: '0.6rem',
    padding: '2px 8px',
    borderRadius: '12px',
    marginLeft: '8px'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease'
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    padding: '8px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff'
  },
  userName: {
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '2px'
  },
  userEmail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.7rem'
  },
  deconnexionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease'
  },
  logoutArrow: {
    marginLeft: 'auto',
    transition: 'transform 0.2s ease'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite'
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: 'clamp(18px, 4vw, 28px) clamp(16px, 4vw, 36px)',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  titre: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#112219',
    marginBottom: '6px'
  },
  sousTitre: {
    color: '#666',
    fontSize: '0.85rem'
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #C8410A 0%, #E8622A 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '40px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(200,65,10,0.2)'
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    marginBottom: '28px',
    flexWrap: 'wrap'
  },
  statItem: {
    background: '#fff',
    padding: '16px 24px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: 'min(160px, 100%)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: '1px solid #E8E8E8'
  },
  statIcon: {
    fontSize: '1.8rem'
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#C8410A',
    lineHeight: 1.2
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#666'
  },
  filtersBar: {
    marginBottom: '28px'
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '380px',
    width: '100%'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    borderRadius: '40px',
    border: '1px solid #E0E0E0',
    outline: 'none',
    fontSize: '0.85rem',
    background: '#fff',
    transition: 'all 0.2s ease'
  },
  backButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#C8410A',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  categoryHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  categoryTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#112219',
    margin: 0
  },
  categoryCount: {
    fontSize: '0.85rem',
    color: '#666',
    background: '#F0F0F0',
    padding: '4px 12px',
    borderRadius: '30px'
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '20px',
    overflow: 'auto',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  imageCell: {
    width: '60px'
  },
  productImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  imagePlaceholder: {
    width: '50px',
    height: '50px',
    background: '#F5F5F5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  },
  productNameCell: {
    minWidth: '160px'
  },
  productName: {
    fontWeight: '600',
    color: '#112219',
    fontSize: '0.85rem'
  },
  brandCell: {
    fontSize: '0.8rem',
    color: '#888'
  },
  priceCell: {
    fontWeight: '600',
    color: '#C8410A',
    fontSize: '0.85rem'
  },
  stockCell: {
    minWidth: '100px'
  },
  statusCell: {
    minWidth: '90px'
  },
  actionsCell: {
    minWidth: '90px'
  },
  spinnerLarge: {
    width: '40px',
    height: '40px',
    border: '3px solid #f0f0f0',
    borderTopColor: '#C8410A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px'
  },
  loadingState: {
    textAlign: 'center',
    padding: '80px',
    color: '#999'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px',
    color: '#999'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px'
  },
  categoriesHeader: {
    marginBottom: '28px'
  },
  categoriesTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#112219',
    marginBottom: '8px'
  },
  categoriesSubtitle: {
    fontSize: '0.85rem',
    color: '#666'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
    gap: '20px'
  },
  categoryCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: '1px solid #E8E8E8',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  categoryCardInfo: {
    flex: 1
  },
  categoryCardName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#112219',
    marginBottom: '6px'
  },
  categoryCardStats: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.7rem',
    color: '#888'
  },
  categoryCardArrow: {
    color: '#C8410A',
    fontSize: '1.2rem',
    opacity: 0.5,
    transition: 'all 0.2s ease'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: '#fff',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px',
    borderBottom: '1px solid #E8E8E8'
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#112219',
    margin: 0
  },
  modalClose: {
    width: '34px',
    height: '34px',
    border: 'none',
    background: '#F8F9FA',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#666',
    transition: 'all 0.2s ease'
  },
  formGroup: {
    marginBottom: '20px',
    padding: '0 28px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    padding: '0 28px'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  radioGroup: {
    display: 'flex',
    gap: '24px'
  },
  fileUploadArea: {
    position: 'relative',
    border: '2px dashed #E2E8F0',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#FAFAFA'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  imagePreview: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  imagePreviewItem: {
    background: '#F0F0F0',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    color: '#666'
  },
  existingImages: {
    marginTop: '20px',
    padding: '0 28px'
  },
  existingImagesLabel: {
    fontSize: '0.75rem',
    color: '#666',
    marginBottom: '10px'
  },
  existingImagesList: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  existingImage: {
    width: '65px',
    height: '65px',
    objectFit: 'cover',
    borderRadius: '10px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px',
    padding: '24px 28px',
    borderTop: '1px solid #E8E8E8'
  },
  cancelBtn: {
    padding: '12px 24px',
    border: '1.5px solid #E2E8F0',
    background: '#fff',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease'
  },
  confirmBtn: {
    padding: '12px 28px',
    border: 'none',
    background: 'linear-gradient(135deg, #C8410A 0%, #E8622A 100%)',
    color: '#fff',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease'
  }
};
