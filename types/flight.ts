export type Airport = {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
};

export type Flight = {
  iata?: string;
  icao24?: string;
  callsign?: string;
  airline?: string;
  aircraftReg?: string;
  aircraftType?: string;
  depIata: string;
  arrIata: string;
  depTimeUtc: string;
  arrTimeUtc: string;
};

export type LiveFlight = Flight & {
  lat: number;
  lon: number;
  altitudeMeters: number;
  groundSpeedMps: number;
  trackDeg: number;
  onGround: boolean;
  lastUpdateUtc: string;
};

export type LoggedFlight = Flight & {
  id: string;
  userId: string;
  confidence: number;
  source: 'auto-inflight' | 'auto-postland' | 'boarding-pass' | 'manual';
  createdAt: string;
  updatedAt: string;
};

export type TrajectorySample = {
  lat: number;
  lon: number;
  altitudeMeters: number | null;
  pressureHpa: number | null;
  timestampUtc: string;
};
