import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FavoriteProduct = {
  _id: string;
  name: string;
  capacity?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  categoryName?: string;
};

type Ctx = {
  favorites: FavoriteProduct[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (p: FavoriteProduct) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  ready: boolean;
};

const FavoritesContext = createContext<Ctx>({} as Ctx);
const STORAGE_KEY = 'favorites:v1';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [ready, setReady] = useState(false);

  // Carga inicial desde disco
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setFavorites(JSON.parse(raw)); } catch { /* ignore */ }
      }
      setReady(true);
    });
  }, []);

  const persist = useCallback(async (list: FavoriteProduct[]) => {
    setFavorites(list);
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some((f) => f._id === id), [favorites]);

  const toggleFavorite = useCallback(async (p: FavoriteProduct) => {
    const exists = favorites.find((f) => f._id === p._id);
    const next = exists ? favorites.filter((f) => f._id !== p._id) : [...favorites, p];
    await persist(next);
  }, [favorites, persist]);

  const removeFavorite = useCallback(async (id: string) => {
    await persist(favorites.filter((f) => f._id !== id));
  }, [favorites, persist]);

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite, clearAll, ready }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
