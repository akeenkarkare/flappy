import type { LiveFlight } from '@/types/flight';

const OPENSKY_BASE = 'https://opensky-network.org/api';

type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };

export async function fetchFlightsInBBox(bbox: BBox): Promise<LiveFlight[]> {
  const url = new URL(`${OPENSKY_BASE}/states/all`);
  url.searchParams.set('lamin', String(bbox.minLat));
  url.searchParams.set('lamax', String(bbox.maxLat));
  url.searchParams.set('lomin', String(bbox.minLon));
  url.searchParams.set('lomax', String(bbox.maxLon));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);
  const data = (await res.json()) as { states: unknown[][] | null };

  if (!data.states) return [];

  return data.states
    .map((s) => parseState(s))
    .filter((f): f is LiveFlight => f !== null);
}

function parseState(s: unknown[]): LiveFlight | null {
  const lat = s[6] as number | null;
  const lon = s[5] as number | null;
  if (lat == null || lon == null) return null;

  return {
    icao24: s[0] as string,
    callsign: ((s[1] as string) ?? '').trim() || undefined,
    lat,
    lon,
    altitudeMeters: (s[7] as number) ?? 0,
    groundSpeedMps: (s[9] as number) ?? 0,
    trackDeg: (s[10] as number) ?? 0,
    onGround: (s[8] as boolean) ?? false,
    lastUpdateUtc: new Date(((s[4] as number) ?? 0) * 1000).toISOString(),
    depIata: '',
    arrIata: '',
    depTimeUtc: '',
    arrTimeUtc: '',
  };
}
