import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getApiBaseUrl } from '@/lib/api-base';
import { trpc } from '@/lib/trpc';

type HealthJson = { status: string };

export default function ApiExampleScreen() {
  const apiUrl = getApiBaseUrl();
  const [health, setHealth] = useState<HealthJson | null>(null);
  const [ping, setPing] = useState<{ pong: true } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const healthRes = await fetch(`${apiUrl}/health`);
      if (!healthRes.ok) {
        throw new Error(`/health returned ${healthRes.status}`);
      }
      const healthJson = (await healthRes.json()) as HealthJson;

      const pingJson = await trpc.ping.query();

      setHealth(healthJson);
      setPing(pingJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
      setHealth(null);
      setPing(null);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>API data fetching</Text>
        <Text style={styles.muted}>GET {apiUrl}/health</Text>
        <Text style={styles.muted}>tRPC ping → {apiUrl}/trpc</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Health</Text>
          <Text style={styles.value}>
            {health ? JSON.stringify(health) : loading ? '…' : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>tRPC ping</Text>
          <Text style={styles.value}>
            {ping ? JSON.stringify(ping) : loading ? '…' : '—'}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={() => void load()}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={loading}
        >
          <Text style={styles.buttonLabel}>{loading ? 'Loading…' : 'Refresh'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  muted: {
    fontSize: 13,
    opacity: 0.65,
  },
  card: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  error: {
    marginTop: 8,
    color: '#b91c1c',
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#18181b',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
});
