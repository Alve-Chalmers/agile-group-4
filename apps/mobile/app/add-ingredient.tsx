import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { Text } from '@/components/Themed';

export default function AddIngredientScreen() {
  const [name, setName] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const handleSave = () => {
    const [day, month, year] = expirationDate.split('-');
    
    const newIngredient = {
      id: Date.now().toString(),
      name,
      expirationDate,
    };

    console.log('Add ingredient:', newIngredient);
    // TODO: replace when database is implemented

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Add Ingredient</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ingredient name</Text>
          <TextInput
            placeholder="e.g. Milk"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiration date</Text>
          <TextInput
            placeholder="DD-MM-YYYY"
            value={expirationDate}
            onChangeText={setExpirationDate}
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!name.trim() || !expirationDate.trim()}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
            (!name.trim() || !expirationDate.trim()) &&
              styles.saveButtonDisabled,
          ]}
        >
          <Text style={styles.saveButtonText}>Save Ingredient</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});