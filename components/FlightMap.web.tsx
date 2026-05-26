import 'maplibre-gl/dist/maplibre-gl.css';

import { useCallback, useMemo, useState } from 'react';
import {
  Layer,
  Map,
  Marker,
  Popup,
  Source,
  type ViewState,
} from 'react-map-gl/maplibre';

import PlaneIcon from '@/components/PlaneIcon';
import { useAnimatedFlights, type TrackedFlight } from '@/lib/tracking/useAnimatedFlights';
import type { LiveFlight } from '@/types/flight';

type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };

type Props = {
  flights: LiveFlight[];
  onViewportChange?: (bbox: BBox) => void;
};

const INITIAL_VIEW: Partial<ViewState> = {
  longitude: 55.3644,
  latitude: 25.2532,
  zoom: 6,
};

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : 'https://demotiles.maplibre.org/style.json';

export default function FlightMap({ flights, onViewportChange }: Props) {
  const animated = useAnimatedFlights(flights);
  const [viewState, setViewState] = useState<Partial<ViewState>>(INITIAL_VIEW);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => animated.find((f) => f.icao24 === selectedId) ?? null,
    [animated, selectedId],
  );

  const trailGeoJson = useMemo(() => buildTrailGeoJson(animated), [animated]);

  const handleMove = useCallback(
    (evt: { viewState: ViewState; target: maplibregl.Map }) => {
      setViewState(evt.viewState);
      if (onViewportChange) {
        const bounds = evt.target.getBounds();
        onViewportChange({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLon: bounds.getWest(),
          maxLon: bounds.getEast(),
        });
      }
    },
    [onViewportChange],
  );

  return (
    <Map
      {...viewState}
      onMove={handleMove}
      onClick={() => setSelectedId(null)}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}>
      <Source id="flight-trails" type="geojson" data={trailGeoJson}>
        <Layer
          id="flight-trails-line"
          type="line"
          paint={{
            'line-color': '#1f6feb',
            'line-width': 1.5,
            'line-opacity': 0.45,
          }}
          layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        />
      </Source>

      {animated.map((f) => (
        <Marker
          key={f.icao24}
          longitude={f.lon}
          latitude={f.lat}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedId(f.icao24 ?? null);
          }}>
          <PlaneIcon
            rotationDeg={f.trackDeg}
            color={f.onGround ? '#9aa4b2' : selectedId === f.icao24 ? '#fb8500' : '#1f6feb'}
            size={f.onGround ? 16 : 22}
          />
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={selected.lon}
          latitude={selected.lat}
          anchor="bottom"
          offset={18}
          closeOnClick={false}
          onClose={() => setSelectedId(null)}>
          <div style={{ fontSize: 13, lineHeight: 1.4, minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {selected.callsign ?? selected.icao24}
            </div>
            {selected.aircraftType && (
              <div style={{ opacity: 0.7 }}>{selected.aircraftType}</div>
            )}
            {selected.aircraftReg && (
              <div style={{ opacity: 0.7 }}>{selected.aircraftReg}</div>
            )}
            <div style={{ marginTop: 6 }}>
              {Math.round(selected.altitudeMeters * 3.281).toLocaleString()} ft
            </div>
            <div>
              {Math.round(selected.groundSpeedMps * 1.944)} kt
              {' · '}
              {Math.round(selected.trackDeg)}°
            </div>
            {selected.onGround && (
              <div style={{ marginTop: 4, color: '#888' }}>on ground</div>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}

function buildTrailGeoJson(flights: TrackedFlight[]) {
  return {
    type: 'FeatureCollection' as const,
    features: flights
      .filter((f) => f.trail.length >= 2)
      .map((f) => ({
        type: 'Feature' as const,
        properties: { icao24: f.icao24 },
        geometry: {
          type: 'LineString' as const,
          coordinates: f.trail.map((p) => [p.lon, p.lat]),
        },
      })),
  };
}
