import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabId = 'home' | 'check-in' | 'help' | 'profile';

const TABS = [
  { id: 'home', label: 'Home', route: '/student/student-home', icon: 'home-outline', iconActive: 'home' },
  { id: 'check-in', label: 'Check-in', route: '/student/check-in', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
  { id: 'help', label: 'Help', route: '/student/help', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { id: 'profile', label: 'Profile', route: '/student/profile', icon: 'person-outline', iconActive: 'person' },
] as const;

export default function StudentBottomNav({ active }: { active?: TabId }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#2E4259', Colors.light.primary]}
      style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) router.replace(tab.route as Href);
            }}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={26}
                color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
              />
            </View>

            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 16,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconWrap: {
    width: 56,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.light.accent,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.65)' },
  labelActive: { color: '#FFFFFF', fontWeight: '700' },
});