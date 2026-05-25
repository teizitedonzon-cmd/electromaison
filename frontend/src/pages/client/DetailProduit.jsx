import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { mediaUrl } from '../../utils/media';
import { useCart } from '../../context/CartContext';
import Icon from '../../components/Icon';
import ClientNav from '../../components/ClientNav';

const venteFlashActive = (produit) =>
  produit?.venteFlash?.actif && produit.venteFlash?.prixFlash && produit.venteFlash?.dateFin && new Date(produit.venteFlash.dateFin) > new Date();

const tempsRestant = (dateFin) => {
  const diff = new Date(dateFin) - new Date();
  if (diff <= 0) return 'Terminee';
  const heures = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${heures}h ${minutes}min`;
};

export default function DetailProduit() {
  const { id } = useParams();
  const { ajouterAuPanier } = useCart();
  const [produit, setProduit] = useState(null);
  const [avis, setAvis] = useState([]);

  useEffect(() => {
    api.get(`/produits/${id}`).then(({ data }) => setProduit(data)).catch(console.error);
    api.get(`/avis/produit/${id}`).then(({ data }) => setAvis(data.avis || [])).catch(console.error);
  }, [id]);

  if (!produit) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <ClientNav />
      <Link to="/catalogue" style={styles.backLink}>← Retour au catalogue</Link>
      <div style={styles.card}>
        <div style={styles.productLayout} className="responsive-two-grid">
          <div style={styles.imageBox}>
            {produit.images?.[0] ? (
              <img src={mediaUrl(produit.images[0])} alt={produit.nom} style={styles.productImage} />
            ) : (
              <Icon name="package" size={88} color="#C8410A" />
            )}
          </div>
          <div style={styles.productInfo}>
            {produit.badge && <span style={styles.badge}>{produit.badge}</span>}
            <h1 style={styles.title}>{produit.nom}</h1>
            <p style={styles.meta}>{produit.marque} · {produit.categorie}</p>
            <p style={styles.description}>{produit.description}</p>
            {produit.nombreAvis > 0 && <div style={styles.rating}> {produit.noteMoyenne}/5 ({produit.nombreAvis} avis)</div>}
            {venteFlashActive(produit) && <div style={styles.flash}>Vente flash - fin dans {tempsRestant(produit.venteFlash.dateFin)}</div>}
            <div style={styles.price}>{Number(venteFlashActive(produit) ? produit.venteFlash.prixFlash : produit.prix).toLocaleString('fr-FR')} FCFA</div>
            {venteFlashActive(produit) && <div style={styles.oldPrice}>{produit.prix.toLocaleString('fr-FR')} FCFA</div>}
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
      <div style={styles.reviews}>
        <h2 style={styles.reviewsTitle}>Avis clients</h2>
        {avis.length === 0 ? (
          <p style={styles.emptyReviews}>Aucun avis pour ce produit.</p>
        ) : avis.map((a) => (
          <div key={a._id} style={styles.reviewItem}>
            <div style={styles.reviewHeader}>
              <strong>{a.client?.prenom} {a.client?.nom}</strong>
              <span style={styles.reviewStars}>{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</span>
            </div>
            {a.commentaire && <p style={styles.reviewText}>{a.commentaire}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  loading: { padding: '40px', fontFamily: "'DM Sans',sans-serif" },
  page: { fontFamily: "'DM Sans',sans-serif", minHeight: '100vh', background: 'var(--em-page)' },
  backLink: { color: '#C8410A', textDecoration: 'none', fontWeight: '600', display: 'inline-block', margin: 'clamp(20px, 5vw, 40px) clamp(20px, 5vw, 40px) 24px' },
  card: { background: 'var(--em-surface)', borderRadius: '8px', padding: 'clamp(20px, 5vw, 40px)', maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--em-shadow-md)', border: '1px solid var(--em-border)' },
  productLayout: { display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)', gap: 'clamp(24px, 5vw, 40px)', alignItems: 'start' },
  imageBox: { background: 'linear-gradient(135deg, #fff7ef, #edf7f2)', borderRadius: '8px', width: '100%', aspectRatio: '1 / 1', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--em-border)' },
  productImage: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' },
  productInfo: { minWidth: 0 },
  badge: { background: '#C8410A', color: '#fff', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' },
  title: { fontFamily: 'Georgia,serif', fontSize: 'clamp(1.35rem, 5vw, 1.8rem)', margin: '12px 0 8px', overflowWrap: 'anywhere' },
  meta: { color: '#888', marginBottom: '8px' },
  rating: { color: '#B45309', fontWeight: '700', marginBottom: '10px' },
  description: { lineHeight: 1.7, color: '#555', marginBottom: '20px', overflowWrap: 'anywhere' },
  flash: { display: 'inline-block', background: '#112219', color: '#F4A76A', padding: '7px 12px', borderRadius: '12px', fontWeight: '800', marginBottom: '10px' },
  price: { fontSize: 'clamp(1.4rem, 6vw, 2rem)', fontWeight: '800', color: '#1A3A2A', marginBottom: '8px' },
  oldPrice: { textDecoration: 'line-through', color: '#aaa', marginBottom: '8px' },
  stock: { fontWeight: '700', marginBottom: '20px' },
  cartButton: { color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '50px', fontWeight: '700', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '100%' },
  reviews: { background: 'var(--em-surface)', borderRadius: '8px', padding: '24px', maxWidth: '800px', margin: '24px auto 40px', boxShadow: 'var(--em-shadow-sm)', border: '1px solid var(--em-border)' },
  reviewsTitle: { margin: '0 0 16px', color: '#112219' },
  emptyReviews: { color: '#777', margin: 0 },
  reviewItem: { borderTop: '1px solid #eee', padding: '14px 0' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px' },
  reviewStars: { color: '#F4A76A', whiteSpace: 'nowrap' },
  reviewText: { color: '#555', margin: '8px 0 0', lineHeight: 1.5 },
};
