import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuthSession } from '@/lib/auth';

export default function AuthLayout() {
  const { state } = useAuthSession();

  if (state === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Checking your session...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Create account' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    opacity: 0.75,
  },
});
