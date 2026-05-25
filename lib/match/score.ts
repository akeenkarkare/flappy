import type { LiveFlight, TrajectorySample } from '@/types/flight';

export type Candidate = {
  flight: LiveFlight;
  confidence: number;
};

export function scoreInflightCandidates(
  samples: TrajectorySample[],
  nearby: LiveFlight[],
): Candidate[] {
  if (samples.length === 0 || nearby.length === 0) return [];
  const last = samples[samples.length - 1];

  return nearby
    .map((flight) => {
      const dKm = haversineKm(last.lat, last.lon, flight.lat, flight.lon);
      const altDelta =
        last.altitudeMeters != null
          ? Math.abs(last.altitudeMeters - flight.altitudeMeters)
          : 0;

      const spatial = Math.max(0, 1 - dKm / 5);
      const vertical = Math.max(0, 1 - altDelta / 500);
      const confidence = 0.7 * spatial + 0.3 * vertical;

      return { flight, confidence };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
