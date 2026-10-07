import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabId = 'home' | 'check-in' | 'appointments' | 'profile';

type StudentBottomNavProps = {
  active?: TabId;
  activeTab?: TabId;
};

const TABS = [
  { id: 'home', label: 'Home', route: '/student/student-home', icon: 'home-outline', iconActive: 'home' },
  { id: 'check-in', label: 'Check-in', route: '/student/check-in', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
  { id: 'help', label: 'Help', route: '/student/support-resources', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { id: 'profile', label: 'Profile', route: '/student/profile', icon: 'person-outline', iconActive: 'person' },
] as const;

export default function StudentBottomNav({ active, activeTab }: StudentBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab: TabId | undefined =
    ['/student/check-in', '/student/mood-result', '/student/mood-history'].includes(pathname) ? 'check-in' :
    ['/student/help', '/student/support-resources', '/student/emergency-support', '/student/emergency', '/student/self-help', '/student/article', '/student/breathing', '/student/counselling'].includes(pathname) ? 'help' :
    pathname === '/student/profile' ? 'profile' :
    pathname === '/student/student-home' ? 'home' : active;

  return (
    <LinearGradient
      colors={['#2E4259', Colors.light.primary]}
      style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === currentTab;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            aria-selected={isActive}
            onPress={() => {
              if (pathname !== tab.route) router.replace(tab.route as Href);
            }}
          >
            <Ionicons
              name={isActive ? activeIcon : icon}
              size={22}
              color={isActive ? Colors.light.primary : '#7A8A9A'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(36,52,71,0.12)',
    backgroundColor: '#F5F7F7',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7A8A9A',
  },
  labelActive: {
    color: Colors.light.primary,
  },
  label: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.65)' },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
});

