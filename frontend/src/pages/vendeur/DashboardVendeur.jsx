import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import { 
  MdBarChart, MdNotifications, MdLogout, MdInventory, 
  MdShoppingCart, MdTrendingUp, MdAdd, MdInfo, MdImage, 
  MdCalendarToday, MdPieChart, MdCheckCircle,
  MdClose, MdWarning, MdDelete, MdEdit, MdHome,
  MdArrowBack, MdSearch, MdAccessTime, MdRefresh
} from 'react-icons/md';
import logot from '../../assets/images/logot.jpg';

// Composant BarChart
function BarChart({ title, data = [], icon }) {
  if (!data.length) return (
    <div style={styles.emptyChart}>
      <MdBarChart size={40} color="#CBD5E1" />
      <p style={styles.emptyChartText}>Aucune donnée de vente</p>
      <p style={styles.emptyChartSubtext}>Les ventes apparaîtront ici</p>
    </div>
  );

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const svgW = Math.max(500, data.length * 60);
  const svgH = 300;
  const margin = { top: 40, right: 20, bottom: 60, left: 56 };
  const innerH = svgH - margin.top - margin.bottom;
  const bandW = (svgW - margin.left - margin.right) / data.length;
  const barW = Math.max(8, Math.min(40, bandW * 0.5));
  const bestIndex = values.indexOf(Math.max(...values));

  return (
    <div style={styles.barChartContainer}>
      <div style={styles.chartCardHeader}>
        <div>
          <div style={styles.chartTitle}>
            <div style={{ ...styles.chartIconBg, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {icon ? React.createElement(icon, { size: 16, color: '#fff' }) : null}
            </div>
            <span>{title}</span>
          </div>
          <div style={styles.chartSubtitle}>Évolution mensuelle des ventes</div>
        </div>
        <div style={styles.chartLegend}>
          <span style={{ ...styles.legendDot, background: '#667eea' }} />
          <span style={styles.legendText}>Ventes (unités)</span>
        </div>
      </div>

      <div style={{ padding: '4px 0 6px', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style={{ minWidth: '300px' }}>
          <defs>
            <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>

          {[0,1,2,3].map(i => {
            const y = margin.top + (i * innerH / 3);
            const valueLabel = Math.round(maxVal - (i * (maxVal / 3)));
            return (
              <g key={i}>
                <line x1={margin.left} x2={svgW - margin.right} y1={y} y2={y} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 4" />
                <text x={margin.left - 10} y={y + 3} fontSize="10" fill="#94A3B8" textAnchor="end">{valueLabel}</text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const barH = (d.value / maxVal) * innerH;
            const x = margin.left + i * bandW + (bandW - barW) / 2;
            const y = margin.top + (innerH - barH);
            const isBest = i === bestIndex;
            return (
              <g key={i} className="svg-bar-group">
                <rect x={x} y={margin.top + innerH} width={barW} height={0} fill="url(#barGrad)" rx={4}>
                  <title>{`${d.label}: ${d.value} ventes`}</title>
                  <animate attributeName="y" from={margin.top + innerH} to={y} dur="0.8s" fill="freeze" begin={`${i * 0.06}s`} />
                  <animate attributeName="height" from="0" to={barH} dur="0.8s" fill="freeze" begin={`${i * 0.06}s`} />
                </rect>
                {isBest && (
                  <g>
                    <rect x={x - 5} y={y - 24} rx={6} width={barW + 10} height={20} fill="#667eea" />
                    <text x={x + barW / 2} y={y - 10} fontSize="9" fill="#fff" fontWeight="700" textAnchor="middle">⭐ Meilleur</text>
                  </g>
                )}
              </g>
            );
          })}

          {data.map((d, i) => {
            const x = margin.left + i * bandW + bandW / 2;
            const y = margin.top + innerH + 20;
            return <text key={i} x={x} y={y} fontSize="10" fill="#64748B" textAnchor="middle" fontWeight="500">{d.label}</text>;
          })}
          <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} stroke="#E2E8F0" strokeWidth={1} />
        </svg>
      </div>
    </div>
  );
}

// Composant PieChart
function PieChart({ title, data = [], total, icon, onRefresh }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  if (!data.length) return (
    <div style={styles.emptyChart}>
      <MdPieChart size={48} color="#CBD5E1" />
      <p style={styles.emptyChartText}>Aucune donnée de catégorie</p>
      <p style={styles.emptyChartSubtext}>Les ventes apparaîtront ici</p>
      <button onClick={onRefresh} style={styles.refreshEmptyBtn}>
        <MdRefresh size={16} /> Actualiser
      </button>
    </div>
  );
  
  const colors = ['#FF6B35', '#F7931E', '#FFC300', '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#1ABC9C', '#E67E22', '#27AE60', '#1E3A5F', '#8B5CF6'];
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
    const x1 = 100 + 85 * Math.cos(startRad);
    const y1 = 100 + 85 * Math.sin(startRad);
    const x2 = 100 + 85 * Math.cos(endRad);
    const y2 = 100 + 85 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 100 100 L ${x1} ${y1} A 85 85 0 ${largeArc} 1 ${x2} ${y2} Z`;
    slices.push({ 
      path: pathData, 
      color: colors[idx % colors.length], 
      label: item.label, 
      percentage, 
      value: item.value,
      index: idx
    });
  });

  return (
    <div style={styles.pieChartContainer}>
      <div style={styles.chartCardHeader}>
        <div style={styles.chartTitle}>
          <div style={styles.chartIconBg}>{icon ? React.createElement(icon, { size: 18, color: '#C8410A' }) : null}</div>
          <span>{title}</span>
        </div>
        <div style={styles.chartHeaderRight}>
          <button onClick={onRefresh} style={styles.refreshBtn} title="Rafraîchir">
            <MdRefresh size={16} />
          </button>
          <div style={styles.chartTotal}>{total.toLocaleString('fr-FR')} FCFA</div>
        </div>
      </div>
      
      <div style={styles.pieChartLayout}>
        <div style={styles.pieLegendList}>
          {slices.map((slice, i) => (
            <div 
              key={i} 
              style={{ 
                ...styles.pieLegendItem,
                background: hoveredSlice === i ? '#FFF5F0' : 'transparent',
              }}
              className="pie-legend-item"
              onMouseEnter={() => setHoveredSlice(i)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <span style={{ ...styles.pieLegendColor, backgroundColor: slice.color }}></span>
              <div style={styles.pieLegendContent}>
                <span style={styles.pieLegendLabel}>{slice.label}</span>
                <div style={styles.pieLegendStats}>
                  <span style={styles.pieLegendPercent}>{slice.percentage.toFixed(1)}%</span>
                  <span style={styles.pieLegendValue}>{slice.value.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={styles.pieChartRight}>
          <div style={styles.pieSvgWrapper}>
            <svg viewBox="0 0 200 200" style={styles.pieSvg}>
              <defs>
                <filter id="pieShadow">
                  <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15"/>
                </filter>
              </defs>
              {slices.map((slice, i) => (
                <path 
                  key={i} 
                  d={slice.path} 
                  fill={slice.color} 
                  filter="url(#pieShadow)"
                  className="pie-slice"
                  style={{
                    transform: hoveredSlice === i ? 'scale(1.03)' : 'scale(1)',
                    transformOrigin: '100px 100px',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardVendeur() {
  const navigate = useNavigate();
  const { user, deconnexion } = useAuth();
  const [produits, setProduits] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchProduit, setSearchProduit] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const produitsCommandes = new Set(
    ventes.flatMap((vente) =>
      (vente.lignes || []).map((ligne) => String(ligne.produit?._id || ligne.produit || ''))
    )
  );
  const produitEstCommande = (produitId) => produitsCommandes.has(String(produitId));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-wrapper')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

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
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.info('Actualisation des données...');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Array.from(images || []).forEach((img) => data.append('images', img));
    try {
      if (editingProduit) {
        await api.put(`/produits/${editingProduit._id}`, data);
        toast.success('Produit modifié avec succès.');
      } else {
        await api.post('/produits', data);
        toast.success('Produit envoyé pour publication.');
      }
      setShowModal(false);
      setEditingProduit(null);
      setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' });
      setImages([]);
      chargerMesProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
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
      toast.success('Produit supprimé.');
      setShowDetailModal(false);
      chargerMesProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => deconnexion(), 500);
  };

  const marquerToutLu = async () => {
    try {
      await api.put('/notifications/tout-lire');
      chargerNotifications();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch {
      toast.error('Erreur lors de la lecture des notifications');
    }
  };

  const ouvrirNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  const revenu = ventes.reduce((s, v) => s + (v.montantVendeur || 0), 0);
  const peutPublier = user?.role === 'admin' || user?.statutVendeur === 'approuve';
  const totalCommandes = ventes.length;

  const ventesParMois = () => {
    const mois = {};
    ventes.forEach(v => {
      if (v.createdAt) {
        const date = new Date(v.createdAt);
        const moisKey = date.toLocaleString('fr-FR', { month: 'short' });
        mois[moisKey] = (mois[moisKey] || 0) + 1;
      }
    });
    const ordered = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const currentMonthIndex = new Date().getMonth();
    return ordered.slice(0, currentMonthIndex + 1).map(m => ({ label: m, value: mois[m] || 0 }));
  };
  
  // Fonction robuste pour récupérer toutes les catégories
  const ventesParCategorie = () => {
    const cats = {};
    
    // Mapping pour standardiser les noms de catégories
    const categoryMapping = {
      'Électronique': ['Électronique', 'Electronique', 'electronique', 'électronique', 'Electronique', 'Smartphone', 'Ordinateur', 'Tablette', 'iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Téléphone', 'Laptop', 'PC', 'Ordinateur portable'],
      'Vêtements': ['Vêtements', 'Vetements', 'vêtements', 'vetements', 'Mode', 'Habillement', 'Accessoire', 'T-shirt', 'Chemise', 'Pantalon', 'Robe', 'Jupe', 'Veste', 'Manteau', 'Chaussure', 'Basket'],
      'Alimentation': ['Alimentation', 'alimentation', 'Nourriture', 'nourriture', 'Riz', 'Pâtes', 'Farine', 'Sucre', 'Huile', 'Lait', 'Café', 'Thé', 'Jus', 'Eau', 'Fruit', 'Légume'],
      'Electromenager': ['Electromenager', 'electromenager', 'Électroménager', 'électroménager', 'Appareil ménager', 'Réfrigérateur', 'Four', 'Micro-ondes', 'Lave-linge', 'Lave-vaisselle', 'Aspirateur', 'Fer à repasser', 'Cafetière'],
      'Beauté': ['Beauté', 'Beaute', 'beauté', 'beaute', 'Cosmétique', 'Parfum', 'Soin', 'Crème', 'Maquillage', 'Rouge à lèvres', 'Shampooing', 'Savon'],
      'Immobilier': ['Immobilier', 'immobilier', 'Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Local', 'Studio'],
      'Sport': ['Sport', 'sport', 'Sports', 'Fitness', 'Vélo', 'Ballon', 'Tapis', 'Haltère', 'Gant', 'Maillot', 'Chaussure de sport'],
      'Autre': ['Autre', 'autre', 'Other', 'other', 'Divers', 'undefined', 'null', '']
    };
    
    const normalizeCategory = (cat) => {
      if (!cat || cat === 'undefined' || cat === 'null') return 'Autre';
      for (const [standard, variantes] of Object.entries(categoryMapping)) {
        if (variantes.some(v => v.toLowerCase() === cat.toLowerCase())) {
          return standard;
        }
      }
      return cat;
    };
    
    ventes.forEach(vente => {
      if (!vente.lignes || vente.lignes.length === 0) return;
      
      vente.lignes.forEach(ligne => {
        let categorie = 'Autre';
        
        // Essayer toutes les sources possibles pour trouver la catégorie
        if (ligne.categorie && typeof ligne.categorie === 'string' && ligne.categorie.trim() !== '' && ligne.categorie !== 'undefined') {
          categorie = ligne.categorie;
        }
        else if (ligne.produit && typeof ligne.produit === 'object') {
          if (ligne.produit.categorie && ligne.produit.categorie.trim() !== '' && ligne.produit.categorie !== 'undefined') {
            categorie = ligne.produit.categorie;
          }
        }
        else if (ligne.produit && typeof ligne.produit === 'string') {
          const produitTrouve = produits.find(p => p._id === ligne.produit);
          if (produitTrouve && produitTrouve.categorie) {
            categorie = produitTrouve.categorie;
          }
        }
        else if (ligne.nomProduit) {
          // Déduire du nom du produit
          const nomLower = ligne.nomProduit.toLowerCase();
          if (nomLower.includes('iphone') || nomLower.includes('samsung') || nomLower.includes('ordinateur') || nomLower.includes('laptop') || nomLower.includes('smartphone')) {
            categorie = 'Électronique';
          } else if (nomLower.includes('t-shirt') || nomLower.includes('chemise') || nomLower.includes('pantalon') || nomLower.includes('robe')) {
            categorie = 'Vêtements';
          } else if (nomLower.includes('riz') || nomLower.includes('pâtes') || nomLower.includes('farine') || nomLower.includes('sucre')) {
            categorie = 'Alimentation';
          } else if (nomLower.includes('réfrigérateur') || nomLower.includes('four') || nomLower.includes('lave-linge') || nomLower.includes('micro-ondes')) {
            categorie = 'Electromenager';
          } else if (nomLower.includes('parfum') || nomLower.includes('crème') || nomLower.includes('maquillage')) {
            categorie = 'Beauté';
          } else if (nomLower.includes('maison') || nomLower.includes('appartement') || nomLower.includes('terrain')) {
            categorie = 'Immobilier';
          } else if (nomLower.includes('ballon') || nomLower.includes('vélo') || nomLower.includes('sport')) {
            categorie = 'Sport';
          }
        }
        
        // Normaliser la catégorie
        categorie = normalizeCategory(categorie);
        
        // Calculer le montant
        const quantite = ligne.quantite || 1;
        const prixUnitaire = ligne.prixUnitaire || ligne.prix || 0;
        const montant = prixUnitaire * quantite;
        
        // Fusionner les montants pour la même catégorie
        if (cats[categorie]) {
          cats[categorie] += montant;
        } else {
          cats[categorie] = montant;
        }
      });
    });
    
    // Convertir en tableau, filtrer les valeurs nulles et trier
    let result = Object.entries(cats)
      .map(([label, value]) => ({ label, value }))
      .filter(item => item.value > 0);
    
    // Trier par valeur décroissante
    result.sort((a, b) => b.value - a.value);
    
    return result;
  };
  
  const monthlyData = ventesParMois();
  const categoryData = ventesParCategorie();
  const totalCategorie = categoryData.reduce((s, i) => s + i.value, 0);
  const produitsFiltres = produits.filter(p => p.nom?.toLowerCase().includes(searchProduit.toLowerCase()));

  const getMonths = () => {
    return ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  };

  const getAvailableYears = () => {
    const years = new Set();
    ventes.forEach(v => {
      if (v.createdAt) {
        years.add(new Date(v.createdAt).getFullYear());
      }
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  };

  const getVentesByMonth = (month, year) => {
    return ventes.filter(v => {
      if (!v.createdAt) return false;
      const date = new Date(v.createdAt);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const ventesFiltrees = getVentesByMonth(selectedMonth, selectedYear);
  const months = getMonths();
  const availableYears = getAvailableYears();

  return (
    <>
      {currentView === 'dashboard' && (
        <div style={{ ...styles.container, paddingBottom: '80px' }}>
          <header style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.logoWrapper}><img src={logot} alt="TeyShop" style={styles.logoImageHeader} /></div>
              <div>
                <h1 style={{ ...styles.headerTitle, fontSize: isSmallMobile ? '1.1rem' : (isMobile ? '1.3rem' : '1.6rem') }}>Tableau de bord</h1>
                {!isSmallMobile && <p style={styles.headerSubtitle}>Aperçu de votre activité</p>}
              </div>
            </div>
            <div style={styles.headerRight}>
              <div style={styles.userSection}>
                <div className="notification-wrapper" style={styles.notificationWrapper}>
                  <button onClick={ouvrirNotifications} style={{ ...styles.bellButton, width: isSmallMobile ? '36px' : (isMobile ? '38px' : '42px'), height: isSmallMobile ? '36px' : (isMobile ? '38px' : '42px') }} title="Notifications">
                    <MdNotifications size={isSmallMobile ? 16 : (isMobile ? 18 : 20)} color="#475569" />
                    {nonLues > 0 && (<span style={{ ...styles.bellBadge, minWidth: isSmallMobile ? '16px' : '20px', height: isSmallMobile ? '16px' : '20px', fontSize: isSmallMobile ? '0.55rem' : '0.65rem', top: isSmallMobile ? '-4px' : '-5px', right: isSmallMobile ? '-4px' : '-5px' }}>{nonLues > 9 ? '9+' : nonLues}</span>)}
                  </button>
                  {showNotifications && (
                    <div style={{ ...styles.notificationDropdown, width: isSmallMobile ? '280px' : (isMobile ? '300px' : '360px'), right: isSmallMobile ? '-10px' : (isMobile ? '-15px' : '0') }}>
                      <div style={styles.notificationDropdownHeader}>
                        <div><div style={styles.notificationDropdownTitle}>Notifications</div><div style={styles.notificationDropdownSub}>{nonLues} non lue(s)</div></div>
                        {nonLues > 0 && (<button onClick={marquerToutLu} style={styles.markReadBtn}>Tout lire</button>)}
                      </div>
                      <div style={styles.notificationDropdownList}>
                        {notifications.length === 0 ? (<div style={styles.emptyNotification}>Aucune notification pour le moment</div>) : (
                          notifications.slice(0, 8).map((notification) => (<div key={notification._id} style={{ ...styles.notificationItem, background: notification.lu ? '#fff' : '#FEF3F2' }}><div style={styles.notificationTitle}>{notification.titre}</div><div style={styles.notificationMessage}>{notification.message}</div><div style={styles.notificationDate}>{new Date(notification.createdAt).toLocaleString('fr-FR')}</div></div>))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {!isSmallMobile && (<div style={styles.userInfo}><img src={user?.photoProfil ? mediaUrl(user.photoProfil) : 'https://via.placeholder.com/40'} style={styles.avatar} alt="profil" /><div><p style={styles.userName}>{user?.prenom} {user?.nom}</p><span style={{ ...styles.userStatus, color: peutPublier ? '#10B981' : '#F59E0B' }}><span style={styles.statusDot}></span>{peutPublier ? 'Vendeur approuvé' : 'Validation en attente'}</span></div></div>)}
                <button onClick={handleLogout} style={{ ...styles.logoutBtn, padding: isSmallMobile ? '6px 10px' : (isMobile ? '8px 14px' : '8px 16px'), gap: isSmallMobile ? '4px' : '8px' }} className="logout-btn"><MdLogout size={isSmallMobile ? 14 : (isMobile ? 16 : 18)} />{!isSmallMobile && <span>{isLoggingOut ? '...' : 'Déconnexion'}</span>}{isLoggingOut && <div style={styles.spinner}></div>}</button>
              </div>
            </div>
          </header>

          <div style={{ ...styles.statsGrid, gridTemplateColumns: isSmallMobile ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)') }}>
            {[
              { label: 'Mes produits', value: produits.length, icon: MdInventory, color: '#6366F1', borderColor: '#6366F1', suffix: '', bg: '#EEF2FF', onClick: () => setCurrentView('produits') },
              { label: isMobile ? 'Commandes' : 'Commandes reçues', value: totalCommandes, icon: MdShoppingCart, color: '#06B6D4', borderColor: '#06B6D4', suffix: '', bg: '#ECFEFF', onClick: () => setCurrentView('commandes') },
              { label: 'Chiffre d\'affaires', value: revenu.toLocaleString('fr-FR'), icon: MdTrendingUp, color: '#10B981', borderColor: '#10B981', suffix: 'FCFA', bg: '#ECFDF5' }
            ].map((stat, idx) => (
              <div key={idx} style={{ ...styles.statCard, transform: hoveredStat === idx ? 'translateY(-6px)' : 'translateY(0)', borderLeft: `4px solid ${stat.borderColor}`, padding: isSmallMobile ? '14px' : (isMobile ? '16px' : '20px'), cursor: 'pointer' }} onMouseEnter={() => setHoveredStat(idx)} onMouseLeave={() => setHoveredStat(null)} onClick={stat.onClick}>
                <div style={{ ...styles.statIcon, width: isSmallMobile ? '44px' : (isMobile ? '48px' : '56px'), height: isSmallMobile ? '44px' : (isMobile ? '48px' : '56px') }}>{React.createElement(stat.icon, { size: isSmallMobile ? 20 : (isMobile ? 22 : 26), color: stat.color })}</div>
                <div style={styles.statInfo}><div style={{ ...styles.statNumber, fontSize: isSmallMobile ? '1.2rem' : (isMobile ? '1.5rem' : '1.9rem') }}>{stat.value}</div><div style={{ ...styles.statLabel, fontSize: isSmallMobile ? '0.65rem' : (isMobile ? '0.7rem' : '0.8rem') }}>{stat.label}</div>{stat.suffix && <div style={styles.statSuffix}>{stat.suffix}</div>}</div>
              </div>
            ))}
            <button onClick={() => { setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); setShowModal(true); }} disabled={!peutPublier} style={{ ...styles.addBtnLarge, opacity: peutPublier ? 1 : 0.6, cursor: peutPublier ? 'pointer' : 'not-allowed', padding: isSmallMobile ? '16px 12px' : (isMobile ? '18px 14px' : '24px 20px'), minHeight: isSmallMobile ? '70px' : (isMobile ? '80px' : '96px'), fontSize: isSmallMobile ? '0.8rem' : (isMobile ? '0.9rem' : '1rem') }} className="add-btn"><MdAdd size={isSmallMobile ? 18 : (isMobile ? 20 : 24)} /><span>{isSmallMobile ? 'Ajouter' : (isMobile ? 'Ajouter produit' : 'Nouveau produit')}</span></button>
          </div>

          <div style={{ ...styles.chartsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '20px' : '24px' }}>
            <div style={styles.chartWrapper}>
              <BarChart title="Ventes mensuelles" data={monthlyData} icon={MdCalendarToday} />
              {monthlyData.length === 0 && (<div style={styles.chartHint}><MdInfo size={14} /><span>Les ventes apparaîtront ici</span></div>)}
            </div>
            <div style={styles.chartWrapper}>
              <PieChart title="Répartition par catégorie" data={categoryData} total={totalCategorie} icon={MdPieChart} onRefresh={handleRefresh} />
              {categoryData.length === 0 && (<div style={styles.chartHint}><MdInfo size={14} /><span>Les catégories apparaîtront ici</span></div>)}
            </div>
          </div>

          <div style={styles.bottomNav}>
            <button onClick={() => setCurrentView('produits')} style={styles.bottomNavBtn} className="bottom-nav-btn"><MdInventory size={22} /><span>Mes produits</span></button>
            <button onClick={() => setCurrentView('commandes')} style={styles.bottomNavBtn} className="bottom-nav-btn"><MdShoppingCart size={22} /><span>Commandes</span></button>
          </div>
        </div>
      )}

      {currentView === 'produits' && (
        <div style={{ ...styles.pageContainer, paddingBottom: '80px' }}>
          <div style={styles.pageHeader}>
            <button onClick={() => setCurrentView('dashboard')} style={styles.backBtn}><MdArrowBack size={20} /></button>
            <h2 style={styles.pageTitle}>Mes produits</h2>
            <button onClick={() => { setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); setShowModal(true); }} style={styles.addProductBtn}><MdAdd size={20} /></button>
          </div>
          
          <div style={styles.searchBarWrapper}>
            <div style={styles.searchInputWrapper}>
              <MdSearch size={18} color="#94A3B8" style={styles.searchIcon} />
              <input type="text" placeholder="Rechercher un produit..." value={searchProduit} onChange={(e) => setSearchProduit(e.target.value)} style={styles.searchInput} />
              {searchProduit && (<button onClick={() => setSearchProduit('')} style={styles.clearSearchBtn}><MdClose size={16} /></button>)}
            </div>
          </div>

          {produitsFiltres.length === 0 ? (
            <div style={styles.emptyState}>
              <MdInventory size={56} color="#CBD5E1" />
              <p style={styles.emptyStateTitle}>{searchProduit ? 'Aucun produit trouvé' : 'Aucun produit'}</p>
              {!searchProduit && (<button onClick={() => { setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); setShowModal(true); }} style={styles.emptyStateBtn}>Ajouter mon premier produit</button>)}
            </div>
          ) : (
            <div style={{ ...styles.productsGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {produitsFiltres.map(p => {
                const estCommande = produitEstCommande(p._id);
                return (
                  <div key={p._id} style={styles.productCard} className="product-card" onClick={() => { setSelectedProduit(p); setShowDetailModal(true); }}>
                    <div style={styles.productImage}>
                      {p.images?.[0] ? (<img src={mediaUrl(p.images[0])} alt={p.nom} style={styles.productImageImg} />) : (<div style={styles.productImagePlaceholder}><MdImage size={32} color="#CBD5E1" /></div>)}
                      <div style={{ ...styles.productStatus, background: p.actif ? '#10B981' : '#EF4444' }}>{p.actif ? 'En ligne' : 'Hors ligne'}</div>
                      {estCommande && (<div style={styles.commandeBadge}><MdShoppingCart size={12} /> Commandé</div>)}
                    </div>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productName}>{p.nom}</h3>
                      <p style={styles.productCategory}>{p.categorie}</p>
                      <div style={styles.productDetails}><span style={styles.productPrice}>{Number(p.prix).toLocaleString('fr-FR')} FCFA</span><span style={styles.productStock}>Stock: {p.stock}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={styles.bottomNav}>
            <button onClick={() => setCurrentView('produits')} style={{...styles.bottomNavBtn, color: '#C8410A'}} className="bottom-nav-btn"><MdInventory size={22} /><span>Mes produits</span></button>
            <button onClick={() => setCurrentView('commandes')} style={styles.bottomNavBtn} className="bottom-nav-btn"><MdShoppingCart size={22} /><span>Commandes</span></button>
          </div>
        </div>
      )}

      {currentView === 'commandes' && (
        <div style={{ ...styles.pageContainer, paddingBottom: '80px' }}>
          <div style={styles.pageHeader}>
            <button onClick={() => setCurrentView('dashboard')} style={styles.backBtn}><MdArrowBack size={20} /></button>
            <h2 style={styles.pageTitle}>Commandes reçues</h2>
            <div style={{ width: '36px' }}></div>
          </div>

          <div style={styles.filtersSection}>
            <div style={styles.filterTitle}><MdAccessTime size={16} /><span>Période</span></div>
            <div style={styles.filtersRow}>
              <div style={styles.filterGroup}><label>Mois :</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={styles.filterSelect}>{months.map((month, idx) => (<option key={idx} value={idx}>{month}</option>))}</select></div>
              <div style={styles.filterGroup}><label>Année :</label><select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={styles.filterSelect}>{availableYears.map(year => (<option key={year} value={year}>{year}</option>))}</select></div>
              <button onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} style={styles.resetFilterBtn}>Mois en cours</button>
            </div>
          </div>

          {ventesFiltrees.length === 0 ? (
            <div style={styles.emptyState}>
              <MdShoppingCart size={56} color="#CBD5E1" />
              <p style={styles.emptyStateTitle}>Aucune commande pour {months[selectedMonth]} {selectedYear}</p>
              <p style={styles.emptyStateSubtext}>Les commandes apparaîtront ici</p>
            </div>
          ) : (
            <div style={styles.ordersList}>
              <div style={styles.monthHeader}><h3>{months[selectedMonth]} {selectedYear}</h3><span style={styles.monthCount}>{ventesFiltrees.length} commande(s)</span></div>
              {ventesFiltrees.map(v => (
                <div key={v._id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div><span style={styles.orderRef}>#{v._id.slice(-8).toUpperCase()}</span><span style={styles.orderDate}><MdAccessTime size={12} />{new Date(v.createdAt).toLocaleDateString('fr-FR')}</span></div>
                    <span style={{ ...styles.orderStatus, background: v.statut === 'livree' ? '#10B981' : v.statut === 'expediee' ? '#06B6D4' : v.statut === 'annulee' ? '#EF4444' : '#F59E0B' }}>{v.statut?.replace('_', ' ')}</span>
                  </div>
                  <div style={styles.orderProducts}>
                    {v.lignes?.map((l, idx) => (
                      <div key={idx} style={styles.orderProduct}>
                        <div style={styles.orderProductInfo}><span style={styles.orderProductName}>{l.nomProduit}</span><span style={styles.orderProductQty}>x{l.quantite}</span></div>
                        <span style={styles.orderProductPrice}>{(l.prixUnitaire * l.quantite).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.orderFooter}><span style={styles.orderTotalLabel}>Total</span><span style={styles.orderTotal}>{Number(v.montantVendeur || 0).toLocaleString('fr-FR')} FCFA</span></div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.bottomNav}>
            <button onClick={() => setCurrentView('produits')} style={styles.bottomNavBtn} className="bottom-nav-btn"><MdInventory size={22} /><span>Mes produits</span></button>
            <button onClick={() => setCurrentView('commandes')} style={{...styles.bottomNavBtn, color: '#C8410A'}} className="bottom-nav-btn"><MdShoppingCart size={22} /><span>Commandes</span></button>
          </div>
        </div>
      )}

      {showDetailModal && selectedProduit && (
        <div style={styles.overlay} onClick={() => { setShowDetailModal(false); setSelectedProduit(null); }}>
          <div style={{ ...styles.modalDetail, maxWidth: isMobile ? '92%' : '600px', margin: isMobile ? '16px' : '0' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>{selectedProduit.nom}</h3>
              <button style={styles.modalClose} onClick={() => { setShowDetailModal(false); setSelectedProduit(null); }}><MdClose size={20} /></button>
            </div>
            <div style={{ ...styles.productDetailContent, flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '20px' : '28px' }}>
              {selectedProduit.images?.[0] && (<img src={mediaUrl(selectedProduit.images[0])} alt={selectedProduit.nom} style={{ ...styles.productDetailImage, width: isMobile ? '100%' : '200px', height: isMobile ? '200px' : '200px', marginBottom: isMobile ? '20px' : 0, borderRadius: '16px' }} />)}
              <div style={styles.productDetailInfo}>
                <p><strong>Marque:</strong> {selectedProduit.marque || 'Non spécifiée'}</p>
                <p><strong>Catégorie:</strong> {selectedProduit.categorie}</p>
                <p><strong>Prix:</strong> <span style={styles.detailPrice}>{Number(selectedProduit.prix).toLocaleString('fr-FR')} FCFA</span></p>
                <p><strong>Stock:</strong> {selectedProduit.stock} unités</p>
                {!isSmallMobile && <p><strong>Description:</strong> {selectedProduit.description}</p>}
                <p><strong>Statut:</strong> <span style={{ ...styles.productDetailStatus, background: selectedProduit.actif ? '#10B981' : '#EF4444' }}>{selectedProduit.actif ? 'En ligne' : 'Hors ligne'}</span></p>
                <div style={styles.detailActions}>
                  <button disabled={produitEstCommande(selectedProduit._id)} onClick={() => ouvrirEdition(selectedProduit)} style={{ ...styles.editBtn, opacity: produitEstCommande(selectedProduit._id) ? 0.5 : 1, cursor: produitEstCommande(selectedProduit._id) ? 'not-allowed' : 'pointer', padding: isMobile ? '8px 16px' : '10px 20px', fontSize: isMobile ? '0.75rem' : '0.85rem' }}><MdEdit size={16} /> Modifier</button>
                  <button disabled={produitEstCommande(selectedProduit._id)} onClick={() => supprimerProduit(selectedProduit)} style={{ ...styles.deleteBtn, opacity: produitEstCommande(selectedProduit._id) ? 0.5 : 1, cursor: produitEstCommande(selectedProduit._id) ? 'not-allowed' : 'pointer', padding: isMobile ? '8px 16px' : '10px 20px', fontSize: isMobile ? '0.75rem' : '0.85rem' }}><MdDelete size={16} /> Supprimer</button>
                </div>
                {produitEstCommande(selectedProduit._id) && (<p style={styles.lockHint}><MdWarning size={14} /> Ce produit a déjà été commandé et ne peut plus être modifié ou supprimé.</p>)}
                {!selectedProduit.actif && !produitEstCommande(selectedProduit._id) && (<p style={styles.infoHint}><MdInfo size={14} /> Ce produit est actuellement hors ligne. Vous pouvez le modifier pour le remettre en ligne.</p>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={styles.overlay} onClick={() => { setShowModal(false); setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); }}>
          <div style={{ ...styles.modal, maxWidth: isMobile ? '92%' : '550px', margin: isMobile ? '16px' : '0' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>{editingProduit ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button style={styles.modalClose} onClick={() => { setShowModal(false); setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); }}><MdClose size={20} /></button>
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
                  <MdImage size={28} color="#C8410A" />
                  <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', marginTop: '8px' }}>Cliquez ou glissez des images</p>
                  <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} style={styles.fileInput} />
                </div>
                {images.length > 0 && (<div style={styles.imagePreview}>{Array.from(images).map((img, idx) => (<span key={idx} style={styles.imagePreviewItem}>{img.name}</span>))}</div>)}
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => { setShowModal(false); setEditingProduit(null); setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '', marque: '' }); setImages([]); }} style={styles.cancelBtn}>Annuler</button>
                <button type="submit" disabled={loading} style={styles.confirmBtn}>{loading ? 'Chargement...' : (editingProduit ? 'Enregistrer' : 'Publier le produit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: { background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', 'Poppins', -apple-system, sans-serif" },
  header: { background: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '16px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  logoWrapper: { width: '44px', height: '44px', background: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E2E8F0' },
  logoImageHeader: { width: '100%', height: '100%', objectFit: 'cover' },
  headerTitle: { fontSize: '1.6rem', fontWeight: '700', color: '#0F172A', margin: 0 },
  headerSubtitle: { fontSize: '0.75rem', color: '#64748B', margin: '4px 0 0' },
  userSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: '#F8FAFC', borderRadius: '50px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C8410A' },
  userName: { margin: 0, fontWeight: '600', fontSize: '0.8rem', color: '#1E293B' },
  userStatus: { fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #FEE2E2', color: '#EF4444', background: '#FEF2F2', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.8rem', fontWeight: '500' },
  spinner: { width: '14px', height: '14px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  statsGrid: { display: 'grid', gap: '20px', padding: '28px 32px 0 32px', marginBottom: '8px' },
  statCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', borderLeft: '4px solid' },
  statIcon: { width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statNumber: { fontSize: '1.9rem', fontWeight: '800', color: '#0F172A', lineHeight: 1.2 },
  statLabel: { fontSize: '0.8rem', color: '#64748B', marginTop: '6px', fontWeight: '500' },
  statSuffix: { fontSize: '0.65rem', color: '#94A3B8', marginTop: '2px' },
  addBtnLarge: { background: 'linear-gradient(135deg, #C8410A 0%, #E8622A 100%)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease', boxShadow: '0 4px 14px rgba(200, 65, 10, 0.25)', width: '100%', minHeight: '96px' },
  chartsGrid: { display: 'grid', gap: '24px', padding: '28px 32px 0 32px' },
  chartWrapper: { position: 'relative' },
  chartHint: { marginTop: '12px', padding: '10px', background: '#FEF3F2', borderRadius: '12px', fontSize: '0.7rem', color: '#C8410A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '500' },
  barChartContainer: { background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s ease', height: '100%', border: '1px solid #F1F5F9' },
  pieChartContainer: { background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s ease', height: '100%', border: '1px solid #F1F5F9' },
  chartCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  chartTitle: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' },
  chartSubtitle: { fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: '500' },
  chartIconBg: { width: '30px', height: '30px', background: '#FFF5F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chartLegend: { display: 'flex', alignItems: 'center', gap: '8px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  legendText: { fontSize: '0.7rem', color: '#64748B', fontWeight: '500' },
  chartTotal: { fontSize: '0.75rem', fontWeight: '600', color: '#C8410A', padding: '4px 12px', background: '#FEF3F2', borderRadius: '20px' },
  chartHeaderRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  refreshBtn: { background: '#F1F5F9', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: '#64748B' },
  refreshEmptyBtn: { marginTop: '12px', padding: '8px 16px', background: '#C8410A', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '500', margin: '0 auto' },
  
  pieChartLayout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  pieChartRight: {
    flexShrink: 0,
  },
  pieSvgWrapper: { 
    width: '200px', 
    height: '200px', 
    flexShrink: 0 
  },
  pieSvg: { 
    width: '100%', 
    height: '100%', 
    transform: 'rotate(-90deg)' 
  },
  pieLegendList: { 
    flex: 1,
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '8px',
  },
  pieLegendItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 12px', 
    borderRadius: '12px', 
    transition: 'all 0.2s ease', 
    cursor: 'pointer',
    borderBottom: '1px solid #F1F5F9',
  },
  pieLegendColor: { 
    width: '12px', 
    height: '12px', 
    borderRadius: '3px', 
    flexShrink: 0 
  },
  pieLegendContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pieLegendLabel: { 
    color: '#475569', 
    fontWeight: '600', 
    fontSize: '0.85rem' 
  },
  pieLegendStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pieLegendPercent: { 
    fontWeight: '700', 
    color: '#C8410A', 
    fontSize: '0.8rem' 
  },
  pieLegendValue: { 
    fontSize: '0.7rem', 
    color: '#94A3B8',
    fontWeight: '500',
  },
  
  emptyChart: { padding: '60px 20px', textAlign: 'center', color: '#CBD5E1' },
  emptyChartText: { fontSize: '0.85rem', fontWeight: '500', marginTop: '12px', color: '#94A3B8' },
  emptyChartSubtext: { fontSize: '0.7rem', marginTop: '6px', color: '#CBD5E1' },
  
  pageContainer: { background: '#F8FAFC', minHeight: '100vh', padding: '20px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#0F172A', margin: 0 },
  backBtn: { background: '#F1F5F9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  addProductBtn: { background: 'linear-gradient(135deg, #C8410A, #E8622A)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease' },
  
  filtersSection: { background: '#fff', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #F1F5F9' },
  filterTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#1E293B', marginBottom: '12px' },
  filtersRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569' },
  filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' },
  resetFilterBtn: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #C8410A', background: '#fff', color: '#C8410A', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' },
  monthHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #E2E8F0' },
  monthCount: { fontSize: '0.75rem', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '20px' },
  
  searchBarWrapper: { marginBottom: '24px' },
  searchInputWrapper: { position: 'relative', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: { width: '100%', padding: '12px 40px 12px 44px', borderRadius: '50px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none', background: '#fff' },
  clearSearchBtn: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' },
  
  productsGrid: { display: 'grid', gap: '20px' },
  productCard: { background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F1F5F9', transition: 'all 0.2s ease', cursor: 'pointer' },
  productImage: { position: 'relative', height: '160px', background: '#F8FAFC' },
  productImageImg: { width: '100%', height: '100%', objectFit: 'cover' },
  productImagePlaceholder: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productStatus: { position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '600', color: '#fff' },
  commandeBadge: { position: 'absolute', bottom: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: '#F59E0B', color: '#fff', padding: '4px 8px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: '600' },
  productInfo: { padding: '16px' },
  productName: { fontSize: '1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 4px' },
  productCategory: { fontSize: '0.7rem', color: '#64748B', margin: '0 0 12px' },
  productDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontWeight: '700', color: '#C8410A' },
  productStock: { fontSize: '0.7rem', color: '#64748B' },
  
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9', transition: 'all 0.2s ease' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' },
  orderRef: { fontWeight: '700', color: '#C8410A', fontSize: '0.85rem' },
  orderDate: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748B', marginLeft: '12px' },
  orderStatus: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', color: '#fff' },
  orderProducts: { marginBottom: '16px' },
  orderProduct: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F8FAFC' },
  orderProductInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  orderProductName: { fontSize: '0.85rem', color: '#1E293B' },
  orderProductQty: { fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '20px' },
  orderProductPrice: { fontSize: '0.8rem', fontWeight: '500', color: '#475569' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' },
  orderTotalLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#64748B' },
  orderTotal: { fontSize: '1.1rem', fontWeight: '700', color: '#C8410A' },
  
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px' },
  emptyStateTitle: { fontSize: '1rem', fontWeight: '500', marginTop: '20px', color: '#94A3B8' },
  emptyStateSubtext: { fontSize: '0.75rem', marginTop: '6px', color: '#CBD5E1' },
  emptyStateBtn: { marginTop: '20px', padding: '10px 24px', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' },
  
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 20px', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid #E2E8F0', zIndex: 100 },
  bottomNavBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#64748B', fontSize: '0.7rem', fontWeight: '500', cursor: 'pointer', padding: '8px 16px', borderRadius: '40px', transition: 'all 0.2s ease' },
  
  notificationWrapper: { position: 'relative' },
  bellButton: { borderRadius: '50%', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease', width: '42px', height: '42px' },
  bellBadge: { position: 'absolute', background: '#EF4444', color: '#fff', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', fontWeight: '800', minWidth: '20px', height: '20px', padding: '0 6px', fontSize: '0.65rem', top: '-5px', right: '-5px' },
  notificationDropdown: { position: 'absolute', top: '52px', right: 0, width: '360px', maxWidth: 'calc(100vw - 20px)', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 200, animation: 'slideDown 0.2s ease-out' },
  notificationDropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' },
  notificationDropdownTitle: { fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' },
  notificationDropdownSub: { color: '#64748B', fontSize: '0.65rem', marginTop: '2px' },
  notificationDropdownList: { maxHeight: '350px', overflowY: 'auto' },
  markReadBtn: { border: 'none', background: '#FEF3F2', color: '#C8410A', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '600' },
  notificationItem: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9' },
  notificationTitle: { fontWeight: '600', color: '#0F172A', fontSize: '0.8rem' },
  notificationMessage: { color: '#475569', fontSize: '0.7rem', marginTop: '3px', lineHeight: '1.4' },
  notificationDate: { color: '#94A3B8', fontSize: '0.6rem', marginTop: '5px' },
  emptyNotification: { color: '#94A3B8', textAlign: 'center', padding: '24px', fontSize: '0.75rem' },
  
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '16px' },
  modal: { background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalDetail: { background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #E2E8F0' },
  modalTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#0F172A', margin: 0 },
  modalClose: { width: '36px', height: '36px', border: 'none', background: '#F1F5F9', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' },
  formGroup: { marginBottom: '16px', padding: '0 24px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 24px' },
  formLabel: { display: 'block', fontSize: '0.8rem', fontWeight: '500', color: '#1E293B', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem', outline: 'none' },
  fileUploadArea: { position: 'relative', border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer' },
  fileInput: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  imagePreview: { marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
  imagePreviewItem: { background: '#F1F5F9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', color: '#475569' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', padding: '20px 24px', borderTop: '1px solid #E2E8F0' },
  cancelBtn: { padding: '10px 20px', border: '1px solid #E2E8F0', background: '#fff', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' },
  confirmBtn: { padding: '10px 24px', border: 'none', background: 'linear-gradient(135deg, #C8410A, #E8622A)', color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  
  productDetailContent: { display: 'flex', gap: '20px', padding: '20px' },
  productDetailImage: { width: '200px', height: '200px', objectFit: 'cover', borderRadius: '16px' },
  productDetailInfo: { flex: 1, lineHeight: '1.8', fontSize: '0.85rem' },
  detailPrice: { color: '#C8410A', fontWeight: '700', fontSize: '1rem' },
  productDetailStatus: { display: 'inline-block', padding: '3px 12px', borderRadius: '20px', fontSize: '0.7rem', color: '#fff', marginLeft: '8px' },
  detailActions: { display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' },
  editBtn: { border: 'none', background: '#1E293B', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' },
  deleteBtn: { border: 'none', background: '#EF4444', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' },
  lockHint: { marginTop: '16px', color: '#C8410A', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#FEF3F2', borderRadius: '10px' },
  infoHint: { marginTop: '16px', color: '#06B6D4', fontSize: '0.7rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#ECFEFF', borderRadius: '10px' },
};

// Animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  
  .stat-card:hover { transform: translateY(-6px) !important; box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important; }
  .bottom-nav-btn:hover { color: #C8410A !important; background: #FEF3F2 !important; transform: translateY(-2px); }
  .logout-btn:hover { background: #FEF2F2; transform: translateX(4px); }
  .add-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(200, 65, 10, 0.35); }
  .bell-button:hover { background: #F8FAFC; transform: scale(1.02); }
  .back-btn:hover { background: #E2E8F0; transform: scale(1.05); }
  .add-product-btn:hover { transform: scale(1.05); }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
  .order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .reset-filter-btn:hover { background: #C8410A; color: #fff; transform: translateY(-2px); }
  .refresh-btn:hover { background: #E2E8F0; transform: rotate(90deg); }
  .pie-slice { transition: transform 0.3s ease, filter 0.3s ease; cursor: pointer; }
  .pie-legend-item:hover { background: #FEF3F2 !important; transform: translateX(4px); border-radius: 12px; }
  
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; border-radius: 10px; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #C8410A; }
  
  @media (max-width: 768px) { 
    .stats-grid { gap: 16px !important; padding: 20px 20px 0 20px !important; } 
    .charts-grid { padding: 20px 20px 0 20px !important; gap: 20px !important; }
    .pie-chart-layout { flex-direction: column !important; gap: 20px !important; }
    .pie-svg-wrapper { width: 180px !important; height: 180px !important; }
    .pie-legend-list { max-height: 200px !important; }
    .pie-legend-item { padding: 8px 10px !important; }
    .pie-legend-label { font-size: 0.8rem !important; }
    .pie-legend-percent { font-size: 0.75rem !important; }
    .pie-legend-value { font-size: 0.65rem !important; }
    .bottom-nav-btn { padding: 6px 12px !important; } 
    .bottom-nav-btn span { font-size: 0.6rem !important; } 
    .bottom-nav { padding: 8px 16px !important; } 
    .page-container { padding: 16px !important; padding-bottom: 70px !important; } 
    .filters-row { gap: 12px !important; }
    .filter-group { width: 100% !important; justify-content: space-between !important; }
    .filter-select { flex: 1 !important; }
    .reset-filter-btn { width: 100% !important; margin-top: 8px !important; }
  }
  @media (max-width: 480px) { 
    .user-info { display: none !important; } 
    .logout-btn span { display: none !important; } 
    .logout-btn { padding: 6px 10px !important; } 
    .bottom-nav-btn span { display: none !important; } 
    .bottom-nav-btn { padding: 8px 12px !important; } 
    .bottom-nav { justify-content: center !important; gap: 20px !important; } 
    .page-title { font-size: 1.1rem !important; }
    .pie-svg-wrapper { width: 160px !important; height: 160px !important; }
  }
`;
document.head.appendChild(styleSheet);