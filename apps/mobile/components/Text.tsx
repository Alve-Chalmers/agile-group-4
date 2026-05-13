import { fontLexendRegular } from '@/constants/typography';
import tw from '@/lib/tailwind';
import { Text as DefaultText, TextProps } from 'react-native';

export function Text(
  props: TextProps & {
    className?: string;
  },
) {
  return (
    <DefaultText
      style={tw.style('text-inherit', { fontFamily: fontLexendRegular }, props.className)}
      {...props}
    />
  );
}
