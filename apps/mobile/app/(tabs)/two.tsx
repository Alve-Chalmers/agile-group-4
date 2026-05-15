import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ProductCard } from '@/components/ProductCard';
import { ProductPopup } from '@/components/ProductPopup';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Text } from '@/components/Text';
import { View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';
const MS_PER_DAY = 1000 * 3600 * 24;

export default function TabTwoScreen() {
  const { data: home, ...fetchProducts } = trpc.home.getHome.useQuery();

  const products = useMemo(() => {
    return home?.products ?? [];
  }, [home?.products]);

  const { data: recipes } = trpc.recipe.getRecipesForIngredients.useQuery({
    ingredients: products.map((p) => p.name),
  });

  const [popup, setPopup] = useState<number | null>(null);
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

  const onDone = useCallback(() => {
    setPopup(null);
    load();
  }, [load]);

  if (products.length === 0) {
    return (
      <ThemeView style={tw.style('flex-1 items-center justify-center gap-4 p-6 pt-4')}>
        <Text style={tw.style('text-center text-[14px] text-error')}>No products found</Text>
        <Button text="Refresh" onPress={load} variant="primary" />
      </ThemeView>
    );
  }

  return (
    <ScrollView contentContainerStyle={tw.style('flex-grow px-4')}>
      <View style={tw.style('flex-1 gap-2.5 pt-4')}>
        <Text style={tw.style('mb-3 text-2xl font-bold')}>Products</Text>
        <View style={tw.style('flex-row flex-wrap items-center gap-2')}>
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
        </View>
        <View style={tw.style('mb-4 min-h-[80px] w-full gap-3')}>
          {sortedProducts.map((product) => {
            return <ProductCard key={product.id} product={product.id} openEditPopup={setPopup} />;
          })}
        </View>
        {popup !== null && <ProductPopup popup={popup} onDone={onDone} />}
      </View>
      <View style={tw.style('gap-4')}>
        <Text className="text-2xl font-bold">Recipes</Text>
        <View style={tw.style('flex-row flex-wrap gap-2')}>
          {recipes?.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
          {(!recipes || recipes.length === 0) && (
            <Text>No recipes found matching your ingredients</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
