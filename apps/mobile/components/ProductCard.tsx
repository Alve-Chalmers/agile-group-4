import { useCallback } from 'react';

import { Button } from '@/components/Button';
import { Text, View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';
import type { Product } from '@/lib/types';

export type ProductCardProps = {
  product: Product;
  openSetPopup: (product: Product) => void;
  onSuccess: () => void;
};

export function ProductCard({ product, openSetPopup, onSuccess }: ProductCardProps) {
  const removeProductMutation = trpc.home.removeProduct.useMutation();

  const removeCall = useCallback(
    (productId: number) => {
      removeProductMutation.mutate(
        { id: productId.toString() },
        {
          onSuccess,
        },
      );
    },
    [removeProductMutation, onSuccess],
  );
  const MS_PER_DAY = 1000 * 3600 * 24;
  const expiryDate = new Date(product.expiresAt);
  const daysToExpire = Math.ceil((expiryDate.getTime() - Date.now()) / MS_PER_DAY);
  return (
    <ThemeView style={tw.style('gap-2 rounded-lg bg-black/10 p-4 bg-background-900')}>
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
}
