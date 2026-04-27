import { StyleSheet, Pressable } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Main Menu</Text>

      <View style={styles.separator} />

      <EditScreenInfo path="app/(tabs)/main-menu.tsx" />
      <View style={styles.grid}>
        <View style={styles.card}>
          <View>
            <Text style={styles.label}>Milk</Text>
            <Text style={styles.muted}>Expires: 2026-05-01</Text>
          </View>

          <Pressable
            onPress={() => {
              console.log('Delete ingredient');
            }}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  separator: {
    marginVertical: 16,
    height: 1,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },

  card: {
    width: 180,
    minHeight: 120,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(120,120,128,0.12)',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
  },

  muted: {
    fontSize: 13,
    opacity: 0.6,
  },

  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },

  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  buttonPressed: {
    opacity: 0.85,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
});