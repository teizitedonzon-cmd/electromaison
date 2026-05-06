// src/pages/client/DetailProduit.jsx
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

  if (!produit) return <div style={{padding:'40px', fontFamily:"'DM Sans',sans-serif"}}>Chargement...</div>;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#F5F0E8', padding:'40px' }}>
      <Link to="/catalogue" style={{color:'#C8410A', textDecoration:'none', fontWeight:'600', display:'inline-block', marginBottom:'24px'}}>← Retour au catalogue</Link>
      <div style={{background:'#fff', borderRadius:'20px', padding:'40px', maxWidth:'800px', margin:'0 auto', boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex', gap:'40px', flexWrap:'wrap'}}>
          <div style={{background:'#F5F0E8', borderRadius:'16px', width:'280px', height:'280px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <Icon name="package" size={88} color="#C8410A" />
          </div>
          <div style={{flex:1}}>
            {produit.badge && <span style={{background:'#C8410A', color:'#fff', padding:'4px 12px', borderRadius:'50px', fontSize:'0.75rem', fontWeight:'700'}}>{produit.badge}</span>}
            <h1 style={{fontFamily:'Georgia,serif', fontSize:'1.8rem', margin:'12px 0 8px'}}>{produit.nom}</h1>
            <p style={{color:'#888', marginBottom:'8px'}}>{produit.marque} · {produit.categorie}</p>
            <p style={{lineHeight:'1.7', color:'#555', marginBottom:'20px'}}>{produit.description}</p>
            <div style={{fontSize:'2rem', fontWeight:'800', color:'#1A3A2A', marginBottom:'8px'}}>{produit.prix.toLocaleString('fr-FR')} FCFA</div>
            {produit.prixAncien && <div style={{textDecoration:'line-through', color:'#aaa', marginBottom:'8px'}}>{produit.prixAncien.toLocaleString('fr-FR')} FCFA</div>}
            <div style={{color: produit.stock > 0 ? '#27AE60' : '#E74C3C', fontWeight:'700', marginBottom:'20px'}}>
              {produit.stock > 0 ? `En stock (${produit.stock} disponibles)` : 'Rupture de stock'}
            </div>
            <button
              onClick={() => { ajouterAuPanier(produit); toast.success('Ajouté au panier !'); }}
              disabled={produit.stock === 0}
              style={{background: produit.stock > 0 ? '#C8410A' : '#ccc', color:'#fff', border:'none', padding:'14px 32px', borderRadius:'50px', fontWeight:'700', fontSize:'1rem', cursor: produit.stock > 0 ? 'pointer' : 'not-allowed'}}>
              <Icon name="cart" size={17} /> Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
