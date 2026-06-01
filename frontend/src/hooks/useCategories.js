import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = () => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  return { categories, loading, recharger: charger };
};
