"use client";
// lib/hooks/usePaginatedApi.ts – Hook for paginated API responses
import { useState, useEffect, useCallback } from 'react';
import type { PaginatedResponse } from '@/lib/types';

export interface UsePaginatedApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalCount: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

/**
 * Hook for paginated DRF responses ({ count, next, previous, results }).
 *
 * @param fetcher - Async function accepting page number and returning PaginatedResponse<T>.
 * @param pageSize - Items per page (default 12).
 * @param deps - Extra dependency array triggering re-fetch.
 */
export function usePaginatedApi<T>(
  fetcher: (page: number) => Promise<PaginatedResponse<T>>,
  pageSize: number = 12,
  deps: unknown[] = []
): UsePaginatedApiState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher(page)
      .then((res) => {
        if (!cancelled) {
          setData(res.results);
          setTotalCount(res.count);
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
  }, [page, trigger, ...deps]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return { data, loading, error, page, totalCount, totalPages, setPage, refetch };
}
