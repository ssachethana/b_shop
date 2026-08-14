import { useState, useEffect, useCallback, useRef } from "react";
import { ShopAnalytics } from "./types";

interface UseShopAnalyticsResult {
  analytics: ShopAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const REFRESH_INTERVAL_MS = 5000;

export function useShopAnalytics(): UseShopAnalyticsResult {
  const [analytics, setAnalytics] = useState<ShopAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  const fetchAnalytics = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Only show the skeleton on the very first load, not on
    // background polls — avoids flickering the whole grid every 5s.
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/analytics`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const { data } = await res.json();
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      hasLoadedOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAnalytics();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}