import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import axios from 'axios';

// No local Product interface – using shared type from lib/types

/**
 * Generic hook to fetch a list of approved & verified products.
 * `endpoint` should be a relative path like '/api/products/new'.
 * `params` are optional query parameters (ordering, filters, pagination).
 */
export const useApprovedProducts = (
  endpoint: string,
  params: Record<string, any> = {}
) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(endpoint, { params });
        if (isMounted) {
          setData(response.data.results ?? response.data);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error fetching data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
};
