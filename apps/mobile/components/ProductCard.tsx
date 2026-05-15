import { useCallback } from 'react';

import { Button } from '@/components/Button';
import { Text, View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';

export type ProductCardProps = {
  product: number;
  openEditPopup: (id: number) => void;
};

function useProduct(id: number) {
  const fetchProduct = trpc.home.getHome.useQuery();
  return fetchProduct.data?.products.find((p) => p.id === id) ?? null;
}

export function ProductCard({ product, openEditPopup }: ProductCardProps) {
  const removeProductMutation = trpc.home.removeProduct.useMutation();

  const removeCall = useCallback(
    (productId: number) => {
      removeProductMutation.mutate(
        { id: productId.toString() },
      );
    },
    [removeProductMutation],
  );
  const productData = useProduct(product);
  const MS_PER_DAY = 1000 * 3600 * 24;
  if (!productData) {
    return null;
  }
  return (
    <ThemeView style={tw.style('gap-2 rounded-lg bg-black/10 p-4 bg-background-900')}>
      <Text style={tw.style('mb-1 text-base font-semibold')}>{productData.name}</Text>
      <Text style={tw.style('mb-1 text-[13px] opacity-70')}>{productData.category}</Text>
      <Text>Expires in: { Math.ceil((new Date(productData.expiresAt).getTime() - Date.now()) / MS_PER_DAY)} days.</Text>
      <ThemeView style={tw.style('mt-2 flex-row flex-wrap gap-2 bg-inherit')}>
        <Button
          variant="secondary"
          text={removeProductMutation.isPending ? 'Removing...' : 'Remove'}
          onPress={() => removeCall(product)}
          disabled={removeProductMutation.isPending}
        />
        <Button variant="primary" text="Change" onPress={() => openEditPopup(product)} />
      </ThemeView>
    </ThemeView>
  );
}
