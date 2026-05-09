import { Pressable, Text } from 'react-native';

import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';

export type ChipProps = {
  label: string;
  onPress: () => void;
  /** Figma `Property 1=Active`; off = `Default`. */
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

/** `Design system` → Chip (`42:98` Active / `42:100` Default), upgraded layout. */
export function Chip({
  label,
  onPress,
  selected = false,
  disabled = false,
  accessibilityLabel,
  className,
}: ChipProps) {
  const labelFace = tw.style('text-[14px] font-normal leading-normal text-black');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) =>
        tw.style(
          'min-h-[30px] shrink items-center justify-center self-start overflow-hidden rounded-full px-6 py-[6px]',
          selected && 'bg-button-primary',
          selected && pressed && !disabled && 'bg-button-primary-pressed',
          !selected && 'bg-background-800',
          !selected && pressed && !disabled && 'bg-button-secondary-pressed',
          disabled && 'opacity-45',
          className,
        )
      }
    >
      <Text style={[labelFace, { fontFamily: fontLexendRegular }]}>{label}</Text>
    </Pressable>
  );
}
