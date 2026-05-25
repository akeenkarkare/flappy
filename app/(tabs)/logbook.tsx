import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function LogbookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logbook</Text>
      <Text style={styles.subtitle}>
        Auto-logged flights and lifetime stats land here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, opacity: 0.6, textAlign: 'center' },
});
