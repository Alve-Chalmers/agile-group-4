import { useState } from 'react';
import { Platform, TextInput, type TextInputProps, View } from 'react-native';

import { Text } from '@/components/Themed';
import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';

export type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
  /** Leading slot (16px gap — Figma “Input”). */
  leftIcon?: React.ReactNode;
};

const placeholderDefaultHex = '#8e8e71';
const disabledMutedHex = '#d2d2c6';

export function Input({
  label,
  helperText,
  errorText,
  containerClassName,
  style,
  onFocus,
  onBlur,
  editable = true,
  leftIcon,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);
  const disabled = !editable;

  const wrapperStyle = tw.style(
    'flex-row items-center rounded-lg border bg-field-bg px-4 py-[14px]',
    { 'gap-4': Boolean(leftIcon) },
    {
      'border-error': hasError,
      'border-field-disabled-border': !hasError && disabled,
      'border-field-focus': !hasError && !disabled && focused,
      'border-field-border': !hasError && !disabled && !focused,
    },
  );

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const androidSelection =
    Platform.OS === 'android' && !disabled ? ({ selectionColor: '#84bf54' } as const) : {};

  const inputTypography = tw.style(
    'min-h-[22px] flex-1 rounded-none border-0 bg-transparent p-0 text-[16px] font-normal leading-normal',
    { 'text-field-disabled-muted': disabled, 'text-text-100': !disabled },
  );
  const inputFont = { fontFamily: fontLexendRegular };
  const placeholderColor = disabled ? disabledMutedHex : placeholderDefaultHex;

  return (
    <View style={tw.style('gap-1.5', containerClassName)}>
      {label ? (
        <Text style={[inputFont, tw.style('text-[14px] font-normal leading-normal text-text-200')]}>
          {label}
        </Text>
      ) : null}
      <View style={wrapperStyle}>
        {leftIcon ? (
          <View style={tw.style('size-6 items-center justify-center')}>{leftIcon}</View>
        ) : null}
        <TextInput
          editable={editable}
          underlineColorAndroid="transparent"
          placeholderTextColor={placeholderColor}
          style={[inputFont, inputTypography, style]}
          {...androidSelection}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </View>
      {errorText || helperText ? (
        <Text
          style={tw.style('text-[13px]', {
            'text-error': !!errorText,
            'text-text-600': !errorText,
          })}
        >
          {errorText || helperText}
        </Text>
      ) : null}
    </View>
  );
}
