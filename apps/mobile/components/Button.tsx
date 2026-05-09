import { Pressable, Text } from 'react-native';

import tw from '@/lib/tailwind';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: React.ReactNode;
  className?: string;
};

export function Button({ text, onPress, disabled, variant = 'primary', icon }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={tw.style(
        'flex-row items-center justify-center gap-2 rounded-lg px-4 py-3',
        variant === 'primary' && 'bg-blue-600',
        variant === 'secondary' && 'bg-gray-200',
        variant === 'tertiary' && 'bg-transparent',
        disabled && 'opacity-50',
      )}
    >
      {icon ?? null}
      <Text
        style={tw.style(
          'text-base font-semibold',
          variant === 'primary' && 'text-white',
          variant === 'secondary' && 'text-gray-900',
          variant === 'tertiary' && 'text-blue-600',
        )}
      >
        {text}
      </Text>
    </Pressable>
  );
}
