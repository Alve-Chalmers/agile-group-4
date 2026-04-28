import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

import { Text, View } from "@/components/Themed";
import { signInWithEmail } from "@/lib/auth";

function ExampleComponent({ name, styles }: { name: string; styles: any }) {
  return <Text style={styles?.title}>Hello {name}!</Text>;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setError(null);

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <ExampleComponent
        styles={{
          title: {
            color: "red",
          },
        }}
        name="John"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={() => void onLogin()}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          loading && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonLabel}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Link href="./signup" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Need an account? Sign up</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  error: {
    color: "#b91c1c",
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#18181b",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 6,
    alignSelf: "center",
    padding: 6,
  },
  linkText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
});
