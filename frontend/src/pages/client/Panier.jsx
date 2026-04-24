// src/pages/client/Panier.jsx — Page panier + passer commande
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function Panier() {
  const { panier, changerQuantite, retirerDuPanier, viderPanier, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); // 1=panier, 2=livraison, 3=confirmation
  const [adresse, setAdresse] = useState({ rue: '', ville: '', pays: 'RDC' });
  const [modePaiement, setModePaiement] = useState('cash');
  const [chargement, setChargement] = useState(false);

  const passerCommande = async () => {
    setChargement(true);
    try {
      const lignes = panier.map(item => ({
        produitId: item._id,
        nomProduit: item.nom,
        quantite: item.quantite,
      }));
      await api.post('/commandes', { lignes, adresseLivraison: adresse, modePaiement });
      viderPanier();
      toast.success('🎉 Commande passée avec succès !');
      navigate('/mes-commandes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
    } finally { setChargement(false); }
  };

  if (panier.length === 0 && etape === 1) return (
    <div style={{...styles.page, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px'}}>
      <span style={{fontSize:'5rem'}}>🛒</span>
      <h2>Votre panier est vide</h2>
      <Link to="/catalogue" style={styles.btnPrimaire}>Voir le catalogue</Link>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.titre}>
          {etape === 1 ? '🛒 Mon Panier' : etape === 2 ? '📍 Adresse de livraison' : '✅ Confirmation'}
        </h1>

        {/* Étape 1 : Panier */}
        {etape === 1 && (
          <>
            {panier.map((item) => (
              <div key={item._id} style={styles.item}>
                <div style={styles.itemIcone}>{item.categorie === 'froid' ? '🧊' : item.categorie === 'cuisine' ? '🍳' : '⚡'}</div>
                <div style={styles.itemInfo}>
                  <div style={styles.itemNom}>{item.nom}</div>
                  <div style={styles.itemPrix}>{item.prix.toLocaleString('fr-FR')} FCFA / unité</div>
                  <div style={styles.qtyCtrl}>
                    <button style={styles.qtyBtn} onClick={() => changerQuantite(item._id, -1)}>−</button>
                    <span style={styles.qtyNum}>{item.quantite}</span>
                    <button style={styles.qtyBtn} onClick={() => changerQuantite(item._id, 1)}>+</button>
                  </div>
                </div>
                <div style={styles.itemSousTotal}>{(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA</div>
                <button onClick={() => retirerDuPanier(item._id)} style={styles.retirerBtn}>🗑️</button>
              </div>
            ))}

            <div style={styles.totalSection}>
              <div style={styles.totalLigne}><span>Total</span><span style={styles.totalMontant}>{total.toLocaleString('fr-FR')} FCFA</span></div>
              <button onClick={() => setEtape(2)} style={styles.btnPrimaire}>Passer à la livraison →</button>
            </div>
          </>
        )}

        {/* Étape 2 : Adresse */}
        {etape === 2 && (
          <div style={styles.formSection}>
            {[['rue','Rue / Avenue','Ex: 123 Av. Lumumba'],['ville','Ville','Ex: Kinshasa'],['pays','Pays','Ex: RDC']].map(([name, label, ph]) => (
              <div key={name} style={styles.champ}>
                <label style={styles.label}>{label}</label>
                <input value={adresse[name]} onChange={e => setAdresse({...adresse, [name]: e.target.value})}
                  placeholder={ph} style={styles.input} />
              </div>
            ))}

            <div style={styles.champ}>
              <label style={styles.label}>Mode de paiement</label>
              {['cash','mobile_money','virement'].map(m => (
                <label key={m} style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', cursor:'pointer'}}>
                  <input type="radio" name="paiement" value={m} checked={modePaiement === m}
                    onChange={() => setModePaiement(m)} />
                  {m === 'cash' ? '💵 Cash à la livraison' : m === 'mobile_money' ? '📱 Mobile Money' : '🏦 Virement bancaire'}
                </label>
              ))}
            </div>

            <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
              <button onClick={() => setEtape(1)} style={styles.btnSecondaire}>← Retour</button>
              <button onClick={passerCommande} disabled={chargement || !adresse.rue || !adresse.ville}
                style={styles.btnPrimaire}>
                {chargement ? 'Traitement...' : '✅ Confirmer la commande'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', background:'#F5F0E8', padding:'40px', fontFamily:"'DM Sans',sans-serif" },
  container:    { maxWidth:'680px', margin:'0 auto' },
  titre:        { fontSize:'1.8rem', fontWeight:'700', marginBottom:'28px', color:'#1C1C1C' },
  item:         { background:'#fff', borderRadius:'16px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  itemIcone:    { fontSize:'2.5rem', background:'#F5F0E8', width:'60px', height:'60px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  itemInfo:     { flex:1 },
  itemNom:      { fontWeight:'700', fontSize:'0.95rem', marginBottom:'4px' },
  itemPrix:     { color:'#888', fontSize:'0.83rem', marginBottom:'8px' },
  qtyCtrl:      { display:'flex', alignItems:'center', gap:'10px' },
  qtyBtn:       { background:'#F5F0E8', border:'1px solid #E2DAD0', width:'28px', height:'28px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:'700' },
  qtyNum:       { fontWeight:'700', fontSize:'0.95rem', minWidth:'24px', textAlign:'center' },
  itemSousTotal:{ fontWeight:'800', color:'#1A3A2A', fontSize:'1rem' },
  retirerBtn:   { background:'#FADBD8', border:'none', padding:'8px', borderRadius:'8px', cursor:'pointer', fontSize:'0.9rem' },
  totalSection: { background:'#fff', borderRadius:'16px', padding:'24px', marginTop:'24px' },
  totalLigne:   { display:'flex', justifyContent:'space-between', fontSize:'1.1rem', fontWeight:'600', marginBottom:'20px' },
  totalMontant: { color:'#C8410A', fontSize:'1.3rem', fontWeight:'800' },
  btnPrimaire:  { background:'#C8410A', color:'#fff', border:'none', padding:'14px 28px', borderRadius:'50px', fontWeight:'700', cursor:'pointer', fontSize:'0.95rem', fontFamily:'inherit', textDecoration:'none', display:'inline-block' },
  btnSecondaire:{ background:'#eee', color:'#444', border:'none', padding:'14px 24px', borderRadius:'50px', fontWeight:'600', cursor:'pointer', fontSize:'0.95rem', fontFamily:'inherit' },
  formSection:  { background:'#fff', borderRadius:'20px', padding:'32px' },
  champ:        { marginBottom:'18px' },
  label:        { display:'block', marginBottom:'6px', fontSize:'0.88rem', fontWeight:'600', color:'#444' },
  input:        { width:'100%', padding:'11px 14px', borderRadius:'10px', border:'1.5px solid #E2DAD0', fontSize:'0.93rem', fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
};
