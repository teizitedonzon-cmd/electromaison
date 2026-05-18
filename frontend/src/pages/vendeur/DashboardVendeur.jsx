import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

// Composant BarChart professionnel
function BarChart({ title, data = [], max, icon }) {
  if (!data.length) return <div style={styles.emptyChart}><Icon name="bar-chart" size={40} color="#ccc" /><p>Aucune donnée de vente</p></div>;
  return (
    <div style={styles.barChartContainer}>
      <div style={styles.chartCardHeader}>
        <div style={styles.chartTitle}>
          <div style={styles.chartIconBg}><Icon name={icon} size={18} color="#C8410A" /></div>
          <span>{title}</span>
        </div>
        <div style={styles.chartPeriod}>2026</div>
      </div>
      <div style={styles.barChartBody}>
        {data.map((item, idx) => (
          <div key={idx} style={styles.barRow}>
            <div style={styles.barLabel}>{item.label}</div>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${(item.value / max) * 100}%`, animationDelay: `${idx * 0.1}s` }} />
            </div>
            <div style={styles.barValue}>{item.value.toLocaleString('fr-FR')} FCFA</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant PieChart professionnel avec rendu garanti
function PieChart({ title, data = [], total, icon }) {
  if (!data.length) return <div style={styles.emptyChart}><Icon name="pie-chart" size={40} color="#ccc" /><p>Aucune donnée de catégorie</p><p style={{fontSize:'0.7rem', marginTop:'8px'}}>Les ventes apparaîtront ici</p></div>;
  
  const colors = ['#FF6B35', '#F7931E', '#FFC300', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#1ABC9C', '#E67E22', '#27AE60'];
  let currentAngle = 0;
  const slices = [];
  
  data.forEach((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + 75 * Math.cos(startRad);
    const y1 = 100 + 75 * Math.sin(startRad);
    const x2 = 100 + 75 * Math.cos(endRad);
    const y2 = 100 + 75 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 75 75 0 ${largeArc} 1 ${x2} ${y2} Z`;
    slices.push({ path: pathData, color: colors[idx % colors.length], label: item.label, percentage, value: item.value });
  });

  return (
    <div style={styles.pieChartContainer}>
      <div style={styles.chartCardHeader}>
        <div style={styles.chartTitle}>
          <div style={styles.chartIconBg}><Icon name={icon} size={18} color="#C8410A" /></div>
          <span>{title}</span>
        </div>
        <div style={styles.chartTotal}>{total.toLocaleString('fr-FR')} FCFA</div>
      </div>
      <div style={styles.pieChartBody}>
        <div style={styles.pieSvgWrapper}>
          <svg viewBox="0 0 200 200" style={styles.pieSvg}>
            <defs>
              <filter id="pieShadow">
                <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.15"/>
              </filter>
            </defs>
            {slices.map((slice, i) => (
              <path key={i} d={slice.path} fill={slice.color} filter="url(#pieShadow)" className="pie-slice" />
            ))}
          </svg>
        </div>
        <div style={styles.pieLegendList}>
          {slices.map((slice, i) => (
            <div key={i} style={styles.pieLegendItem} className="pie-legend-item">
              <span style={{ ...styles.pieLegendColor, backgroundColor: slice.color }}></span>
              <span style={styles.pieLegendLabel}>{slice.label}</span>
              <span style={styles.pieLegendPercent}>{slice.percentage.toFixed(1)}%</span>
              <span style={styles.pieLegendValue}>{slice.value.toLocaleString('fr-FR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const formVide = { nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' };

export default function DashboardVendeur() {
  const { user, deconnexion } = useAuth();
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(formVide);
  const [images, setImages] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [editingProduit, setEditingProduit] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chargerMesProduits = async () => {
    try {
      const { data } = await api.get('/produits/mes-produits');
      setProduits(data.produits || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de chargement');
    }
  };

  const chargerMesVentes = async () => {
    try {
      const { data } = await api.get('/commandes/mes-ventes');
      setVentes(data.commandes || []);
    } catch {
      setVentes([]);
    }
  };

  const chargerNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/mes-notifications');
      setNotifications(data.notifications || []);
      setNonLues(data.nonLues || 0);
    } catch {
      setNotifications([]);
      setNonLues(0);
    }
  };

  useEffect(() => {
    chargerMesProduits();
    chargerMesVentes();
    chargerNotifications();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Array.from(images || []).forEach((img) => data.append('images', img));
    try {
      if (editingProduit) {
        await api.put(`/produits/${editingProduit._id}`, data);
        toast.success('Produit modifie avec succes.');
      } else {
        await api.post('/produits', data);
        toast.success('Produit envoye pour publication.');
      }
      setShowModal(false);
      setEditingProduit(null);
      setFormData(formVide);
      setImages([]);
      chargerMesProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => deconnexion(), 500);
  };

  const ouvrirEdition = (produit) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom || '',
      description: produit.description || '',
      prix: produit.prix || '',
      stock: produit.stock || '',
      categorie: produit.categorie || '',
      marque: produit.marque || '',
    });
    setImages([]);
    setShowDetailModal(false);
    setShowModal(true);
  };

  const supprimerProduit = async (produit) => {
    if (!window.confirm(`Supprimer "${produit.nom}" ?`)) return;
    try {
      await api.delete(`/produits/${produit._id}`);
      toast.success('Produit supprime.');
      setShowDetailModal(false);
      chargerMesProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const marquerToutLu = async () => {
    try {
      await api.put('/notifications/tout-lire');
      chargerNotifications();
    } catch {
      toast.error('Erreur lors de la lecture des notifications');
    }
  };

  const ouvrirNotifications = () => {
    setShowNotifications((visible) => !visible);
  };

  const revenu = ventes.reduce((s, v) => s + (v.montantVendeur || 0), 0);
  const peutPublier = user?.role === 'admin' || user?.statutVendeur === 'approuve';
  const totalCommandes = ventes.length;

  // Agrégation pour les graphiques
  const ventesParMois = () => {
    const mois = {};
    ventes.forEach(v => {
      if (v.createdAt) {
        const date = new Date(v.createdAt);
        const moisKey = date.toLocaleString('fr-FR', { month: 'short' });
        mois[moisKey] = (mois[moisKey] || 0) + (v.montantVendeur || 0);
      }
    });
    const ordered = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return ordered.map(m => ({ label: m, value: mois[m] || 0 })).filter(m => m.value > 0);
  };
  
  const ventesParCategorie = () => {
    const cats = {};
    ventes.forEach(v => {
      (v.lignes || []).forEach(ligne => {
        const cat = ligne.categorie || ligne.nomProduit?.split(' ')[0] || 'Autre';
        cats[cat] = (cats[cat] || 0) + ((ligne.prixUnitaire || 0) * (ligne.quantite || 0));
      });
    });
    return Object.entries(cats).map(([label, value]) => ({ label, value })).sort((a,b) => b.value - a.value);
  };
  
  const monthlyData = ventesParMois();
  const categoryData = ventesParCategorie();
  const maxMonthly = Math.max(...monthlyData.map(d => d.value), 1);
  const totalCategorie = categoryData.reduce((s, i) => s + i.value, 0);
  const produitsCommandes = new Set(
    ventes.flatMap((vente) =>
      (vente.lignes || []).map((ligne) => String(ligne.produit?._id || ligne.produit || ''))
    )
  );
  const produitEstCommande = (produitId) => produitsCommandes.has(String(produitId));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoWrapper}><img src={logot} alt="TeyShop" style={styles.logoImageHeader} /></div>
          <div>
            <h1 style={{ ...styles.headerTitle, fontSize: isSmallMobile ? '1rem' : (isMobile ? '1.2rem' : '1.5rem') }}>Espace Vendeur</h1>
            {!isSmallMobile && <p style={styles.headerSubtitle}>Gérez vos ventes et produits</p>}
          </div>
        </div>
        <div style={styles.userSection}>
          <div style={styles.notificationWrapper}>
            <button onClick={ouvrirNotifications} style={styles.bellButton} title="Notifications">
              <Icon name="bell" size={isMobile ? 16 : 20} color="#1A3A2A" />
              {nonLues > 0 && <span style={styles.bellBadge}>{nonLues > 9 ? '9+' : nonLues}</span>}
            </button>
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationDropdownHeader}>
                  <div>
                    <div style={styles.notificationDropdownTitle}>Notifications</div>
                    <div style={styles.notificationDropdownSub}>{nonLues} non lue(s)</div>
                  </div>
                  {nonLues > 0 && <button onClick={marquerToutLu} style={styles.markReadBtn}>Tout lire</button>}
                </div>
                <div style={styles.notificationDropdownList}>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyNotification}>Aucune notification pour le moment</div>
                  ) : (
                    notifications.slice(0, 8).map((notification) => (
                      <div key={notification._id} style={{ ...styles.notificationItem, background: notification.lu ? '#fff' : '#FFF5F0' }}>
                        <div style={styles.notificationTitle}>{notification.titre}</div>
                        <div style={styles.notificationMessage}>{notification.message}</div>
                        <div style={styles.notificationDate}>{new Date(notification.createdAt).toLocaleString('fr-FR')}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {!isSmallMobile && (
            <div style={styles.userInfo}>
              <img src={user?.photoProfil ? mediaUrl(user.photoProfil) : 'https://via.placeholder.com/40'} style={styles.avatar} alt="profil" />
              <div><p style={styles.userName}>{user?.prenom} {user?.nom}</p><span style={{ ...styles.userStatus, color: peutPublier ? '#2ECC71' : '#C8410A' }}><span style={styles.statusDot}></span>{peutPublier ? 'Vendeur approuvé' : 'Validation en attente'}</span></div>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn} className="logout-btn">
            <Icon name="log-out" size={isMobile ? 14 : 18} />
            {!isSmallMobile && <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>}
            {!isLoggingOut && !isSmallMobile && <span style={styles.logoutArrow}>→</span>}
            {isLoggingOut && <div style={styles.spinner}></div>}
          </button>
        </div>
      </header>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Mes produits', value: produits.length, icon: 'package', color: '#667eea', suffix: '' },
          { label: isMobile ? 'Commandes' : 'Commandes reçues', value: totalCommandes, icon: 'shopping-cart', color: '#4facfe', suffix: '' },
          { label: 'CA', value: revenu.toLocaleString('fr-FR'), icon: 'trending-up', color: '#43e97b', suffix: 'FCFA' }
        ].map((stat, idx) => (
          <div key={idx} style={{ ...styles.statCard, transform: hoveredStat === idx ? 'translateY(-6px)' : 'translateY(0)' }} onMouseEnter={() => setHoveredStat(idx)} onMouseLeave={() => setHoveredStat(null)}>
            <div style={{ ...styles.statIcon, background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)` }}><Icon name={stat.icon} size={isMobile ? 20 : 24} color={stat.color} /></div>
            <div>
              <div style={{ ...styles.statNumber, fontSize: isMobile ? '1.2rem' : '1.6rem' }}>{stat.value}</div>
              <div style={{ ...styles.statLabel, fontSize: isMobile ? '0.65rem' : '0.75rem' }}>{stat.label}</div>
              {stat.suffix && <div style={styles.statSuffix}>{stat.suffix}</div>}
            </div>
          </div>
        ))}
        <button onClick={() => { setEditingProduit(null); setFormData(formVide); setImages([]); setShowModal(true); }} disabled={!peutPublier} style={{ ...styles.addBtnLarge, opacity: peutPublier ? 1 : 0.55, cursor: peutPublier ? 'pointer' : 'not-allowed', padding: isMobile ? '12px' : '16px 20px', fontSize: isMobile ? '0.8rem' : '0.9rem' }} className="add-btn">
          <Icon name="plus" size={isMobile ? 16 : 20} /> {isSmallMobile ? 'Ajouter' : (isMobile ? 'Ajouter' : 'Nouveau produit')}
        </button>
      </div>

      {/* Diagrammes - Version responsive */}
      <div style={{ ...styles.chartsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
        <div style={styles.chartWrapper}>
          <BarChart title="Ventes mensuelles" data={monthlyData} max={maxMonthly} icon="calendar" />
          {monthlyData.length === 0 && (
            <div style={styles.chartHint}>
              <Icon name="info" size={14} />
              <span>Les ventes apparaîtront ici</span>
            </div>
          )}
        </div>
        <div style={styles.chartWrapper}>
          <PieChart title="Répartition par catégorie" data={categoryData} total={totalCategorie} icon="pie-chart" />
          {categoryData.length === 0 && (
            <div style={styles.chartHint}>
              <Icon name="info" size={14} />
              <span>Les catégories apparaîtront ici</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Produits */}
      <div style={styles.contentSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isMobile ? '1rem' : '1.1rem' }}>Mes produits</h2>
            {!isSmallMobile && <p style={styles.sectionSubtitle}>{produits.length} produit(s) en ligne</p>}
          </div>
          <div style={styles.sectionBadge}>{produits.filter(p => p.actif).length} actifs</div>
        </div>
        <div style={{ ...styles.productsGrid, gridTemplateColumns: isSmallMobile ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr)') }}>
          {produits.length === 0 ? (
            <div style={styles.emptyState}><Icon name="package" size={48} color="#ccc" /><p>Aucun produit</p><button onClick={() => { setEditingProduit(null); setFormData(formVide); setImages([]); setShowModal(true); }} style={styles.emptyStateBtn}>Ajouter mon premier produit</button></div>
          ) : (
            produits.map(p => (
              <div key={p._id} style={styles.productCard} className="product-card" onClick={() => { setSelectedProduit(p); setShowDetailModal(true); }}>
                <div style={styles.productImage}>
                  {p.images?.[0] ? <img src={mediaUrl(p.images[0])} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={styles.productImagePlaceholder}><Icon name="image" size={32} color="#ccc" /></div>}
                  <div style={{ ...styles.productStatus, background: p.actif ? '#2ECC71' : '#E74C3C' }}>{p.actif ? 'En ligne' : 'Hors ligne'}</div>
                </div>
                <div style={styles.productInfo}>
                  <h3 style={{ ...styles.productName, fontSize: isMobile ? '0.85rem' : '1rem' }}>{p.nom}</h3>
                  {!isSmallMobile && <p style={styles.productCategory}>{p.categorie}</p>}
                  <div style={styles.productDetails}>
                    <span style={{ ...styles.productPrice, fontSize: isMobile ? '0.85rem' : '1rem' }}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</span>
                    <span style={{ ...styles.productStock, fontSize: isMobile ? '0.6rem' : '0.7rem' }}>Stock: {p.stock}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Commandes reçues - Version responsive */}
      <div style={styles.contentSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: isMobile ? '1rem' : '1.1rem' }}>Commandes reçues</h2>
            {!isSmallMobile && <p style={styles.sectionSubtitle}>{ventes.length} commande(s) au total</p>}
          </div>
          <div style={styles.sectionBadge}>
            <Icon name="clock" size={12} />
            <span>Récentes</span>
          </div>
        </div>
        <div style={styles.ordersTable}>
          {ventes.length === 0 ? (
            <div style={styles.emptyState}><Icon name="shopping-cart" size={48} color="#ccc" /><p>Aucune commande reçue</p></div>
          ) : (
            <>
              {isMobile ? (
                // Version mobile: cartes au lieu de tableau
                <div style={{ padding: '16px' }}>
                  {ventes.slice(0, 10).map(v => (
                    <div key={v._id} style={{ background: '#fff', borderRadius: '12px', padding: '12px', marginBottom: '12px', border: '1px solid #E9ECEF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#C8410A', fontSize: '0.7rem' }}>#{v._id.slice(-8).toUpperCase()}</span>
                        <span style={{ fontSize: '0.6rem', color: '#6C757D' }}>{new Date(v.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        {v.lignes?.slice(0, 2).map((l, idx) => (
                          <span key={idx} style={{ display: 'inline-block', background: '#F8F9FA', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', margin: '2px' }}>{l.nomProduit} x{l.quantite}</span>
                        ))}
                        {v.lignes?.length > 2 && <span style={{ fontSize: '0.6rem', color: '#6C757D' }}>+{v.lignes.length - 2}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.75rem', color: '#2C3E50' }}>{Number(v.montantVendeur || 0).toLocaleString('fr-FR')} FCFA</span>
                        <span style={{ ...styles.orderStatus, fontSize: '0.6rem', padding: '2px 8px' }}>{v.statut?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Articles</th>
                      <th>Quantité</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.slice(0, 10).map(v => (
                      <tr key={v._id} className="order-row">
                        <td style={styles.orderRef}>#{v._id.slice(-8).toUpperCase()}</td>
                        <td style={styles.orderDate}>{new Date(v.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div style={styles.articlesList}>
                            {v.lignes?.map((l, idx) => (
                              <span key={idx} style={styles.articleTag}>{l.nomProduit}</span>
                            ))}
                          </div>
                        </td>
                        <td style={styles.orderQuantity}>
                          {v.lignes?.map((l, idx) => (
                            <div key={idx} style={styles.qtyBadge}>x{l.quantite}</div>
                          ))}
                        </td>
                        <td style={styles.orderAmount}>{Number(v.montantVendeur || 0).toLocaleString('fr-FR')} FCFA</td>
                        <td>
                          <span style={{ 
                            ...styles.orderStatus, 
                            background: v.statut === 'livree' ? '#2ECC71' : 
                                       v.statut === 'expediee' ? '#3498DB' :
                                       v.statut === 'annulee' ? '#E74C3C' : '#F39C12' 
                          }}>
                            {v.statut?.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {ventes.length > 10 && (
                <div style={styles.viewMore}>
                  <button style={styles.viewMoreBtn}>Voir toutes les commandes →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals - Version responsive */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={{ ...styles.modal, maxWidth: isMobile ? '90%' : '550px', margin: isMobile ? '16px' : '0' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, fontSize: isMobile ? '1rem' : '1.2rem' }}>{editingProduit ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button style={styles.modalClose} onClick={() => { setShowModal(false); setEditingProduit(null); setFormData(formVide); }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}><label style={styles.formLabel}>Nom du produit</label><input name="nom" placeholder="Ex: iPhone 13 Pro" value={formData.nom} onChange={handleChange} required style={styles.input} /></div>
              <div style={{ ...styles.formRow, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px' }}>
                <div style={styles.formGroup}><label>Marque</label><input name="marque" placeholder="Apple, Samsung..." value={formData.marque} onChange={handleChange} required style={styles.input} /></div>
                <div style={styles.formGroup}><label>Catégorie</label><select name="categorie" value={formData.categorie} onChange={handleChange} required style={styles.input}><option value="">Sélectionner</option>{['Electronique','Vetements','Alimentation','Electromenager','Beaute','Immobilier','Sport','Autre'].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div style={{ ...styles.formRow, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '16px' }}>
                <div style={styles.formGroup}><label>Prix (FCFA)</label><input name="prix" type="number" min="0" placeholder="0" value={formData.prix} onChange={handleChange} required style={styles.input} /></div>
                <div style={styles.formGroup}><label>Quantité en stock</label><input name="stock" type="number" min="0" placeholder="0" value={formData.stock} onChange={handleChange} required style={styles.input} /></div>
              </div>
              <div style={styles.formGroup}><label>Description</label><textarea name="description" placeholder="Description détaillée du produit..." value={formData.description} onChange={handleChange} required style={{ ...styles.input, height: '80px', resize: 'vertical' }} /></div>
              <div style={styles.formGroup}>
                <label>Images du produit</label>
                <div style={styles.fileUploadArea}>
                  <Icon name="image" size={24} color="#C8410A" />
                  <p style={{ fontSize: isMobile ? '0.7rem' : '0.85rem' }}>Cliquez ou glissez des images</p>
                  <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} style={styles.fileInput} />
                </div>
                {images.length > 0 && <div style={styles.imagePreview}>{Array.from(images).map((img, idx) => <span key={idx} style={styles.imagePreviewItem}>{img.name}</span>)}</div>}
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduit(null); setFormData(formVide); }} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" style={styles.confirmBtn}>{editingProduit ? 'Enregistrer' : 'Publier le produit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedProduit && (
        <div style={styles.overlay} onClick={() => setShowDetailModal(false)}>
          <div style={{ ...styles.modalDetail, maxWidth: isMobile ? '90%' : '600px', margin: isMobile ? '16px' : '0' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, fontSize: isMobile ? '1rem' : '1.2rem' }}>{selectedProduit.nom}</h3>
              <button style={styles.modalClose} onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div style={{ ...styles.productDetailContent, flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '16px' : '24px' }}>
              {selectedProduit.images?.[0] && <img src={mediaUrl(selectedProduit.images[0])} alt={selectedProduit.nom} style={{ ...styles.productDetailImage, width: isMobile ? '100%' : '200px', height: isMobile ? '200px' : '200px', marginBottom: isMobile ? '16px' : 0 }} />}
              <div style={styles.productDetailInfo}>
                <p><strong>Marque:</strong> {selectedProduit.marque}</p>
                <p><strong>Catégorie:</strong> {selectedProduit.categorie}</p>
                <p><strong>Prix:</strong> {Number(selectedProduit.prix).toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Stock:</strong> {selectedProduit.stock}</p>
                {!isSmallMobile && <p><strong>Description:</strong> {selectedProduit.description}</p>}
                <p><strong>Statut:</strong> <span style={{ ...styles.productDetailStatus, background: selectedProduit.actif ? '#2ECC71' : '#E74C3C' }}>{selectedProduit.actif ? 'En ligne' : 'Hors ligne'}</span></p>
                <div style={styles.detailActions}>
                  <button disabled={produitEstCommande(selectedProduit._id)} onClick={() => ouvrirEdition(selectedProduit)} style={{ ...styles.editBtn, fontSize: isMobile ? '0.7rem' : '0.85rem', padding: isMobile ? '6px 12px' : '9px 16px', opacity: produitEstCommande(selectedProduit._id) ? 0.55 : 1, cursor: produitEstCommande(selectedProduit._id) ? 'not-allowed' : 'pointer' }}>Modifier</button>
                  <button disabled={produitEstCommande(selectedProduit._id)} onClick={() => supprimerProduit(selectedProduit)} style={{ ...styles.deleteBtn, fontSize: isMobile ? '0.7rem' : '0.85rem', padding: isMobile ? '6px 12px' : '9px 16px', opacity: produitEstCommande(selectedProduit._id) ? 0.55 : 1, cursor: produitEstCommande(selectedProduit._id) ? 'not-allowed' : 'pointer' }}>Supprimer</button>
                </div>
                {produitEstCommande(selectedProduit._id) && <p style={styles.lockHint}>Ce produit a deja ete commande.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', minHeight: '100vh', fontFamily: "'Inter', 'Poppins', -apple-system, sans-serif" },
  header: { background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoWrapper: { width: '40px', height: '40px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E9ECEF' },
  logoImageHeader: { width: '100%', height: '100%', objectFit: 'cover' },
  headerTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1A3A2A', margin: 0 },
  headerSubtitle: { fontSize: '0.75rem', color: '#6C757D', margin: '2px 0 0' },
  userSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#F8F9FA', borderRadius: '50px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C8410A' },
  userName: { margin: 0, fontWeight: '600', fontSize: '0.75rem', color: '#2C3E50' },
  userStatus: { fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' },
  statusDot: { width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid #E74C3C', color: '#E74C3C', background: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.75rem' },
  logoutArrow: { transition: 'transform 0.3s ease' },
  spinner: { width: '12px', height: '12px', border: '2px solid #E74C3C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '20px 16px' },
  statCard: { background: '#fff', padding: '14px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', cursor: 'pointer' },
  statIcon: { width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: '1.6rem', fontWeight: '800', color: '#1A3A2A', lineHeight: 1.2 },
  statLabel: { fontSize: '0.75rem', color: '#6C757D', marginTop: '4px' },
  statSuffix: { fontSize: '0.6rem', color: '#6C757D' },
  addBtnLarge: { background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(200, 65, 10, 0.2)' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '0 16px 20px' },
  chartWrapper: { position: 'relative' },
  chartHint: { marginTop: '8px', padding: '6px', background: '#FFF5F0', borderRadius: '8px', fontSize: '0.65rem', color: '#C8410A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  barChartContainer: { background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', height: '100%' },
  pieChartContainer: { background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', height: '100%' },
  chartCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
  chartTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#2C3E50' },
  chartIconBg: { width: '28px', height: '28px', background: '#FFF5F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chartPeriod: { fontSize: '0.65rem', color: '#6C757D', padding: '3px 8px', background: '#F8F9FA', borderRadius: '16px' },
  chartTotal: { fontSize: '0.7rem', fontWeight: '600', color: '#C8410A', padding: '3px 8px', background: '#FFF5F0', borderRadius: '16px' },
  barChartBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
  barLabel: { fontSize: '0.7rem', fontWeight: '500', color: '#495057' },
  barTrack: { height: '8px', background: '#E9ECEF', borderRadius: '8px', overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #C8410A, #E8622A)', borderRadius: '8px', animation: 'growWidth 0.8s ease-out forwards', transformOrigin: 'left' },
  barValue: { fontSize: '0.65rem', fontWeight: '600', color: '#2C3E50', textAlign: 'right' },
  pieChartBody: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  pieSvgWrapper: { width: '140px', height: '140px', flexShrink: 0 },
  pieSvg: { width: '100%', height: '100%', transform: 'rotate(-90deg)' },
  pieLegendList: { width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' },
  pieLegendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', padding: '4px 6px', borderRadius: '6px', transition: 'all 0.2s ease', cursor: 'pointer' },
  pieLegendColor: { width: '8px', height: '8px', borderRadius: '3px', flexShrink: 0 },
  pieLegendLabel: { flex: 1, color: '#495057', fontWeight: '500', fontSize: '0.65rem' },
  pieLegendPercent: { fontWeight: '600', color: '#C8410A', marginRight: '4px', fontSize: '0.6rem' },
  pieLegendValue: { fontSize: '0.55rem', color: '#6C757D' },
  emptyChart: { padding: '40px 16px', textAlign: 'center', color: '#ADB5BD' },
  contentSection: { padding: '0 16px 20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
  sectionTitle: { fontSize: '1rem', fontWeight: '600', color: '#2C3E50', margin: 0 },
  sectionSubtitle: { fontSize: '0.7rem', color: '#6C757D', margin: '2px 0 0' },
  sectionBadge: { background: '#C8410A', color: '#fff', padding: '3px 10px', borderRadius: '16px', fontSize: '0.65rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  productCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  productImage: { position: 'relative', height: '140px', background: '#F8F9FA', overflow: 'hidden' },
  productImagePlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productStatus: { position: 'absolute', top: '8px', right: '8px', padding: '3px 8px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '600', color: '#fff' },
  productInfo: { padding: '12px' },
  productName: { fontSize: '0.9rem', fontWeight: '600', color: '#2C3E50', margin: '0 0 4px' },
  productCategory: { fontSize: '0.65rem', color: '#6C757D', margin: '0 0 8px' },
  productDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: '0.9rem', fontWeight: '700', color: '#C8410A' },
  productStock: { fontSize: '0.65rem', color: '#6C757D' },
  ordersTable: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  orderRef: { fontWeight: '600', color: '#C8410A', fontSize: '0.7rem', padding: '10px 8px' },
  orderDate: { fontSize: '0.7rem', color: '#6C757D', padding: '10px 8px' },
  orderQuantity: { padding: '10px 8px' },
  qtyBadge: { display: 'inline-block', background: '#F8F9FA', padding: '2px 5px', borderRadius: '4px', fontSize: '0.65rem', margin: '2px 0', color: '#495057' },
  articlesList: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  articleTag: { background: '#F8F9FA', padding: '3px 8px', borderRadius: '5px', fontSize: '0.65rem', color: '#495057' },
  orderAmount: { fontWeight: '600', color: '#2C3E50', fontSize: '0.75rem', padding: '10px 8px' },
  orderStatus: { display: 'inline-block', padding: '3px 10px', borderRadius: '16px', fontSize: '0.65rem', fontWeight: '600', color: '#fff' },
  viewMore: { padding: '12px', textAlign: 'center', borderTop: '1px solid #E9ECEF' },
  viewMoreBtn: { background: 'none', border: 'none', color: '#C8410A', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', transition: 'transform 0.3s ease' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: '#ADB5BD' },
  emptyStateBtn: { marginTop: '12px', padding: '8px 20px', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '0.8rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '16px' },
  modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalDetail: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E9ECEF' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#2C3E50', margin: 0 },
  modalClose: { width: '28px', height: '28px', border: 'none', background: '#F8F9FA', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', color: '#6C757D', transition: 'all 0.2s ease' },
  formGroup: { marginBottom: '14px', padding: '0 20px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '0 20px' },
  formLabel: { display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#2C3E50', marginBottom: '5px' },
  input: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '0.8rem', transition: 'border-color 0.2s ease' },
  fileUploadArea: { position: 'relative', border: '2px dashed #E9ECEF', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  fileInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  imagePreview: { marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' },
  imagePreviewItem: { background: '#F8F9FA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.65rem', color: '#495057' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', padding: '16px 20px', borderTop: '1px solid #E9ECEF' },
  cancelBtn: { padding: '8px 16px', border: '1px solid #E9ECEF', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' },
  confirmBtn: { padding: '8px 20px', border: 'none', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  productDetailContent: { display: 'flex', gap: '20px', padding: '20px' },
  productDetailImage: { width: '200px', height: '200px', objectFit: 'cover', borderRadius: '12px' },
  productDetailInfo: { flex: 1, lineHeight: '1.6', fontSize: '0.8rem' },
  productDetailStatus: { display: 'inline-block', padding: '2px 10px', borderRadius: '16px', fontSize: '0.65rem', color: '#fff', marginLeft: '6px' },
  notificationWrapper: { position: 'relative' },
  bellButton: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E9ECEF', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' },
  bellBadge: { position: 'absolute', top: '-4px', right: '-4px', minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '999px', background: '#E74C3C', color: '#fff', fontSize: '0.55rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' },
  notificationDropdown: { position: 'absolute', top: '44px', right: 0, width: '300px', maxWidth: 'calc(100vw - 20px)', background: '#fff', borderRadius: '12px', boxShadow: '0 18px 45px rgba(0,0,0,0.18)', border: '1px solid #E9ECEF', overflow: 'hidden', zIndex: 200 },
  notificationDropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #F0F0F0' },
  notificationDropdownTitle: { fontWeight: '800', color: '#1A3A2A', fontSize: '0.85rem' },
  notificationDropdownSub: { color: '#6C757D', fontSize: '0.65rem', marginTop: '2px' },
  notificationDropdownList: { maxHeight: '300px', overflowY: 'auto' },
  markReadBtn: { border: 'none', background: '#FFF5F0', color: '#C8410A', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '700' },
  notificationItem: { padding: '10px 12px', borderBottom: '1px solid #F0F0F0' },
  notificationTitle: { fontWeight: '700', color: '#1A3A2A', fontSize: '0.75rem' },
  notificationMessage: { color: '#495057', fontSize: '0.7rem', marginTop: '3px' },
  notificationDate: { color: '#ADB5BD', fontSize: '0.6rem', marginTop: '4px' },
  emptyNotification: { color: '#ADB5BD', textAlign: 'center', padding: '20px', fontSize: '0.75rem' },
  detailActions: { display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' },
  editBtn: { border: 'none', background: '#1A3A2A', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  deleteBtn: { border: 'none', background: '#E74C3C', color: '#fff', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' },
  lockHint: { marginTop: '8px', color: '#C8410A', fontSize: '0.65rem', fontWeight: '600' }
};

// Animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes growWidth { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes slideIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  
  .stat-card:hover { transform: translateY(-6px) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important; }
  .product-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
  .order-row:hover { background: #F8F9FA; }
  .logout-btn:hover { background: rgba(231, 76, 60, 0.1); transform: translateX(4px); }
  .logout-btn:hover .logout-arrow { transform: translateX(4px); }
  .add-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(200, 65, 10, 0.4); }
  .modal-close:hover { background: #E9ECEF; transform: scale(1.05); }
  .view-more-btn:hover { transform: translateX(4px); }
  .pie-legend-item:hover { background: #F8F9FA; transform: translateX(4px); }
  .barChartContainer:hover, .pieChartContainer:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
  .pie-slice { transition: transform 0.3s ease, filter 0.3s ease; cursor: pointer; }
  .pie-slice:hover { transform: scale(1.02); filter: brightness(1.05); }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #C8410A; }
  .file-upload-area:hover { border-color: #C8410A; background: #FFF5F0; }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #F1F1F1; }
  ::-webkit-scrollbar-thumb { background: #C8410A; border-radius: 10px; }
  
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .pie-svg-wrapper { width: 120px !important; height: 120px !important; }
  }
  
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .products-grid { gap: 12px !important; }
    .product-image { height: 120px !important; }
    .product-info { padding: 10px !important; }
  }
  
  th { text-align: left; padding: 10px 8px; color: #6C757D; font-weight: 600; font-size: 0.7rem; background: #F8F9FA; }
  td { padding: 10px 8px; border-bottom: 1px solid #F0F0F0; }
`;
document.head.appendChild(styleSheet);