import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

export type TabId = 'home' | 'check-in' | 'appointments' | 'profile';

type StudentBottomNavProps = {
  active?: TabId;
  activeTab?: TabId;
};

const TABS = [
  { id: 'home', label: 'Home', route: '/student/student-home', icon: 'home-outline', activeIcon: 'home' },
  {
    id: 'check-in',
    label: 'Check-in',
    route: '/student/check-in',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    route: '/student/appointments',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  {
    id: 'profile',
    label: 'Profile',
    route: '/student/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
] as const;

export default function StudentBottomNav({ active, activeTab }: StudentBottomNavProps) {
  const router = useRouter();
  const currentTab = active ?? activeTab ?? 'home';

  return (
    <View style={styles.container}>
      {TABS.map(({ id, label, route, icon, activeIcon }) => {
        const isActive = currentTab === id;

        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => router.push(route)}
            style={styles.tabButton}
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
});