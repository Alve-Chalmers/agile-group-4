import { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Input } from '@/components/Input';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Text } from '@/components/Text';
import { View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';

const MS_PER_DAY = 1000 * 3600 * 24;

export default function TabTwoScreen() {
  const { data: home, ...fetchProducts } = trpc.home.getHome.useQuery();
  const changeProduct = trpc.home.changeProduct.useMutation({
    onSuccess: () => fetchProducts.refetch(),
  });
  const removeProductMutation = trpc.home.removeProduct.useMutation();

  const products = useMemo(() => {
    return home?.products ?? [];
  }, [home?.products]);

  const { data: recipes } = trpc.recipe.getRecipesForIngredients.useQuery({
    ingredients: products.map((p) => p.name),
  });

  const [popup, setPopup] = useState<(typeof products)[0] | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [sort, setSort] = useState('All');
  const [sortAsc, setAsc] = useState(false);

  const sortedProducts = useMemo(() => {
    const filtered = (() => {
      switch (sort) {
        case 'Expiring':
          return products.filter(
            (p) => (new Date(p.expiresAt).getTime() - Date.now()) / MS_PER_DAY < 7,
          );
        case 'Dairy':
          return products.filter((p) => p.category === 'Dairy');
        case 'Produce':
          return products.filter((p) => p.category === 'Produce');
        default:
          return products;
      }
    })();
    const byExpiry = [...filtered].sort(
      (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
    return sortAsc ? byExpiry.reverse() : byExpiry;
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
    setNewExpiresAt(product.expiresAt.slice(0, 10));
  }, []);

  if (products.length === 0) {
    return (
      <ThemeView style={tw.style('flex-1 items-center justify-center gap-4 p-6 pt-4')}>
        <Text style={tw.style('text-center text-[14px] text-error')}>No products found</Text>
        <Button text="Refresh" onPress={load} variant="primary" />
      </ThemeView>
    );
  }

  return (
    <ScrollView contentContainerStyle={tw.style('flex-grow')}>
      <ThemeView style={tw.style('flex-1 gap-2.5 p-6 pt-4')}>
        <Text style={tw.style('mb-3 text-2xl font-bold')}>Products</Text>
        <ThemeView style={tw.style('flex-row flex-wrap items-center gap-2')}>
          <Chip
            label={sortAsc ? 'Ascending' : 'Descending'}
            selected={sortAsc}
            onPress={() => setAsc(!sortAsc)}
          />
          {['All', 'Produce', 'Expiring', 'Dairy'].map((str) => (
            <Chip
              key={str}
              label={str}
              selected={sort === str}
              onPress={() => setSort(sort === str ? 'All' : str)}
            />
          ))}
        </ThemeView>
        <ThemeView style={tw.style('mb-4 min-h-[80px] w-full gap-3')}>
          {sortedProducts.map((product) => {
            const expiryDate = new Date(product.expiresAt);
            const daysToExpire = Math.ceil((expiryDate.getTime() - Date.now()) / MS_PER_DAY);
            return (
              <ThemeView
                key={product.id}
                style={tw.style('gap-2 rounded-lg bg-black/10 p-4 bg-background-900')}
              >
                <Text style={tw.style('mb-1 text-base font-semibold')}>{product.name}</Text>
                <Text style={tw.style('mb-1 text-[13px] opacity-70')}>{product.category}</Text>
                <Text>Expires in: {daysToExpire} days.</Text>
                <ThemeView style={tw.style('mt-2 flex-row flex-wrap gap-2 bg-inherit')}>
                  <Button
                    variant="secondary"
                    text={removeProductMutation.isPending ? 'Removing...' : 'Remove'}
                    onPress={() => removeCall(product.id)}
                    disabled={removeProductMutation.isPending}
                  />
                  <Button variant="primary" text="Change" onPress={() => openSetPopup(product)} />
                </ThemeView>
              </ThemeView>
            );
          })}
        </ThemeView>

        <Modal
          visible={popup !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPopup(null)}
        >
          <View style={tw.style('flex-1 items-center justify-center bg-black/50 p-6')}>
            <ThemeView style={tw.style('w-full max-w-[380px] gap-2 rounded-lg bg-auth-screen p-6')}>
              <View style={tw.style('flex-row justify-end pb-3')}>
                <Button variant="outline" text="Close" onPress={() => setPopup(null)} />
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
                  if (!popup) return;
                  changeProduct.mutate(
                    {
                      id: popup.id,
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
      <ThemeView style={tw.style('flex-1 gap-4')}>
        <Text className="text-2xl font-bold">Recipes</Text>
        <ThemeView style={tw.style('flex-row flex-wrap gap-2')}>
          {recipes?.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </ThemeView>
      </ThemeView>
    </ScrollView>
  );
}
