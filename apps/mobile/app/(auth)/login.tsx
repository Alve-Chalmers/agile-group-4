import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Key, User } from 'lucide-react-native';

import { AuthScreenShell } from '@/components/auth/AuthScreenShell';
import { AuthTextLinkRow } from '@/components/auth/AuthTextLinkRow';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text as ThemedText } from '@/components/Themed';
import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';
import { signInWithEmail } from '@/lib/auth';

const iconMuted = '#8e8e71';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setError(null);

    if (!email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <View style={tw.style('flex-grow justify-between pb-6 pt-12')}>
        <View style={tw.style('items-center px-2')}>
          <Text style={titleLine}>Log in or sign up</Text>
          <Text style={[titleLine, tw.style('mt-0')]}>to continue</Text>
        </View>

        <View style={tw.style('w-full gap-16 pb-8')}>
          <View style={tw.style('w-full gap-[15px]')}>
            <Input
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              leftIcon={<User size={24} color={iconMuted} strokeWidth={2} />}
            />
            <Input
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Key size={24} color={iconMuted} strokeWidth={2} />}
            />
          </View>

          <View style={tw.style('w-full items-stretch gap-4')}>
            {error ? (
              <ThemedText style={tw.style('text-center text-[14px] text-[#dc2626]')}>
                {error}
              </ThemedText>
            ) : null}
            <Button
              text={loading ? 'Logging in...' : 'Log in'}
              onPress={() => void onLogin()}
              disabled={loading}
              className="self-stretch w-full"
            />
            <AuthTextLinkRow
              lead="Don’t have an account?"
              linkLabel="Register"
              href="/(auth)/signup"
            />
          </View>
        </View>
      </View>
    </AuthScreenShell>
  );
}

const titleLine = {
  fontFamily: fontLexendRegular,
  fontSize: 32,
  lineHeight: 40,
  color: '#343a2c',
  textAlign: 'center' as const,
};
