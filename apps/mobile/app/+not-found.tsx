import { router, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen {"doesn't"} exist.</Text>

        <Button text="Go to home screen" variant="primary" className="mt-6" onPress={() => router.replace('/')} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
