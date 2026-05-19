import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Icon from '../../components/Icon';
import logot from '../../assets/images/logot.jpg';

// Composant LineChart avec courbe et animations avancées (version compacte)
function LineChart({ title, data = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (chartRef.current) observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return (
      <div style={styles.chartCardCompact} ref={chartRef}>
        <div style={styles.chartHeaderCompact}>
          <h2 style={styles.sectionTitreCompact}>{title}</h2>
          <div style={styles.chartBadgeCompact}>Évolution</div>
        </div>
        <div style={styles.emptyChartCompact}>
          <Icon name="line-chart" size={30} color="#ccc" />
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total || 0), 1);
  
  const points = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const index = t * (data.length - 1);
    const idx1 = Math.floor(index);
    const idx2 = Math.min(idx1 + 1, data.length - 1);
    const ratio = index - idx1;
    
    const y1 = 200 - ((data[idx1]?.total || 0) / max) * 180;
    const y2 = 200 - ((data[idx2]?.total || 0) / max) * 180;
    const y = y1 * (1 - ratio) + y2 * ratio;
    
    const x = i * 5;
    points.push(`${x},${y}`);
  }

  return (
    <div style={styles.chartCardCompact} ref={chartRef}>
      <div style={styles.chartHeaderCompact}>
        <div>
          <h2 style={styles.sectionTitreCompact}>{title}</h2>
          <p style={styles.chartSubtitleCompact}>Tendance annuelle</p>
        </div>
        <div style={styles.chartBadgeCompact}>
          <span style={styles.badgeDot}></span>
          +23%
        </div>
      </div>
      <div style={styles.lineContainerCompact}>
        <svg viewBox="0 0 500 180" style={styles.lineSvgCompact}>
          <defs>
            <linearGradient id="areaGradientCompact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8410A" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#C8410A" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="lineGradientCompact" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C8410A"/>
              <stop offset="100%" stopColor="#F39C12"/>
            </linearGradient>
          </defs>
          
          {[0, 60, 120, 180].map((y) => (
            <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#E9ECEF" strokeWidth="1" strokeDasharray="3,3"/>
          ))}
          
          {isVisible && (
            <polygon 
              points={`0,180 ${points.join(' ')} 500,180`} 
              fill="url(#areaGradientCompact)" 
              className="area-fill"
            />
          )}
          
          {isVisible && (
            <polyline 
              points={points.join(' ')} 
              fill="none" 
              stroke="url(#lineGradientCompact)" 
              strokeWidth="2.5" 
              className="line-path"
            />
          )}
          
          {isVisible && data.map((item, idx) => {
            const x = (idx / (data.length - 1 || 1)) * 500;
            const y = 180 - ((item.total / max) * 160);
            return (
              <g key={item.label} className="data-point" style={{ animationDelay: `${idx * 0.1}s` }}>
                <circle cx={x} cy={y} r="4" fill="#C8410A" stroke="#fff" strokeWidth="2">
                  <title>{`${item.label}: ${item.total.toLocaleString('fr-FR')} FCFA`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
        <div style={styles.lineLabelsCompact}>
          {data.map((item) => (
            <div key={item.label} style={styles.lineLabelCompact}>
              <span style={styles.lineLabelDotCompact}></span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Composant PieChart compact
function PieChart({ title, data = [] }) {
  const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  
  const getColor = (index) => {
    const colors = [
      '#FF6B35', '#F7931E', '#FFC300', '#2ECC71', 
      '#1ABC9C', '#3498DB', '#9B59B6', '#E74C3C',
      '#34495E', '#95A5A6', '#D5DBDB', '#FAD7A0',
      '#A9DFBF', '#D7BDE2', '#F5B7B1', '#85C1E9'
    ];
    return colors[index % colors.length];
  };

  if (data.length === 0 || total === 0) {
    return (
      <div style={styles.chartCardCompact}>
        <div style={styles.chartHeaderCompact}>
          <h2 style={styles.sectionTitreCompact}>{title}</h2>
          <div style={styles.chartBadgeCompact}>Répartition</div>
        </div>
        <div style={styles.emptyChartCompact}>
          <Icon name="pie-chart" size={30} color="#ccc" />
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const slices = [];

  data.forEach((item, idx) => {
    const percentage = (item.total / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + 70 * Math.cos(startRad);
    const y1 = 100 + 70 * Math.sin(startRad);
    const x2 = 100 + 70 * Math.cos(endRad);
    const y2 = 100 + 70 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    
    const pathData = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    slices.push({
      path: pathData,
      color: getColor(idx),
      label: item.label || 'Non classé',
      percentage: percentage,
      value: item.total
    });
  });

  return (
    <div style={styles.chartCardCompact}>
      <div style={styles.chartHeaderCompact}>
        <div>
          <h2 style={styles.sectionTitreCompact}>{title}</h2>
          <p style={styles.chartSubtitleCompact}>Par catégorie</p>
        </div>
        <div style={styles.chartBadgeCompact}>
          <span style={styles.badgeDot}></span>
          {data.length} catégories
        </div>
      </div>
      <div style={styles.pieContainerCompact}>
        <div style={styles.pieChartCompact}>
          <svg viewBox="0 0 200 200" style={styles.pieSvgCompact}>
            {slices.map((slice, idx) => (
              <g 
                key={idx} 
                className="pie-slice" 
                style={{ 
                  animationDelay: `${idx * 0.05}s`,
                  transform: hoveredSlice === idx ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <path 
                  d={slice.path} 
                  fill={slice.color}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                <title>{`${slice.label}: ${slice.percentage.toFixed(1)}%`}</title>
              </g>
            ))}
            <circle cx="100" cy="100" r="30" fill="white" className="pie-center" />
          </svg>
          <div style={styles.pieTotalCompact}>
            <div style={styles.pieTotalValueCompact}>{total.toLocaleString('fr-FR')}</div>
            <div style={styles.pieTotalLabelCompact}>Total</div>
          </div>
        </div>
        <div style={styles.pieLegendCompact}>
          {slices.slice(0, 6).map((slice, idx) => (
            <div 
              key={idx} 
              className="legend-item" 
              style={{
                ...styles.pieLegendItemCompact,
                background: hoveredSlice === idx ? '#F8F9FA' : 'transparent'
              }}
              onMouseEnter={() => setHoveredSlice(idx)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ ...styles.pieLegendColorCompact, backgroundColor: slice.color }} />
              <div style={styles.pieLegendLabelCompact}>{slice.label}</div>
              <div style={styles.pieLegendValueCompact}>
                {slice.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
          {slices.length > 6 && (
            <div style={styles.pieLegendMoreCompact}>
              +{slices.length - 6} autres
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, deconnexion } = useAuth();
  const [stats, setStats] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.get('/commandes/stats').then(({ data }) => setStats(data)).catch(console.error);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      deconnexion();
    }, 500);
  };

  const cartes = useMemo(() => [
    { label: 'Total commandes', valeur: stats?.totalCommandes ?? '0', icone: 'package', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { label: 'En attente', valeur: stats?.enAttente ?? '0', icone: 'clock', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { label: 'Livrées', valeur: stats?.livrees ?? '0', icone: 'check', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { label: 'Revenus', valeur: stats ? stats.revenus.toLocaleString('fr-FR') : '0', icone: 'trending-up', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', suffix: 'FCFA' },
  ], [stats]);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    { path: '/admin/produits', label: 'Produits', icon: 'package' },
    { path: '/admin/commandes', label: 'Commandes', icon: 'shopping-cart' },
    { path: '/admin/clients', label: 'Utilisateurs', icon: 'users' },
  ];

  const evolutionData = stats?.parMois || [
    { label: 'Jan', total: 120000 }, { label: 'Fév', total: 98000 }, { label: 'Mar', total: 145000 },
    { label: 'Avr', total: 132000 }, { label: 'Mai', total: 189000 }, { label: 'Juin', total: 210000 },
    { label: 'Juil', total: 198000 }, { label: 'Aoû', total: 225000 }, { label: 'Sep', total: 245000 },
    { label: 'Oct', total: 267000 }, { label: 'Nov', total: 289000 }, { label: 'Déc', total: 310000 }
  ];

  const repartitionData = stats?.parCategorie || [
    { label: 'Électronique', total: 450000 }, { label: 'Vêtements', total: 320000 },
    { label: 'Maison', total: 280000 }, { label: 'Beauté', total: 195000 },
    { label: 'Sports', total: 170000 }, 
    { label: 'Livres', total: 89000 }, { label: 'Autres', total: 67000 }
  ];

  return (
    <div style={styles.layout}>
      {/* Overlay pour mobile */}
      {mobileMenuOpen && <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)}></div>}
      
      {/* Sidebar - visible sur desktop, transformée en menu hamburger sur mobile */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoWrapper}>
            <img src={logot} alt="TeyShop" style={styles.logoImage} />
          </div>
          <h2 style={styles.sidebarLogo}>TeyShop</h2>
          <span style={styles.sidebarBadge}>Admin</span>
          <button onClick={() => setMobileMenuOpen(false)} className="close-sidebar-btn" style={styles.closeSidebarBtn}>✕</button>
        </div>
        
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              style={styles.menuItem} 
              onClick={() => setMobileMenuOpen(false)}
            >
              <div style={styles.menuIcon}>
                <Icon name={item.icon} size={18} color="#fff" />
              </div>
              <span>{item.label}</span>
              {item.label === 'Commandes' && stats?.enAttente > 0 && (
                <span style={styles.menuBadge}>{stats?.enAttente}</span>
              )}
            </Link>
          ))}
        </nav>
        
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{user?.prenom?.[0] || 'A'}</div>
            <div>
              <div style={styles.userName}>{user?.prenom} {user?.nom}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.deconnexionBtn,
              opacity: isLoggingOut ? 0.7 : 1,
              pointerEvents: isLoggingOut ? 'none' : 'auto'
            }}
          >
            <div style={styles.logoutIconWrapper}>
              <Icon name="log-out" size={18} color="#fff" />
            </div>
            <span style={styles.logoutText}>
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </span>
            {!isLoggingOut && <div style={styles.logoutArrow}>→</div>}
            {isLoggingOut && (
              <div style={styles.logoutSpinner}>
                <div style={styles.spinner}></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        {/* Header avec bouton hamburger pour mobile - AMÉLIORÉ ET VISIBLE */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="hamburger-btn"
              style={styles.hamburgerBtn}
            >
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="22" height="2" fill="#1A3A2A"/>
                <rect y="7" width="22" height="2" fill="#1A3A2A"/>
                <rect y="14" width="22" height="2" fill="#1A3A2A"/>
              </svg>
            </button>
            <div>
              <h1 style={styles.titre}>
                Tableau de bord
                <span style={styles.titreBadge}>Dashboard</span>
              </h1>
              <p style={styles.sousTitre}>
                Bonjour, {user?.prenom} 👋 Bienvenue
              </p>
            </div>
          </div>
          <div style={styles.headerDate}>
            <div style={styles.dateCard}>
              <Icon name="calendar" size={14} color="#C8410A" />
              <span>{currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
            </div>
            <div style={styles.timeCard}>
              <Icon name="clock" size={14} color="#C8410A" />
              <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {cartes.map((c, idx) => (
            <div 
              key={c.label} 
              style={{ 
                ...styles.statCard, 
                background: c.gradient,
                transform: hoveredCard === idx ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)'
              }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.statIcon}>
                <Icon name={c.icone} size={22} color="#fff" />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{c.valeur}</div>
                <div style={styles.statLabel}>{c.label}</div>
                {c.suffix && <div style={styles.statSuffix}>{c.suffix}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.chartsGridCompact}>
          <PieChart title="Répartition des ventes" data={repartitionData} />
          <LineChart title="Évolution des ventes" data={evolutionData} />
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitreCompact}>
            Actions rapides
            <span style={styles.sectionBadgeCompact}>3</span>
          </h2>
          <div style={styles.actionsGridCompact}>
            <Link to="/admin/produits" style={styles.actionCardCompact}>
              <div style={styles.actionIconCompact}>
                <Icon name="plus" size={18} color="#C8410A" />
              </div>
              <div>
                <div style={styles.actionTitleCompact}>Ajouter un produit</div>
                <div style={styles.actionDescCompact}>Nouvelle référence</div>
              </div>
              <div style={styles.actionArrowCompact}>→</div>
            </Link>
            <Link to="/admin/commandes" style={styles.actionCardCompact}>
              <div style={styles.actionIconCompact}>
                <Icon name="clipboard" size={18} color="#E8622A" />
              </div>
              <div>
                <div style={styles.actionTitleCompact}>Gérer les commandes</div>
                <div style={styles.actionDescCompact}>Traiter les commandes</div>
              </div>
              <div style={styles.actionArrowCompact}>→</div>
            </Link>
            <Link to="/admin/clients" style={styles.actionCardCompact}>
              <div style={styles.actionIconCompact}>
                <Icon name="users" size={18} color="#27AE60" />
              </div>
              <div>
                <div style={styles.actionTitleCompact}>Gérer les utilisateurs</div>
                <div style={styles.actionDescCompact}>Administrer les comptes</div>
              </div>
              <div style={styles.actionArrowCompact}>→</div>
            </Link>
          </div>
        </div>
      </main>

      {/* Styles CSS pour le menu hamburger */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Styles par défaut (desktop) */
        .sidebar {
          transform: translateX(0) !important;
        }
        
        .hamburger-btn {
          display: none !important;
        }
        
        .close-sidebar-btn {
          display: none !important;
        }
        
        .overlay {
          display: none !important;
        }
        
        /* Styles pour mobile */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            z-index: 1000;
            transform: translateX(-100%) !important;
            transition: transform 0.3s ease-in-out !important;
          }
          
          .sidebar.open {
            transform: translateX(0) !important;
          }
          
          .close-sidebar-btn {
            display: flex !important;
          }
          
          .hamburger-btn {
            display: flex !important;
            background: #C8410A !important;
            border: none !important;
            border-radius: 10px !important;
            width: 42px !important;
            height: 42px !important;
            cursor: pointer !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          }
          
          .hamburger-btn svg rect {
            fill: white !important;
          }
          
          .overlay {
            display: block !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .charts-grid-compact {
            grid-template-columns: 1fr !important;
          }
          
          .actions-grid-compact {
            grid-template-columns: 1fr !important;
          }
          
          .pie-container-compact {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          .pie-legend-compact {
            width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .header-date {
            width: 100%;
            justify-content: space-between;
          }
          
          .date-card, .time-card {
            flex: 1;
            justify-content: center;
          }
        }
        
        .hamburger-btn:hover {
          transform: scale(1.02);
          background: #E8622A !important;
        }
        
        .close-sidebar-btn:hover {
          background: rgba(255,255,255,0.2);
        }
      ` }} />
    </div>
  );
}

const styles = {
  layout: { 
    display: 'flex', 
    minHeight: '100vh', 
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: '#F5F7FA'
  },
  
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 998,
    backdropFilter: 'blur(4px)'
  },
  
  sidebar: { 
    width: '260px', 
    background: 'linear-gradient(180deg, #1A3A2A 0%, #0E251B 100%)', 
    padding: '24px 16px', 
    display: 'flex', 
    flexDirection: 'column', 
    top: 0, 
    height: '100vh',
    boxShadow: '2px 0 20px rgba(0,0,0,0.08)',
    zIndex: 1000
  },
  
  closeSidebarBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },
  
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '32px'
  },
  
  logoWrapper: {
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  
  sidebarLogo: { 
    color: '#fff', 
    fontSize: '1.2rem', 
    fontWeight: '700'
  },
  
  sidebarBadge: {
    background: '#C8410A',
    color: '#fff',
    fontSize: '0.6rem',
    padding: '2px 6px',
    borderRadius: '8px'
  },
  
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  
  menuItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '10px 12px', 
    color: 'rgba(255,255,255,0.8)', 
    textDecoration: 'none', 
    borderRadius: '8px', 
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  
  menuIcon: {
    width: '18px',
    display: 'flex',
    justifyContent: 'center'
  },
  
  menuBadge: {
    position: 'absolute',
    right: '12px',
    background: '#C8410A',
    color: '#fff',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '8px'
  },
  
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    padding: '4px'
  },
  
  userAvatar: {
    width: '32px',
    height: '32px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff'
  },
  
  userName: {
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  
  userEmail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.65rem'
  },
  
  deconnexionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    background: 'rgba(255,255,255,0.08)', 
    color: '#fff', 
    border: 'none', 
    padding: '10px 14px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    width: '100%',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  
  logoutIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease'
  },
  
  logoutText: {
    flex: 1,
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  
  logoutArrow: {
    transition: 'transform 0.3s ease',
    fontSize: '1rem'
  },
  
  logoutSpinner: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite'
  },
  
  main: { 
    flex: 1,
    minWidth: 0,
    padding: 'clamp(18px, 4vw, 24px) clamp(16px, 4vw, 32px)', 
    overflowY: 'auto' 
  },
  
  header: { 
    marginBottom: '28px', 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  
  hamburgerBtn: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    width: '42px',
    height: '42px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  },
  
  titre: { 
    fontSize: '1.5rem', 
    fontWeight: '700', 
    color: '#1A3A2A',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  titreBadge: {
    fontSize: '0.65rem',
    background: '#C8410A',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  
  sousTitre: { 
    color: '#6C757D', 
    fontSize: '0.85rem'
  },
  
  headerDate: {
    display: 'flex',
    gap: '8px'
  },
  
  dateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#fff',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#2C3E50',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  
  timeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#fff',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#2C3E50',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', 
    gap: '16px', 
    marginBottom: '32px' 
  },
  
  statCard: { 
    borderRadius: '14px', 
    padding: '14px 16px', 
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  
  statIcon: {
    width: '44px',
    height: '44px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  
  statContent: {
    flex: 1
  },
  
  statValue: { 
    fontSize: '1.4rem', 
    fontWeight: '800', 
    color: '#fff',
    lineHeight: 1.2
  },
  
  statLabel: { 
    fontSize: '0.7rem', 
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500'
  },
  
  statSuffix: {
    fontSize: '0.6rem',
    color: 'rgba(255,255,255,0.7)'
  },
  
  chartsGridCompact: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', 
    gap: '20px', 
    marginBottom: '32px' 
  },
  
  chartCardCompact: { 
    background: '#fff', 
    borderRadius: '16px', 
    padding: '16px 20px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease'
  },
  
  chartHeaderCompact: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  
  sectionTitreCompact: { 
    fontSize: '1rem', 
    fontWeight: '600', 
    color: '#2C3E50',
    margin: 0
  },
  
  chartSubtitleCompact: {
    fontSize: '0.7rem',
    color: '#6C757D',
    marginTop: '2px'
  },
  
  chartBadgeCompact: {
    background: '#F8F9FA',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontWeight: '600',
    color: '#C8410A',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  badgeDot: {
    width: '5px',
    height: '5px',
    background: '#2ECC71',
    borderRadius: '50%'
  },
  
  sectionBadgeCompact: {
    fontSize: '0.65rem',
    background: '#F8F9FA',
    color: '#6C757D',
    padding: '2px 6px',
    borderRadius: '12px'
  },
  
  emptyChartCompact: { 
    padding: '30px', 
    textAlign: 'center',
    color: '#ADB5BD'
  },
  
  pieContainerCompact: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  
  pieChartCompact: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0
  },
  
  pieSvgCompact: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)'
  },
  
  pieTotalCompact: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  
  pieTotalValueCompact: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#2C3E50'
  },
  
  pieTotalLabelCompact: {
    fontSize: '0.55rem',
    color: '#6C757D'
  },
  
  pieLegendCompact: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  
  pieLegendItemCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.7rem',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  
  pieLegendColorCompact: {
    width: '8px',
    height: '8px',
    borderRadius: '2px'
  },
  
  pieLegendLabelCompact: {
    flex: 1,
    color: '#495057'
  },
  
  pieLegendValueCompact: {
    fontWeight: '600',
    color: '#2C3E50',
    fontSize: '0.7rem'
  },
  
  pieLegendMoreCompact: {
    fontSize: '0.65rem',
    color: '#6C757D',
    textAlign: 'center',
    marginTop: '4px'
  },
  
  lineContainerCompact: {
    marginTop: '8px'
  },
  
  lineSvgCompact: {
    width: '100%',
    height: 'auto'
  },
  
  lineLabelsCompact: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '10px'
  },
  
  lineLabelCompact: {
    fontSize: '0.6rem',
    color: '#6C757D',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  
  lineLabelDotCompact: {
    width: '4px',
    height: '4px',
    background: '#C8410A',
    borderRadius: '50%'
  },
  
  quickActions: {
    marginTop: '8px'
  },
  
  actionsGridCompact: { 
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
    gap: '12px' 
  },
  
  actionCardCompact: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    background: '#fff', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    textDecoration: 'none', 
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  
  actionIconCompact: {
    width: '36px',
    height: '36px',
    background: '#F8F9FA',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  
  actionTitleCompact: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#2C3E50'
  },
  
  actionDescCompact: {
    fontSize: '0.65rem',
    color: '#6C757D'
  },
  
  actionArrowCompact: {
    marginLeft: 'auto',
    fontSize: '0.9rem',
    color: '#C8410A'
  }
};

// Ajouter les animations CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes drawLine {
    to { stroke-dashoffset: 0; }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .line-path {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine 1.5s ease-out forwards;
  }
  
  .area-fill { animation: slideIn 0.8s ease-out; }
  .data-point { animation: slideIn 0.5s ease-out backwards; }
  .pie-slice { animation: slideIn 0.4s ease-out backwards; cursor: pointer; }
  .pie-center { animation: slideIn 0.6s ease-out; }
  
  .stat-card:hover { transform: translateY(-4px) scale(1.01) !important; }
  .menu-item:hover { background: rgba(255,255,255,0.1); transform: translateX(4px); }
  
  .logout-btn:hover {
    background: rgba(255,255,255,0.15) !important;
    transform: translateX(4px);
  }
  
  .logout-btn:hover .logout-arrow { transform: translateX(4px); }
  .logout-btn:hover .logout-icon-wrapper { transform: scale(1.1); }
  .action-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .legend-item:hover { transform: translateX(4px) !important; }
  .chart-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
  
  ::-webkit-scrollbar {
    width: 5px;
  }
  
  ::-webkit-scrollbar-track {
    background: #F1F1F1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #C8410A;
    border-radius: 5px;
  }
`;
document.head.appendChild(styleSheet);