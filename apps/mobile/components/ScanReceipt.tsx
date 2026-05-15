import { Text, View } from '@/components/Themed';
import { trpc } from '@/lib/trpc';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

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
        category: item.category ?? 'Övrigt',
        expiresAt: item.expiresAt,
      });
    }
    setModalVisible(false);
    setScannedItems([]);
  };

  return (
    <View>
      <Pressable
        onPress={pickAndScan}
        disabled={scanMutation.isPending}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>
          {scanMutation.isPending ? 'Scanning…' : 'Scan Receipt'}
        </Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hittade produkter</Text>
            <ScrollView>
              {scannedItems.map((item, i) => (
                <View key={i} style={styles.item}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.category ?? 'Okänd kategori'}</Text>
                  <Text style={styles.itemDetail}>Går ut: {item.expiresAt.split('T')[0]}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              onPress={confirmItems}
              disabled={addProductMutation.isPending}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonLabel}>
                {addProductMutation.isPending ? 'Lägger till…' : 'Lägg till alla'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>Avbryt</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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
