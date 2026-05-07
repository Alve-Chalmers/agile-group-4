import { Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

import { Text, View } from "@/components/Themed";
import { getApiBaseUrl } from "@/lib/api-base";
import { signOut } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export default function ApiExampleScreen() {
  const apiUrl = getApiBaseUrl();
  const [productName, setProductName] = useState("");
  const pingQuery = trpc.ping.useQuery();
  const homeQuery = trpc.home.getHome.useQuery();
  const addProductMutation = trpc.home.addProduct.useMutation();

  const error = homeQuery.error?.message ?? pingQuery.error?.message ?? null;
  const loading = homeQuery.isPending || pingQuery.isPending;
  const queryClient = useQueryClient();

  const load = useCallback(() => {
    void homeQuery.refetch();
    void pingQuery.refetch();
  }, [homeQuery.refetch, pingQuery.refetch]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>API data fetching</Text>
        <Text style={styles.muted}>GET {apiUrl}/health</Text>
        <Text style={styles.muted}>tRPC ping → {apiUrl}/trpc</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Home data</Text>
          <Text style={styles.value}>{homeQuery.data ? JSON.stringify(homeQuery.data) : homeQuery.isPending ? "…" : "—"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>tRPC ping</Text>
          <Text style={styles.value}>{pingQuery.data ? JSON.stringify(pingQuery.data) : pingQuery.isPending ? "…" : "—"}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={load} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={loading}>
          <Text style={styles.buttonLabel}>{loading ? "Loading…" : "Refresh"}</Text>
        </Pressable>

        <TextInput placeholder='Product name' value={productName} onChangeText={setProductName} />
        <Pressable
          onPress={() => addProductMutation.mutate({ name: productName, category: "Test", expiresAt: "2026-05-10" })}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={addProductMutation.isPending}
        >
          <Text style={styles.buttonLabel}>{addProductMutation.isPending ? "Adding…" : "Add product"}</Text>
        </Pressable>
        <Pressable
          onPress={() => void signOut(queryClient)}
          disabled={loading}
          style={({ pressed }) => [styles.button, loading && styles.buttonDisabled, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>{loading ? "Logging out..." : "Logout"}</Text>
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
    fontWeight: "600",
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
    backgroundColor: "rgba(120,120,128,0.12)",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontFamily: "SpaceMono",
  },
  error: {
    marginTop: 8,
    color: "#b91c1c",
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#18181b",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
   buttonDisabled: {
    opacity: 0.6,
  },
});
