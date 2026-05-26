import { useEffect, useRef, useState } from 'react';

import type { LiveFlight } from '@/types/flight';

export type TrackedFlight = LiveFlight & {
  trail: { lat: number; lon: number }[];
};

const HISTORY_LIMIT = 6;
const STALE_AFTER_MS = 60_000;

type Snapshot = {
  lat: number;
  lon: number;
  trackDeg: number;
  groundSpeedMps: number;
  sampledAt: number;
};

export function useAnimatedFlights(flights: LiveFlight[]): TrackedFlight[] {
  const historyRef = useRef(new Map<string, { snapshots: Snapshot[]; meta: LiveFlight }>());
  const [, force] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const map = historyRef.current;

    for (const f of flights) {
      const key = f.icao24;
      if (!key) continue;
      const entry = map.get(key) ?? { snapshots: [], meta: f };
      const last = entry.snapshots[entry.snapshots.length - 1];
      if (!last || last.lat !== f.lat || last.lon !== f.lon) {
        entry.snapshots.push({
          lat: f.lat,
          lon: f.lon,
          trackDeg: f.trackDeg,
          groundSpeedMps: f.groundSpeedMps,
          sampledAt: now,
        });
        if (entry.snapshots.length > HISTORY_LIMIT) entry.snapshots.shift();
      }
      entry.meta = f;
      map.set(key, entry);
    }

    for (const [key, entry] of map) {
      const last = entry.snapshots[entry.snapshots.length - 1];
      if (!last || now - last.sampledAt > STALE_AFTER_MS) {
        map.delete(key);
      }
    }
  }, [flights]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      force((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tracked: TrackedFlight[] = [];
  const now = Date.now();
  for (const entry of historyRef.current.values()) {
    const last = entry.snapshots[entry.snapshots.length - 1];
    if (!last) continue;
    const { lat, lon } = deadReckon(last, now);
    tracked.push({
      ...entry.meta,
      lat,
      lon,
      trail: entry.snapshots.map((s) => ({ lat: s.lat, lon: s.lon })),
    });
  }
  return tracked;
}

function deadReckon(s: Snapshot, nowMs: number) {
  const elapsedSec = Math.max(0, (nowMs - s.sampledAt) / 1000);
  if (s.groundSpeedMps <= 0 || elapsedSec === 0) return { lat: s.lat, lon: s.lon };

  const distM = s.groundSpeedMps * elapsedSec;
  const distRad = distM / 6_371_000;
  const trackRad = (s.trackDeg * Math.PI) / 180;
  const latRad = (s.lat * Math.PI) / 180;
  const lonRad = (s.lon * Math.PI) / 180;

  const newLat = Math.asin(
    Math.sin(latRad) * Math.cos(distRad) +
      Math.cos(latRad) * Math.sin(distRad) * Math.cos(trackRad),
  );
  const newLon =
    lonRad +
    Math.atan2(
      Math.sin(trackRad) * Math.sin(distRad) * Math.cos(latRad),
      Math.cos(distRad) - Math.sin(latRad) * Math.sin(newLat),
    );

  return { lat: (newLat * 180) / Math.PI, lon: (newLon * 180) / Math.PI };
}
