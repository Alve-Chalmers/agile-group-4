import { Pressable, Text } from 'react-native';

import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';

export type ButtonProps = {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) =>
        tw.style(
          'flex flex-row items-center justify-center gap-2',
          'min-h-[52px] rounded-lg px-8 py-4',
          {
            'bg-button-primary': variant === 'primary',
            'bg-button-primary-pressed': variant === 'primary' && pressed && !disabled,
            'bg-button-secondary': variant === 'secondary',
            'bg-button-secondary-pressed': variant === 'secondary' && pressed && !disabled,
            'border border-field-focus bg-transparent': variant === 'outline',
            'bg-field-bg': variant === 'outline' && pressed && !disabled,
            'opacity-45': !!disabled,
            'bg-inherit text-text-200': variant === 'ghost'
          },
          className,
        )
      }
    >
      {icon ?? null}
      <Text style={[labelFont, labelStyle]}>{text}</Text>
    </Pressable>
  );
}
