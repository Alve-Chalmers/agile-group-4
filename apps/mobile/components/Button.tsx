import { Pressable, Text } from 'react-native';

import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  className?: string;
};

export function Button({
  text,
  onPress,
  disabled,
  variant = 'primary',
  icon,
  className,
}: ButtonProps) {
  const labelStyle = tw.style('text-[16px] font-normal leading-normal text-text-100');

  const labelFont = { fontFamily: fontLexendRegular };

  const sizeStyle = 'min-h-[52px] rounded-lg px-8 py-4';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) =>
        tw.style(
          'flex flex-row items-center justify-center gap-2',
          sizeStyle,
          variant === 'primary' && 'bg-button-primary',
          variant === 'primary' && pressed && !disabled && 'bg-button-primary-pressed',
          variant === 'secondary' && 'bg-button-secondary',
          variant === 'secondary' && pressed && !disabled && 'bg-button-secondary-pressed',
          variant === 'outline' && 'border border-field-focus bg-transparent',
          variant === 'outline' && pressed && !disabled && 'bg-field-bg',
          disabled && 'opacity-45',
          className,
        )
      }
    >
      {icon ?? null}
      <Text style={[labelFont, labelStyle]}>{text}</Text>
    </Pressable>
  );
}
