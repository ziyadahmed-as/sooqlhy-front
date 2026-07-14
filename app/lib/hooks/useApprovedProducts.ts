// app/lib/hooks/useApprovedProducts.ts
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import api from '@/lib/api/axios'; // authenticated instance

/**
 * Generic hook to fetch a list of approved & verified products.
 * @param endpoint - Relative API path e.g. '/api/products/new'.
 * @param params   - Optional query parameters.
 */
export const useApprovedProducts = (
  endpoint: string,
  params: Record<string, string | number> = {}
) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .get(endpoint, { params })
      .then((response) => {
        if (isMounted) {
          const raw = response.data;
          setData(Array.isArray(raw) ? raw : raw.results ?? []);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError((err as any)?.message || 'Error fetching data');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
};
