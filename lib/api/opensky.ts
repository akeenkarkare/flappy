import type { LiveFlight } from '@/types/flight';

type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };

type AdsbAircraft = {
  hex: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  gs?: number;
  track?: number;
  seen?: number;
};

type AdsbResponse = {
  ac?: AdsbAircraft[];
  now?: number;
  queriedRadiusNm?: number;
  capped?: boolean;
};

export type FlightsResult = {
  flights: LiveFlight[];
  queriedRadiusNm: number;
  capped: boolean;
};

export async function fetchFlightsInBBox(
  bbox: BBox,
  signal?: AbortSignal,
): Promise<FlightsResult> {
  const params = new URLSearchParams({
    lamin: String(bbox.minLat),
    lamax: String(bbox.maxLat),
    lomin: String(bbox.minLon),
    lomax: String(bbox.maxLon),
  });

  const res = await fetch(`/api/opensky?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`adsb proxy ${res.status}`);
  const data = (await res.json()) as AdsbResponse;
  const nowMs = (data.now ?? Date.now() / 1000) * 1000;

  return {
    flights: (data.ac ?? [])
      .map((a) => parseAircraft(a, nowMs))
      .filter((f): f is LiveFlight => f !== null),
    queriedRadiusNm: data.queriedRadiusNm ?? 0,
    capped: data.capped ?? false,
  };
}

function parseAircraft(a: AdsbAircraft, nowMs: number): LiveFlight | null {
  if (a.lat == null || a.lon == null) return null;

  const altMeters =
    a.alt_baro === 'ground' || a.alt_baro == null ? 0 : a.alt_baro * 0.3048;
  const gsMps = (a.gs ?? 0) * 0.5144;
  const seenSec = a.seen ?? 0;

  return {
    icao24: a.hex,
    callsign: a.flight?.trim() || undefined,
    aircraftReg: a.r,
    aircraftType: a.t,
    lat: a.lat,
    lon: a.lon,
    altitudeMeters: altMeters,
    groundSpeedMps: gsMps,
    trackDeg: a.track ?? 0,
    onGround: a.alt_baro === 'ground',
    lastUpdateUtc: new Date(nowMs - seenSec * 1000).toISOString(),
    depIata: '',
    arrIata: '',
    depTimeUtc: '',
    arrTimeUtc: '',
  };
}
