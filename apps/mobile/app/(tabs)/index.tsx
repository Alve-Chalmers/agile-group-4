import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getApiBaseUrl } from '@/lib/api-base';
import { trpc } from '@/lib/trpc';

type HealthJson = { status: string };

export default function ApiExampleScreen() {
  const apiUrl = getApiBaseUrl();

  const healthQuery = useQuery({
    queryKey: ['health', apiUrl],
    queryFn: async (): Promise<HealthJson> => {
      const healthRes = await fetch(`${apiUrl}/health`);
      if (!healthRes.ok) {
        throw new Error(`/health returned ${healthRes.status}`);
      }
      return (await healthRes.json()) as HealthJson;
    },
  });

  const pingQuery = trpc.ping.useQuery();

  const loading = healthQuery.isPending || pingQuery.isPending;
  const error =
    healthQuery.error?.message ?? pingQuery.error?.message ?? null;

  const load = useCallback(() => {
    void Promise.all([healthQuery.refetch(), pingQuery.refetch()]);
  }, [healthQuery.refetch, pingQuery.refetch]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>API data fetching</Text>
        <Text style={styles.muted}>GET {apiUrl}/health</Text>
        <Text style={styles.muted}>tRPC ping → {apiUrl}/trpc</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Health</Text>
          <Text style={styles.value}>
            {healthQuery.data
              ? JSON.stringify(healthQuery.data)
              : loading
                ? '…'
                : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>tRPC ping</Text>
          <Text style={styles.value}>
            {pingQuery.data
              ? JSON.stringify(pingQuery.data)
              : loading
                ? '…'
                : '—'}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={load}
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
