import { Pressable, Text } from 'react-native';

import tw from '@/lib/tailwind';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
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
        variant === 'primary' && 'bg-primary-500',
        variant === 'secondary' && 'bg-secondary-500',
        disabled && 'opacity-50',
      )}
    >
      {icon ?? null}
      <Text style={tw.style('text-base font-semibold text-text-100')}>{text}</Text>
    </Pressable>
  );
}
