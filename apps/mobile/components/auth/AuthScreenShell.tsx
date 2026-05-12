import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import tw from '@/lib/tailwind';

type AuthScreenShellProps = {
  /** Title + main form block (use `justify-between` column inside scroll). */
  children: ReactNode;
};

/** Login / sign-up shell: Figma `Login` screen (#F4F4F1 bg, bottom bar #E8E8E3). */
export function AuthScreenShell({ children }: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={tw.style('flex-1 bg-auth-screen')}>
      <SafeAreaView style={tw.style('flex-1')} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw.style('flex-1')}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={tw.style('min-h-full flex-grow px-8')}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View
        style={[
          tw.style('min-h-[64px] border-t border-auth-footer-border bg-auth-footer'),
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      />
    </View>
  );
}
