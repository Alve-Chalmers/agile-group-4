import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Key, Mail, User } from 'lucide-react-native';

import { AuthScreenShell } from '@/components/auth/AuthScreenShell';
import { AuthTextLinkRow } from '@/components/auth/AuthTextLinkRow';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text as ThemedText } from '@/components/Themed';
import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';
import { getSession, signInWithEmail, signUpWithEmail } from '@/lib/auth';

const iconMuted = '#8e8e71';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignup = async () => {
    setError(null);

    if (!email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const trimmedName = name.trim();

    try {
      setLoading(true);
      await signUpWithEmail({
        email: email.trim().toLowerCase(),
        password,
        name: trimmedName.length > 0 ? trimmedName : undefined,
      });

      const session = await getSession();
      if (!session?.session) {
        await signInWithEmail(email.trim().toLowerCase(), password);
      }

      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <View style={tw.style('flex-grow justify-between pb-6 pt-8')}>
        <View style={tw.style('items-center px-2')}>
          <Text style={titleLine}>Create your account</Text>
          <Text style={titleLine}>to continue</Text>
        </View>

        <View style={tw.style('w-full gap-16 pb-8')}>
          <View style={tw.style('w-full gap-[15px]')}>
            <Input
              placeholder="Name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={24} color={iconMuted} strokeWidth={2} />}
            />
            <Input
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={24} color={iconMuted} strokeWidth={2} />}
            />
            <Input
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Key size={24} color={iconMuted} strokeWidth={2} />}
            />
            <Input
              placeholder="Confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
              text={loading ? 'Creating account...' : 'Sign up'}
              onPress={() => void onSignup()}
              disabled={loading}
              className="self-stretch w-full"
            />
            <AuthTextLinkRow lead="Already have an account?" linkLabel="Log in" href="/login" />
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
