'use client';

import { useEffect, useState } from 'react';
import { ApiError, distributionApi } from '@/lib/api';

export function useHasDistribution(eventId: string, refreshKey = '') {
  const [hasDistribution, setHasDistribution] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void distributionApi
      .get(eventId)
      .then(() => {
        if (!cancelled) {
          setHasDistribution(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && err instanceof ApiError && err.status === 404) {
          setHasDistribution(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, refreshKey]);

  return hasDistribution;
}
