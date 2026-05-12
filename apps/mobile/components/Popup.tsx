import { Modal, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { View as ThemeView } from '@/components/Themed';
import tw from '@/lib/tailwind';
import { trpc } from '@/lib/trpc';
import type { Product } from '@/lib/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export type PopupProps = {
  popup: Product | null;
  setPopup: Dispatch<SetStateAction<Product | null>>;
  onSuccess: () => void;
};

export function Popup({ popup, setPopup, onSuccess }: PopupProps) {
  const changeProduct = trpc.home.changeProduct.useMutation({
    onSuccess: () => {
      onSuccess();
      setPopup(null);
    },
  });

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');

  useEffect(() => {
    if (!popup) {
      return;
    }
    setNewName(popup.name);
    setNewCategory(popup.category ?? '');
    setNewExpiresAt(popup.expiresAt.slice(0, 10));
  }, [popup]);

  if (!popup) {
    return null;
  }

  return (
    <Modal visible={!!popup} transparent animationType="fade" onRequestClose={() => setPopup(null)}>
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
              changeProduct.mutate({
                id: popup.id,
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
