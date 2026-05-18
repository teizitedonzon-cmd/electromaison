import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import Icon from '../../components/Icon';

export default function DetailProduit() {
  const { id } = useParams();
  const { ajouterAuPanier } = useCart();
  const [produit, setProduit] = useState(null);

  useEffect(() => {
    api.get(`/produits/${id}`).then(({ data }) => setProduit(data)).catch(console.error);
  }, [id]);

  if (!produit) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <Link to="/catalogue" style={styles.backLink}>← Retour au catalogue</Link>
      <div style={styles.card}>
        <div style={styles.productLayout} className="responsive-two-grid">
          <div style={styles.imageBox}>
            <Icon name="package" size={88} color="#C8410A" />
          </div>
          <div style={styles.productInfo}>
            {produit.badge && <span style={styles.badge}>{produit.badge}</span>}
            <h1 style={styles.title}>{produit.nom}</h1>
            <p style={styles.meta}>{produit.marque} · {produit.categorie}</p>
            <p style={styles.description}>{produit.description}</p>
            <div style={styles.price}>{produit.prix.toLocaleString('fr-FR')} FCFA</div>
            {produit.prixAncien && <div style={styles.oldPrice}>{produit.prixAncien.toLocaleString('fr-FR')} FCFA</div>}
            <div style={{ ...styles.stock, color: produit.stock > 0 ? '#27AE60' : '#E74C3C' }}>
              {produit.stock > 0 ? `En stock (${produit.stock} disponibles)` : 'Rupture de stock'}
            </div>
            <button
              onClick={() => { ajouterAuPanier(produit); toast.success('Ajouté au panier !'); }}
              disabled={produit.stock === 0}
              style={{ ...styles.cartButton, background: produit.stock > 0 ? '#C8410A' : '#ccc', cursor: produit.stock > 0 ? 'pointer' : 'not-allowed' }}
              className="responsive-full-button"
            >
              <Icon name="cart" size={17} /> Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', fontFamily: "'DM Sans',sans-serif" },
  page: { fontFamily: "'DM Sans',sans-serif", minHeight: '100vh', background: '#F5F0E8', padding: 'clamp(20px, 5vw, 40px)' },
  backLink: { color: '#C8410A', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '20px', padding: 'clamp(20px, 5vw, 40px)', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  productLayout: { display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)', gap: 'clamp(24px, 5vw, 40px)', alignItems: 'start' },
  imageBox: { background: '#F5F0E8', borderRadius: '16px', width: '100%', aspectRatio: '1 / 1', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productInfo: { minWidth: 0 },
  badge: { background: '#C8410A', color: '#fff', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' },
  title: { fontFamily: 'Georgia,serif', fontSize: 'clamp(1.35rem, 5vw, 1.8rem)', margin: '12px 0 8px', overflowWrap: 'anywhere' },
  meta: { color: '#888', marginBottom: '8px' },
  description: { lineHeight: 1.7, color: '#555', marginBottom: '20px', overflowWrap: 'anywhere' },
  price: { fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '800', color: '#1A3A2A', marginBottom: '8px' },
  oldPrice: { textDecoration: 'line-through', color: '#aaa', marginBottom: '8px' },
  stock: { fontWeight: '700', marginBottom: '20px' },
  cartButton: { color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '50px', fontWeight: '700', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '100%' },
};
