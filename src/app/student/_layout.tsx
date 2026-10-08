import StudentBottomNav from '@/components/student-bottom-nav';
import { Colors } from '@/constants/theme';
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

// Screens where the bottom bar should NOT appear
const HIDE_NAV_ON = ['/student/privacy'];

export default function StudentLayout() {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ON.includes(pathname);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </View>
      {showNav && <StudentBottomNav />}
    </View>
  );
}