import { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text, View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';

export default function TabTwoScreen() {
  const fetchProducts = trpc.home.getHome.useQuery();
  const changeProduct = trpc.home.changeProduct.useMutation({
    onSuccess: () => fetchProducts.refetch(),
  });
  const removeProductMutation = trpc.home.removeProduct.useMutation();

  const products = useMemo(() => {
    return fetchProducts.data?.products || [];
  }, [fetchProducts]);

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
        selection = sorted.filter(
          (product) =>
            (new Date(product.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24) < 7,
        );
        break;
      case 'Dairy':
        selection = sorted.filter((product) => product.category === 'Dairy');
        break;
      case 'Produce':
        selection = sorted.filter((product) => product.category === 'Produce');
        break;
      default:
        selection = sorted;
    }
    let result = selection.sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
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
      <ThemeView style={[styles.container, styles.centeredEmpty]}>
        <Text style={styles.errorText}>No products found</Text>
        <Button text="Refresh" onPress={load} variant="primary" />
      </ThemeView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <ThemeView style={styles.container}>
        <Text style={styles.title}>Products</Text>
        <ThemeView style={styles.buttonRow}>
          <Button
            density="compact"
            variant={sortAsc ? 'primary' : 'secondary'}
            text={sortAsc ? 'Ascending' : 'Descending'}
            onPress={() => setAsc(!sortAsc)}
          />
          {['All', 'Produce', 'Expiring', 'Dairy'].map((str) => (
            <Button
              density="compact"
              key={str}
              variant={sort === str ? 'primary' : 'secondary'}
              text={str}
              onPress={() => setSort(sort === str ? 'All' : str)}
            />
          ))}
        </ThemeView>
        <ThemeView style={[styles.listContainer]}>
          {sortedProducts.map((product) => {
            const expiryDate = new Date(product.expiresAt);
            const daysToExpire = Math.ceil(
              (expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24),
            );
            return (
              <ThemeView key={product.id} style={styles.card}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text>Expires in: {daysToExpire} days.</Text>
                <ThemeView style={styles.cardActions}>
                  <Button
                    density="compact"
                    variant="secondary"
                    text={removeProductMutation.isPending ? 'Removing...' : 'Remove'}
                    onPress={() => removeCall(product.id)}
                    disabled={removeProductMutation.isPending}
                  />
                  <Button
                    density="compact"
                    variant="primary"
                    text="Change"
                    onPress={() => openSetPopup(product)}
                  />
                </ThemeView>
              </ThemeView>
            );
          })}
        </ThemeView>

        <Modal visible={popup !== null} transparent animationType="fade" onRequestClose={() => setPopup(null)}>
          <View style={styles.overlay}>
            <ThemeView style={styles.modal}>
              <View style={tw.style('flex-row justify-end pb-3')}>
                <Button density="compact" variant="outline" text="Close" onPress={() => setPopup(null)} />
              </View>
              <Input placeholder="Product Name" value={newName} onChangeText={setNewName} />
              <Input placeholder="Category" value={newCategory} onChangeText={setNewCategory} />
              <Input
                placeholder="Expiration Date"
                value={newExpiresAt}
                onChangeText={setNewExpiresAt}
                containerClassName="mb-2"
              />
              <Button
                text={changeProduct.isPending ? 'Saving…' : 'Apply'}
                onPress={() => {
                  changeProduct.mutate(
                    {
                      id: Number(productsId),
                      category: newCategory,
                      expiresAt: newExpiresAt,
                      name: newName,
                    },
                    {
                      onSuccess: () => setPopup(null),
                    },
                  );
                }}
                variant="primary"
                className="w-full self-stretch"
                disabled={changeProduct.isPending}
              />
            </ThemeView>
          </View>
        </Modal>
      </ThemeView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 8,
    padding: 24,
    backgroundColor: '#f4f4f1',
    gap: 8,
  },
  centeredEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
    alignItems: 'center',
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
    width: '100%',
    minHeight: 80,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(120,120,128,0.12)',
    gap: 8,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
  },
});
