import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';


import { Text, View } from '@/components/Themed';
import { useAuthSession } from '@/lib/auth';

type Product = {
  id: number;
  name: string;
  updatedAt: Date;
  expiresAt: Date;
  category: string;
  homeId: number;
  addedAt: Date;

};

export default function TabTwoScreen() {
  const dummyProducts: Product[] = [
  {
    id: 1,
    name: 'Milk',
    category: 'Dairy',
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    homeId: 1,
    addedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bananas',
    category: 'Fruit',
    updatedAt: new Date(),
    expiresAt: new Date(),
    homeId: 1,
    addedAt: new Date(),
  }
];
  const [products, setProducts] = useState<Product[]>([]);
  const { state: authState } = useAuthSession();

  useEffect(() => {
    if (authState !== 'authenticated') return;
    setTimeout(() => {
    setProducts(dummyProducts);
    }, 500);
    }, [authState]);
    /*const fetchProducts = async () => {
        const product = await trpcServer.home.getProducts.query();
        setProducts(product);
    };
    fetchProducts();
  }, [authState]);*/
  if (authState !== 'authenticated') {
    return <Text>You must be logged in</Text>;
  }
  if (products.length === 0) {
    return <Text>No products found</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Products</Text>
      <View style={styles.separator} />
      <View style={styles.listContainer}>
        {products.map((product) => {
          const expirydate = new Date(product.expiresAt);
          const daysToexpire = Math.ceil((expirydate.getTime() - Date.now()) / (1000 * 3600 * 24));
        return (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text>Expires in: {daysToexpire} days.</Text>
          </View>
        );})}
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  separator: {
    marginBottom: 16,
    height: 1,
    width: '100%',
  },
  listContainer: {
    gap: 10,
  },
  productCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(120,120,128,0.12)',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
});
