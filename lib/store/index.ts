import { create } from 'zustand';

import type { LiveFlight, TrajectorySample } from '@/types/flight';

type TrackingState =
  | 'idle'
  | 'at_airport'
  | 'boarding'
  | 'in_flight'
  | 'landed'
  | 'confirm';

type FlappyStore = {
  trackingState: TrackingState;
  setTrackingState: (s: TrackingState) => void;

  trajectoryBuffer: TrajectorySample[];
  appendSample: (sample: TrajectorySample) => void;
  clearBuffer: () => void;

  nearbyFlights: LiveFlight[];
  setNearbyFlights: (flights: LiveFlight[]) => void;
};

export const useFlappyStore = create<FlappyStore>((set) => ({
  trackingState: 'idle',
  setTrackingState: (trackingState) => set({ trackingState }),

  trajectoryBuffer: [],
  appendSample: (sample) =>
    set((s) => ({ trajectoryBuffer: [...s.trajectoryBuffer, sample] })),
  clearBuffer: () => set({ trajectoryBuffer: [] }),

  nearbyFlights: [],
  setNearbyFlights: (nearbyFlights) => set({ nearbyFlights }),
}));
