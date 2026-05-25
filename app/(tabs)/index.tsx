import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <Text style={styles.subtitle}>
        Live flight tracking goes here.{'\n'}MapLibre + OpenSky overlay.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, opacity: 0.6, textAlign: 'center' },
});
