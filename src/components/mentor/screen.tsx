import { router, usePathname, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ComponentProps } from 'react';
import { Screen, palette } from '@/components/wellbeing/screen';

const tabs = [
  { label: 'Home', route: '/mentor/mentor-home', icon: 'home' },
  { label: 'Directory', route: '/mentor/directory', icon: 'people' },
  { label: 'Referrals', route: '/mentor/referrals', icon: 'paper-plane' },
  { label: 'Profile', route: '/mentor/profile', icon: 'person' },
] as const;
export function MentorScreen({ navigation = true, ...props }: ComponentProps<typeof Screen> & { navigation?: boolean }) {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  return <View style={{ flex: 1, backgroundColor: palette.background }}>
    <Screen {...props} footer={false} />
    {navigation && <View style={{ flexDirection: 'row', backgroundColor: palette.ink, paddingTop: 14, paddingBottom: insets.bottom + 12 }}>
      {tabs.map(tab => {
        const selected = path === tab.route || (tab.label === 'Referrals' && ['/mentor/referral', '/mentor/referral-sent'].includes(path));
        return <Pressable key={tab.label} accessibilityRole="tab" accessibilityLabel={tab.label} aria-selected={selected}
          onPress={() => { if (path !== tab.route) router.replace(tab.route as Href); }}
          style={{ flex: 1, minHeight: 56, alignItems: 'center', gap: 7 }}>
          <Ionicons name={tab.icon} size={30} color={selected ? '#8ED7D0' : '#FFF'} />
          <Text style={{ fontFamily: 'IrishGrover', fontSize: 12, color: '#FFF' }}>{tab.label}</Text>
        </Pressable>;
      })}
    </View>}
  </View>;
}

