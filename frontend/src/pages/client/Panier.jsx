import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import Icon from '../../components/Icon';

export default function Panier() {
  const { panier, changerQuantite, retirerDuPanier, viderPanier, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); 
  const [adresse, setAdresse] = useState({ rue: '', ville: '', pays: 'Cameroun' });
  const [modePaiement, setModePaiement] = useState('cash');
  const [chargement, setChargement] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const passerCommande = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour commander.");
      return navigate('/connexion');
    }

    setChargement(true);
    try {
      const lignes = panier.map(item => ({
        produitId: item._id, 
        nomProduit: item.nom,
        quantite: item.quantite,
      }));
      
      const payload = { 
        lignes, 
        adresseLivraison: adresse, 
        modePaiement 
      };

      await api.post('/commandes', payload);
      
      viderPanier();
      toast.success('Commande passée avec succès !');
      navigate('/mes-commandes');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally { 
      setChargement(false); 
    }
  };

  const TrashIcon = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  if (panier.length === 0 && etape === 1) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>🛒</div>
      <h2 style={styles.emptyTitle}>Votre panier est vide</h2>
      <p style={styles.emptyText}>Ajoutez des produits à votre panier pour commencer vos achats</p>
      <Link to="/catalogue" style={styles.emptyBtn}>Découvrir le catalogue →</Link>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header avec progression */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              {etape === 1 ? 'Mon panier' : etape === 2 ? 'Livraison' : 'Confirmation'}
            </h1>
            <div style={styles.steps}>
              <div style={{ ...styles.step, ...(etape >= 1 ? styles.stepActive : {}) }}>
                <span style={styles.stepNum}>1</span>
                <span style={styles.stepLabel}>Panier</span>
              </div>
              <div style={styles.stepLine}></div>
              <div style={{ ...styles.step, ...(etape >= 2 ? styles.stepActive : {}) }}>
                <span style={styles.stepNum}>2</span>
                <span style={styles.stepLabel}>Livraison</span>
              </div>
              <div style={styles.stepLine}></div>
              <div style={{ ...styles.step, ...(etape >= 3 ? styles.stepActive : {}) }}>
                <span style={styles.stepNum}>3</span>
                <span style={styles.stepLabel}>Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 1 : Panier - Version responsive */}
        {etape === 1 && (
          <>
            <div style={styles.cartItems}>
              {panier.map((item, idx) => (
                <div 
                  key={item._id} 
                  style={{
                    ...styles.cartItem,
                    transform: hoveredItem === idx ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: hoveredItem === idx ? '0 8px 25px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={() => setHoveredItem(idx)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="cart-item"
                >
                  {/* Image produit */}
                  <div style={styles.itemImage}>
                    {item.images?.[0] ? (
                      <img src={mediaUrl(item.images[0])} alt={item.nom} style={styles.itemImg} />
                    ) : (
                      <div style={styles.itemImagePlaceholder}>
                        <Icon name="package" size={24} color="#C8410A" />
                      </div>
                    )}
                  </div>
                  
                  {/* Détails produit */}
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.nom}</h3>
                    <p style={styles.itemPrice}>{item.prix.toLocaleString('fr-FR')} FCFA / unité</p>
                    <div style={styles.itemActions}>
                      <div style={styles.quantityControl}>
                        <button 
                          style={styles.qtyBtn} 
                          onClick={() => changerQuantite(item._id, -1)}
                          className="qty-btn"
                        >−</button>
                        <span style={styles.qtyValue}>{item.quantite}</span>
                        <button 
                          style={styles.qtyBtn} 
                          onClick={() => changerQuantite(item._id, 1)}
                          className="qty-btn"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => retirerDuPanier(item._id)} 
                        style={styles.removeBtn}
                        className="remove-btn"
                        title="Supprimer le produit"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    {/* Total mobile (visible uniquement sur petits écrans) */}
                    <div style={styles.itemTotalMobile}>
                      <span style={styles.totalLabelMobile}>Total : </span>
                      <span style={styles.totalValueMobile}>{(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                  
                  {/* Total desktop */}
                  <div style={styles.itemTotalDesktop}>
                    <span style={styles.totalLabel}>Total</span>
                    <span style={styles.totalValue}>{(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé commande */}
            <div style={styles.summary}>
              <div style={styles.summaryHeader}>
                <Icon name="file-text" size={18} color="#112219" />
                <span>Résumé de la commande</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Sous-total ({panier.reduce((s,i)=> s + i.quantite,0)} articles)</span>
                <span>{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div style={styles.divider}></div>
              <div style={{...styles.summaryRow, ...styles.summaryTotal}}>
                <span>Total</span>
                <span>{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button onClick={() => setEtape(2)} style={styles.checkoutBtn}>
                Passer à la livraison →
              </button>
            </div>
          </>
        )}

        {/* Étape 2 : Livraison - Version responsive */}
        {etape === 2 && (
          <div style={styles.shippingForm}>
            <div style={styles.formHeader}>
              <Icon name="map-pin" size={20} color="#112219" />
              <h3>Adresse de livraison</h3>
            </div>
            <p style={styles.formSubtitle}>Veuillez renseigner vos coordonnées pour la livraison</p>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Rue / Avenue</label>
              <input 
                value={adresse.rue} 
                onChange={e => setAdresse({...adresse, rue: e.target.value})}
                placeholder="Ex: Quartier Maetur" 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Ville</label>
              <input 
                value={adresse.ville} 
                onChange={e => setAdresse({...adresse, ville: e.target.value})}
                placeholder="Ex: Bandjoun" 
                style={styles.formInput} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Pays</label>
              <input 
                value={adresse.pays} 
                onChange={e => setAdresse({...adresse, pays: e.target.value})}
                placeholder="Ex: Cameroun" 
                style={styles.formInput} 
              />
            </div>

            <div style={styles.paymentSection}>
              <div style={styles.paymentHeader}>
                <Icon name="credit-card" size={18} color="#112219" />
                <span>Mode de paiement</span>
              </div>
              <div style={styles.paymentOptions}>
                {[
                  { value: 'cash', label: '💵 Cash à la livraison', icon: 'cash' },
                  { value: 'mobile_money', label: '📱 Mobile Money', icon: 'phone' },
                  { value: 'virement', label: '🏦 Virement bancaire', icon: 'building' }
                ].map(m => (
                  <label key={m.value} style={{...styles.paymentOption, ...(modePaiement === m.value ? styles.paymentOptionActive : {})}}>
                    <input 
                      type="radio" 
                      name="paiement" 
                      value={m.value} 
                      checked={modePaiement === m.value}
                      onChange={() => setModePaiement(m.value)}
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.formActions}>
              <button onClick={() => setEtape(1)} style={styles.backBtn}>
                ← Retour au panier
              </button>
              <button 
                onClick={passerCommande} 
                disabled={chargement || !adresse.rue || !adresse.ville}
                style={{...styles.confirmBtn, opacity: (chargement || !adresse.rue || !adresse.ville) ? 0.6 : 1}}
              >
                {chargement ? 'Traitement en cours...' : 'Confirmer la commande →'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Injection des styles responsives */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .cart-item {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      ` }} />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F5F7FA 0%, #E9ECEF 100%)',
    padding: '40px 20px',
    fontFamily: "'Inter', 'DM Sans', sans-serif",
  },
  wrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  
  // Header
  header: {
    marginBottom: '32px',
  },
  titleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '24px',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
    fontWeight: '800',
    color: '#112219',
    margin: 0,
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stepActive: {
    color: '#C8410A',
  },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#E8ECEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#666',
  },
  stepLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#666',
  },
  stepLine: {
    width: '20px',
    height: '1px',
    background: '#E0E0E0',
  },
  
  // Cart Items - RESPONSIVE
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  cartItem: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    border: '1px solid #E8E8E8',
  },
  itemImage: {
    width: '70px',
    height: '70px',
    borderRadius: '12px',
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#112219',
    marginBottom: '6px',
    wordBreak: 'break-word',
  },
  itemPrice: {
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '12px',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F5F5F5',
    borderRadius: '30px',
    padding: '4px',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#C8410A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  qtyValue: {
    minWidth: '28px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
  },
  removeBtn: {
    width: '34px',
    height: '34px',
    background: '#FEF0EE',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#E74C3C',
  },
  
  // Total Desktop (caché sur mobile)
  itemTotalDesktop: {
    textAlign: 'right',
    minWidth: '130px',
  },
  totalLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#999',
    marginBottom: '4px',
  },
  totalValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#C8410A',
  },
  
  // Total Mobile (visible uniquement sur mobile)
  itemTotalMobile: {
    display: 'none',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #E8E8E8',
  },
  totalLabelMobile: {
    fontSize: '0.75rem',
    color: '#999',
  },
  totalValueMobile: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#C8410A',
    marginLeft: '8px',
  },
  
  // Summary - RESPONSIVE
  summary: {
    background: '#fff',
    borderRadius: '20px',
    padding: 'clamp(16px, 4vw, 24px)',
    border: '1px solid #E8E8E8',
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E8E8E8',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#112219',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '0.85rem',
    color: '#666',
    flexWrap: 'wrap',
    gap: '8px',
  },
  summaryTotal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#112219',
  },
  divider: {
    height: '1px',
    background: '#E8E8E8',
    margin: '16px 0',
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px',
    background: '#C8410A',
    color: '#fff',
    border: 'none',
    borderRadius: '40px',
    fontSize: 'clamp(0.85rem, 4vw, 0.9rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '16px',
  },
  
  // Shipping Form - RESPONSIVE
  shippingForm: {
    background: '#fff',
    borderRadius: '20px',
    padding: 'clamp(20px, 5vw, 32px)',
    border: '1px solid #E8E8E8',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  formSubtitle: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid #E2E8F0',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },
  paymentSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #E8E8E8',
  },
  paymentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#112219',
  },
  paymentOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  paymentOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  paymentOptionActive: {
    borderColor: '#C8410A',
    background: '#FFF5F0',
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    flexDirection: 'row',
  },
  backBtn: {
    flex: 1,
    padding: '12px',
    background: '#F0F0F0',
    border: 'none',
    borderRadius: '40px',
    fontSize: 'clamp(0.75rem, 4vw, 0.85rem)',
    fontWeight: '600',
    color: '#444',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  confirmBtn: {
    flex: 2,
    padding: '12px',
    background: '#C8410A',
    border: 'none',
    borderRadius: '40px',
    fontSize: 'clamp(0.75rem, 4vw, 0.85rem)',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Empty state - RESPONSIVE
  emptyContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F5F7FA 0%, #E9ECEF 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  emptyTitle: {
    fontSize: 'clamp(1.2rem, 6vw, 1.5rem)',
    fontWeight: '700',
    color: '#112219',
    marginBottom: '8px',
  },
  emptyText: {
    color: '#999',
    marginBottom: '16px',
    fontSize: 'clamp(0.85rem, 4vw, 1rem)',
    maxWidth: '300px',
  },
  emptyBtn: {
    display: 'inline-block',
    padding: '12px 28px',
    background: '#C8410A',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '40px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
};

// Animations globales
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .qty-btn:hover {
    background: #C8410A;
    color: #fff;
    transform: scale(1.05);
  }
  
  .remove-btn:hover {
    background: #E74C3C;
    color: #fff;
    transform: scale(1.1);
  }
  
  .checkout-btn:hover, .confirm-btn:hover, .empty-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(200, 65, 10, 0.25);
  }
  
  .back-btn:hover {
    background: #E0E0E0;
    transform: translateY(-2px);
  }
  
  .payment-option:hover {
    border-color: #C8410A;
    background: #FFF5F0;
  }
  
  input:focus {
    border-color: #C8410A;
    box-shadow: 0 0 0 3px rgba(200, 65, 10, 0.1);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .cart-item {
    animation: fadeInUp 0.3s ease-out backwards;
  }
  
  /* ===== RESPONSIVE MEDIA QUERIES ===== */
  
  /* Tablette */
  @media (max-width: 768px) {
    .cart-item {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    
    .item-total-desktop {
      display: none !important;
    }
    
    .item-total-mobile {
      display: block !important;
    }
    
    .cart-item {
      flex-direction: column;
    }
  }
  
  /* Mobile */
  @media (max-width: 640px) {
    .container {
      padding: 20px 12px !important;
    }
    
    .steps {
      justify-content: center;
      width: 100%;
    }
    
    .step-label {
      display: none;
    }
    
    .step-line {
      width: 15px;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .back-btn, .confirm-btn {
      width: 100%;
    }
    
    .payment-option {
      padding: 10px 12px;
      font-size: 0.8rem;
    }
  }
  
  /* Très petit mobile */
  @media (max-width: 480px) {
    .title-section {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .item-image {
      width: 60px;
      height: 60px;
    }
    
    .item-name {
      font-size: 0.85rem;
    }
    
    .quantity-control {
      gap: 5px;
    }
    
    .qty-btn {
      width: 24px;
      height: 24px;
      font-size: 0.9rem;
    }
    
    .remove-btn {
      width: 30px;
      height: 30px;
    }
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
