import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import type { LiveFlight } from '@/types/flight';

type Props = {
  flights: LiveFlight[];
  onViewportChange?: (bbox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  }) => void;
};

export default function FlightMap(_: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.note}>
        Native map coming next.{'\n'}Run on web for the live map preview.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  note: { opacity: 0.6, textAlign: 'center' },
});
