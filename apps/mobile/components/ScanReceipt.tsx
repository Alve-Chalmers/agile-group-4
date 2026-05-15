import { Text, View } from '@/components/Themed';
import { trpc } from '@/lib/trpc';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet } from 'react-native';
import { Button } from './Button';

type ScannedItem = {
  name: string;
  category: string | null;
  expiresAt: string;
};

export default function ScanReceipt() {
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const scanMutation = trpc.home.scanReceipt.useMutation();
  const addProductMutation = trpc.home.addProduct.useMutation();

  const pickAndScan = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0].base64) return;

    const base64 = result.assets[0].base64;

    try {
      const { items } = await scanMutation.mutateAsync({
        imageBase64: base64,
        mediaType: 'image/jpeg',
      });
      setScannedItems(items);
      setModalVisible(true);
    } catch {
      Alert.alert('Fel', 'Kunde inte läsa av kvittot, försök igen.');
    }
  };

  const confirmItems = async () => {
    for (const item of scannedItems) {
      await addProductMutation.mutateAsync({
        name: item.name,
        category: item.category ?? 'Other',
        expiresAt: item.expiresAt,
      });
    }
    setModalVisible(false);
    setScannedItems([]);
  };

  return (
    <>
      <Button variant='secondary' className="self-start" text={scanMutation.isPending ? 'Scanning…' : 'Scan Receipt'} disabled={scanMutation.isPending} onPress={pickAndScan} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Found products</Text>
            <ScrollView>
              {scannedItems.map((item, i) => (
                <View key={i} style={styles.item}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.category ?? 'Unknown category'}</Text>
                  <Text style={styles.itemDetail}>Expires: {item.expiresAt.split('T')[0]}</Text>
                </View>
              ))}
            </ScrollView>
            <Button
              text={addProductMutation.isPending ? 'Adding…' : 'Add all'}
              onPress={confirmItems}
              disabled={addProductMutation.isPending}
            />
            <Button variant='ghost' onPress={() => setModalVisible(false)} text="Cancel" />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#18181b',
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,120,128,0.2)',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  cancelLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
});
