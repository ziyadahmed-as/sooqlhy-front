"use client";
// lib/hooks/useApi.ts – Generic hook for single API calls with loading/error/retry
import { useState, useEffect, useCallback } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook that executes an async fetcher function and tracks loading/error state.
 * Supports retry via the returned `refetch` function.
 *
 * @param fetcher - Async function that returns the data.
 * @param deps - Dependency array that triggers re-fetch on change.
 * @param initialData - Optional initial value for data.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  initialData: T | null = null
): UseApiState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            (err as any)?.response?.data?.detail ||
            (err as any)?.message ||
            'An error occurred';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, trigger]);

  return { data, loading, error, refetch };
}
