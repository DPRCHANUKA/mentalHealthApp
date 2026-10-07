import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabId = 'home' | 'check-in' | 'help' | 'appointments' | 'profile';
const TABS = [
  { id: 'home', label: 'Home', route: '/student/student-home', icon: 'home-outline', iconActive: 'home' },
  { id: 'check-in', label: 'Check-in', route: '/student/check-in', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' },
  { id: 'help', label: 'Help', route: '/student/support-resources', icon: 'help-circle-outline', iconActive: 'help-circle' },
  { id: 'profile', label: 'Profile', route: '/student/profile', icon: 'person-outline', iconActive: 'person' },
] as const;

export default function StudentBottomNav({ active, activeTab }: { active?: TabId; activeTab?: TabId }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const currentTab: TabId | undefined =
    ['/student/check-in', '/student/mood-result', '/student/mood-history'].includes(pathname) ? 'check-in' :
    ['/student/help', '/student/support-resources', '/student/emergency-support', '/student/emergency', '/student/self-help', '/student/article', '/student/breathing', '/student/counselling', '/student/counselor-page', '/student/add-counselor'].includes(pathname) ? 'help' :
    pathname === '/student/profile' ? 'profile' :
    pathname === '/student/student-home' ? 'home' : active ?? activeTab;
  return <LinearGradient colors={['#2E4259', Colors.light.primary]} style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
    {TABS.map(tab => {
      const selected = tab.id === currentTab;
      return <TouchableOpacity key={tab.id} style={styles.tab} accessibilityRole="tab" accessibilityLabel={tab.label}
        accessibilityState={{ selected }} aria-selected={selected}
        onPress={() => { if (pathname !== tab.route) router.replace(tab.route as Href); }}>
        <Ionicons name={selected ? tab.iconActive : tab.icon} size={26} color={selected ? '#FFFFFF' : '#B8C3CF'} />
        <Text style={[styles.label, selected && styles.selected]}>{tab.label}</Text>
      </TouchableOpacity>;
    })}
  </LinearGradient>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', paddingTop: 14, paddingHorizontal: 8, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 5 },
  label: { fontSize: 12, fontWeight: '500', color: '#B8C3CF' },
  selected: { color: '#FFFFFF', fontWeight: '700' },
});
