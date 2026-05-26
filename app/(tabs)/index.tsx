import { useState } from 'react';
import { StyleSheet } from 'react-native';

import FlightMap from '@/components/FlightMap';
import { Text, View } from '@/components/Themed';
import { useNearbyFlights } from '@/lib/api/useNearbyFlights';

type BBox = { minLat: number; maxLat: number; minLon: number; maxLon: number };

const INITIAL_BBOX: BBox = {
  minLat: 22,
  maxLat: 28,
  minLon: 52,
  maxLon: 58,
};

export default function MapScreen() {
  const [bbox, setBbox] = useState<BBox>(INITIAL_BBOX);
  const { flights, queriedRadiusNm, capped, error } = useNearbyFlights(bbox);

  let hudLabel: string;
  if (error) {
    hudLabel = `⚠️ ${error}`;
  } else if (capped) {
    hudLabel = `${flights.length} flights · within ${queriedRadiusNm}nm of center`;
  } else {
    hudLabel = `${flights.length} flights nearby`;
  }

  return (
    <View style={styles.container}>
      <FlightMap flights={flights} onViewportChange={setBbox} />
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>{hudLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hud: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  hudText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
