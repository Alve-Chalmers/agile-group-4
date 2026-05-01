import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { trpc } from "@/lib/trpc";

type Product = {
  id: number;
  name: string;
  updatedAt: string;
  expiresAt: string;
  category: string | null;
  homeId: number;
  addedAt: string;
};

export default function TabTwoScreen() {
  const fetchProducts = trpc.home.getProducts.useQuery();
  const removeProductMutation = trpc.home.removeProduct.useMutation();
  const products = fetchProducts.data || [];
  const load = useCallback(() => {
    void fetchProducts.refetch();
  }, [fetchProducts.refetch]);

  const removeCall = useCallback(
    (productId: number) => { removeProductMutation.mutate( { id: productId.toString() },
        { onSuccess: () => { void fetchProducts.refetch(); }});
      }, [removeProductMutation, fetchProducts]);

  if (products.length === 0) {
    return (
    <View style={[styles.container]}>
      <Text style={styles.errorText}>No products found</Text>
      <Pressable
        onPress={load} style={({ pressed }) => [styles.centeredButton, pressed && styles.buttonPressed]}>
      <Text style={styles.buttonLabel}>Refresh</Text>
      </Pressable>
    </View> );}

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <View style={[styles.listContainer]}>
      {products.map((product) => {
        const expiryDate = new Date(product.expiresAt);
        const daysToExpire = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));
        return (
          <View key={product.id} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text>Expires in: {daysToExpire} days.</Text>
            <Pressable
              onPress={() => removeCall(product.id)}
              style={({ pressed }: { pressed: boolean }) => [styles.button, pressed && styles.buttonPressed,]}
              disabled={removeProductMutation.isPending}>
            <Text style={styles.buttonLabel}> {removeProductMutation.isPending ? "Removing..." : "Remove Ingredient!"}</Text>
            </Pressable>
          </View> );})}
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    gap: 10,
  },
  contentContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 1,
    width: "100%",
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(120,120,128,0.12)",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#18181b",
  },
  centeredButton: {
    marginTop: 16,
    alignSelf: "center",
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
  errorText: {
    fontSize: 14,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 20,
  }
});
