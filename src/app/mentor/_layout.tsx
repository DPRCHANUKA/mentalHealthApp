import MentorBottomNav from '@/components/mentor/mentor-bottom-nav';
import { Colors } from '@/constants/theme';
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

// Screens where the bottom bar should NOT appear
// (the referral form used navigation={false})
const HIDE_NAV_ON = ['/mentor/referral', '/mentor/referral-sent'];

export default function MentorLayout() {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ON.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </View>
      {showNav && <MentorBottomNav />}
    </View>
  );
}