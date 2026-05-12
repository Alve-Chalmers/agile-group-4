import { ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text, View } from '@/components/Themed';
import { getApiBaseUrl } from '@/lib/api-base';
import { signOut } from '@/lib/auth';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export default function ApiExampleScreen() {
  const apiUrl = getApiBaseUrl();
  const [productName, setProductName] = useState('');
  const pingQuery = trpc.ping.useQuery();
  const homeQuery = trpc.home.getHome.useQuery();
  const addProductMutation = trpc.home.addProduct.useMutation();

  const error = homeQuery.error?.message ?? pingQuery.error?.message ?? null;
  const loading = homeQuery.isPending || pingQuery.isPending;
  const queryClient = useQueryClient();

  const load = useCallback(() => {
    void homeQuery.refetch();
    void pingQuery.refetch();
  }, [homeQuery, pingQuery]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>API data fetching</Text>
        <Text style={styles.muted}>GET {apiUrl}/health</Text>
        <Text style={styles.muted}>tRPC ping → {apiUrl}/trpc</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Home data</Text>
          <Text style={styles.value}>
            {homeQuery.data ? JSON.stringify(homeQuery.data) : homeQuery.isPending ? '…' : '—'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>tRPC ping</Text>
          <Text style={styles.value}>
            {pingQuery.data ? JSON.stringify(pingQuery.data) : pingQuery.isPending ? '…' : '—'}
          </Text>
        </View>

        {error ? <Text style={tw.style('mt-2 text-[14px] text-error')}>{error}</Text> : null}

        <Button
          text={loading ? 'Loading…' : 'Refresh'}
          onPress={load}
          disabled={loading}
          className="mt-4 self-start"
          variant="primary"
        />

        <Input
          placeholder="Product name"
          value={productName}
          onChangeText={setProductName}
          containerClassName="mt-2"
        />
        <Button
          text={addProductMutation.isPending ? 'Adding…' : 'Add product'}
          onPress={() =>
            addProductMutation.mutate({
              name: productName,
              category: 'Test',
              expiresAt: '2026-05-10',
            })
          }
          disabled={addProductMutation.isPending}
          className="mt-2 self-start"
          variant="secondary"
        />
        <Button
          text={loading ? 'Logging out...' : 'Logout'}
          onPress={() => void signOut(queryClient)}
          disabled={loading}
          className="mt-2 self-start"
          variant="outline"
        />
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
});
