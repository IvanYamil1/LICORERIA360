import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Stale-while-revalidate:
// 1. Lee caché del disco y la muestra inmediatamente (si existe).
// 2. En paralelo refetcheo la API y actualizo cuando llegue.
// 3. Si la API falla pero hay caché, mantengo la caché y muestro error opcional.
// 4. Si no hay caché y la API falla, expongo error para que el caller muestre retry.

export type FetchState<T> = {
  data: T | null;
  loading: boolean;       // true si todavía no hay nada (ni caché)
  refreshing: boolean;    // true si re-fetcheando con caché ya pintada
  error: string | null;   // mensaje de error si falló
  reload: () => void;     // dispara refetch manual
  isStale: boolean;       // true mientras la primera petición a red no haya terminado
};

const PREFIX = 'cache:';

export function useCachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(true);

  const cacheKey = PREFIX + key;

  const run = useCallback(async (silent: boolean) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const fresh = await fetcher();
      setData(fresh);
      setIsStale(false);
      AsyncStorage.setItem(cacheKey, JSON.stringify(fresh)).catch(() => {});
    } catch (e: any) {
      const msg = e?.message || 'Error de red';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheKey, fetcher]);

  // Carga inicial: primero caché, luego red
  useEffect(() => {
    let canceled = false;
    AsyncStorage.getItem(cacheKey).then((cached) => {
      if (canceled) return;
      if (cached) {
        try {
          setData(JSON.parse(cached) as T);
          setLoading(false);
          setRefreshing(true);
          run(true);
        } catch {
          run(false);
        }
      } else {
        run(false);
      }
    });
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const reload = useCallback(() => {
    if (data) setRefreshing(true);
    run(!!data);
  }, [data, run]);

  return { data, loading, refreshing, error, reload, isStale };
}
