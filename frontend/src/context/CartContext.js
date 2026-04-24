// src/context/CartContext.js — État global du panier
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [panier, setPanier] = useState([]);

  // Ajouter un produit
  const ajouterAuPanier = (produit) => {
    setPanier((prev) => {
      const existant = prev.find((item) => item._id === produit._id);
      if (existant) {
        return prev.map((item) =>
          item._id === produit._id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...prev, { ...produit, quantite: 1 }];
    });
  };

  // Modifier la quantité
  const changerQuantite = (id, delta) => {
    setPanier((prev) =>
      prev
        .map((item) => item._id === id ? { ...item, quantite: item.quantite + delta } : item)
        .filter((item) => item.quantite > 0)
    );
  };

  // Retirer un produit
  const retirerDuPanier = (id) => setPanier((prev) => prev.filter((item) => item._id !== id));

  // Vider le panier
  const viderPanier = () => setPanier([]);

  // Calculs
  const nombreArticles = panier.reduce((s, i) => s + i.quantite, 0);
  const total = panier.reduce((s, i) => s + i.prix * i.quantite, 0);

  return (
    <CartContext.Provider value={{
      panier, ajouterAuPanier, changerQuantite,
      retirerDuPanier, viderPanier, nombreArticles, total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
