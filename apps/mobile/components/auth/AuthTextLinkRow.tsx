import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { fontLexendRegular } from '@/constants/typography';

type AuthTextLinkRowProps = {
  /** e.g. “Don’t have an account?” */
  lead: string;
  /** e.g. “Register” (underlined) */
  linkLabel: string;
  href: Href;
};

/**
 * Figma login footer: muted lead + underlined action (text/100 border).
 */
export function AuthTextLinkRow({ lead, linkLabel, href }: AuthTextLinkRowProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
      <Text style={{ fontFamily: fontLexendRegular, fontSize: 16, color: '#4f5742', lineHeight: 22 }}>
        {lead}
      </Text>
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={linkLabel}
          style={{
            borderBottomWidth: 2,
            borderBottomColor: '#1a1d16',
            paddingBottom: 0,
          }}
        >
          <Text style={{ fontFamily: fontLexendRegular, fontSize: 16, color: '#1a1d16', lineHeight: 22 }}>
            {linkLabel}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
