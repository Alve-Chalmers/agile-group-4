import { Modal, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

export type ProductPopupProps = {
  popup: number | null;
  onDone: () => void;
};

function useProduct(id: number) {
  const fetchProduct = trpc.home.getHome.useQuery();
  return fetchProduct.data?.products.find((p) => p.id === id) ?? null;
}

export function ProductPopup({ popup, onDone }: ProductPopupProps) {
  const changeProduct = trpc.home.changeProduct.useMutation({
    onSuccess: () => {
      onDone();
    },
  });

  if (!popup) {
      return null;
    }

  const product = useProduct(popup);
  const [newName, setNewName] = useState(product?.name ?? '');
  const [newCategory, setNewCategory] = useState(product?.category ?? '');
  const [newExpiresAt, setNewExpiresAt] = useState(product?.expiresAt.slice(0, 10) ?? '');

  return (

    <Modal visible={!!popup} transparent animationType="fade" onRequestClose={() => onDone()}>
      <View style={tw.style('flex-1 items-center justify-center bg-black/50 p-6')}>
        <ThemeView style={tw.style('w-full max-w-[380px] gap-2 rounded-lg bg-auth-screen p-6')}>
          <View style={tw.style('flex-row justify-end pb-3')}>
            <Button variant="outline" text="Close" onPress={() => onDone()} />
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
              changeProduct.mutate({
                id: popup,
                category: newCategory,
                expiresAt: newExpiresAt,
                name: newName,
              });
            }}
            variant="primary"
            className="w-full self-stretch"
            disabled={changeProduct.isPending}
          />
        </ThemeView>
      </View>
    </Modal>
  );
}
