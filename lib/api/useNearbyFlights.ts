import { useEffect, useRef, useState } from 'react';

import { fetchFlightsInBBox } from '@/lib/api/opensky';
import type { LiveFlight } from '@/types/flight';

type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };

const POLL_MS = 15_000;

export function useNearbyFlights(bbox: BBox | null) {
  const [flights, setFlights] = useState<LiveFlight[]>([]);
  const [queriedRadiusNm, setQueriedRadiusNm] = useState(0);
  const [capped, setCapped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bbox) return;

    const controller = new AbortController();
    let cancelled = false;

    const tick = async () => {
      try {
        const result = await fetchFlightsInBBox(bbox, controller.signal);
        if (cancelled) return;
        setFlights(result.flights);
        setQueriedRadiusNm(result.queriedRadiusNm);
        setCapped(result.capped);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'fetch failed');
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(id);
    };
  }, [bbox?.minLat, bbox?.maxLat, bbox?.minLon, bbox?.maxLon]);

  return { flights, queriedRadiusNm, capped, error };
}

function isAbortError(err: unknown): boolean {
  return (
    err instanceof DOMException && err.name === 'AbortError'
  ) || (
    err instanceof Error && err.name === 'AbortError'
  );
}
