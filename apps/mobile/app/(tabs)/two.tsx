import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { Text, View } from '@/components/Themed';
import { trpc } from '@/lib/trpc';

export default function TabTwoScreen() {
  const fetchProducts = trpc.home.getHome.useQuery();
  const changeProduct = trpc.home.changeProduct.useMutation({
    onSuccess: () => fetchProducts.refetch(),
  });
  const removeProductMutation = trpc.home.removeProduct.useMutation();
  const products = fetchProducts.data?.products || [];

  const [popup, setPopup] = useState<(typeof products)[0] | null>(null);
  const [productsId, setProductId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [sort, setSort] = useState('All');
  const [sortAsc, setAsc] = useState(false);

  const sortedProducts = useMemo(() => {
    const sorted = products;
    let selection;
    switch (sort) {
      case 'Expiring':
        selection = sorted.filter(product => ((new Date(product.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24) ) < 7);
        break;
      case 'Dairy':
        selection = sorted.filter(product => product.category === 'Dairy');
        break;
      case 'Produce':
        selection = sorted.filter(product => product.category === 'Produce');
        break;
      default:
        selection = sorted;
    }
    let result = selection.sort( (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    return sortAsc ? result.reverse() : result;
  }, [products, sort, sortAsc]);

  const load = useCallback(() => {
    void fetchProducts.refetch();
  }, [fetchProducts]);

  const removeCall = useCallback(
    (productId: number) => {
      removeProductMutation.mutate(
        { id: productId.toString() },
        {
          onSuccess: () => {
            void fetchProducts.refetch();
          },
        },
      );
    },
    [removeProductMutation, fetchProducts],
  );

  const openSetPopup = useCallback((product: (typeof products)[0]) => {
    setPopup(product);
    setNewName(product.name);
    setNewCategory(product?.category ?? '');
    setProductId('' + product.id);
    const time = product.expiresAt.slice(0, 10);
    setNewExpiresAt(time);
  }, []);

  if (products.length === 0) {
    return (
      <View style={[styles.container]}>
        <Text style={styles.errorText}>No products found</Text>
        <Pressable
          onPress={load}
          style={({ pressed }) => [styles.centeredButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Products</Text>
      <View style={styles.buttonRow}>
        <Pressable
                onPress={() => setAsc(!sortAsc)}
                style={({ pressed }) => [styles.sortButton, pressed && styles.buttonPressed,]}>
                <Text style={styles.buttonLabel}>{sortAsc ? "Ascending" : "Descending"}</Text>
        </Pressable>
        {['All', 'Produce', 'Expiring', 'Dairy'].map((str) => {
          return (
            <Pressable
                onPress={() => setSort(sort === str ? 'All' : str)}
                style={({ pressed }) => [styles.sortButton, sort === str && styles.sortButtonSelected, pressed && styles.buttonPressed,]}>
                <Text style={styles.buttonLabel}>{str}</Text>
             </Pressable>
          );})
        }
      </View>
      <View style={[styles.listContainer]}>
      {sortedProducts.map((product) => {
        const expiryDate = new Date(product.expiresAt);
        const daysToExpire = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));
        return (
          <View key={product.id} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text>Expires in: {daysToExpire} days.</Text>
            <Pressable
              onPress={() => removeCall(product.id)}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed,]}
              disabled={removeProductMutation.isPending}>
            <Text style={styles.buttonLabel}> {removeProductMutation.isPending ? "Removing..." : "Remove Ingredient!"}</Text>
            </Pressable>
            <Pressable
              onPress={() => openSetPopup(product)}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed,]}>
            <Text style={styles.buttonLabel}>Change!</Text>
            </Pressable>
          </View> );})}
      </View>

    {popup && (
      <View style = {styles.overlay}>
        <View style = {styles.modal}>
          <TextInput
            placeholder="Product Name"
            value={newName}
            onChangeText={setNewName}
            style={styles.textInput}
          />
          <TextInput
            placeholder="Category"
            value={newCategory}
            onChangeText={setNewCategory}
            style={styles.textInput}
          />
          <TextInput
            placeholder="Expiration Date"
            value={newExpiresAt}
            onChangeText={setNewExpiresAt}
            style={styles.textInput}
          />
          <Pressable
              onPress={() => setPopup(null)}
              style={({ pressed }) => [styles.exitButton, pressed && styles.buttonPressed,]}>
            <Text style={styles.buttonLabel}>Exit!</Text>
          </Pressable>
          <Pressable
              onPress={() => changeProduct.mutate({
                id: Number(productsId),
                category: newCategory,
                expiresAt: newExpiresAt,
                name: newName,
              })}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed,]}>
            <Text style={styles.buttonLabel}>Change!</Text>
          </Pressable>
        </View>
      </View>
    )}
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sortButtonSelected: {
    backgroundColor: '#044f0b',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    position: 'relative',
    borderRadius: '8px',
    padding: 40,
    paddingHorizontal: 200,
  },
  exitButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#18181b',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  contentContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 1,
    width: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#18181b',
  },
  sortButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#18181b',
  },
  centeredButton: {
    marginTop: 16,
    alignSelf: 'center',
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
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
