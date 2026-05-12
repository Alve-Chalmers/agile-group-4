import { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Popup } from '@/components/Popup';
import { ProductCard } from '@/components/ProductCard';
import { Text, View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';

export default function TabTwoScreen() {
  const MS_PER_DAY = 1000 * 3600 * 24;
  const fetchProducts = trpc.home.getHome.useQuery();

  const products = useMemo(
    () => fetchProducts.data?.products ?? [],
    [fetchProducts.data?.products],
  );

  const [popup, setPopup] = useState<(typeof products)[0] | null>(null);
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
  }, [products, sort, sortAsc, MS_PER_DAY]);

  const load = useCallback(() => {
    void fetchProducts.refetch();
  }, [fetchProducts]);

  const openSetPopup = useCallback((product: (typeof products)[0]) => {
    setPopup(product);
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
            return (
              <ProductCard
                key={product.id}
                product={product}
                openSetPopup={openSetPopup}
                onSuccess={load}
              />
            );
          })}
        </ThemeView>
        <Popup popup={popup} setPopup={setPopup} onSuccess={load} />
      </ThemeView>
    </ScrollView>
  );
}
