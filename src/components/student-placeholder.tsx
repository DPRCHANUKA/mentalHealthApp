import StudentBottomNav, { type TabId } from '@/components/student-bottom-nav';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  showBack?: boolean; // true for feature pages, false for tab pages
  activeTab?: TabId;  // highlights a tab in the bottom bar
};

export default function StudentPlaceholder({ title, showBack = false, activeTab }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.header}>
          {showBack && (
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.soon}>🚧 Coming soon</Text>
        </View>
      </View>

      <StudentBottomNav active={activeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center' },
  backArrow: { fontSize: 32, color: Colors.light.textSecondary, marginRight: 16 },
  title: { fontSize: 28, fontFamily: 'IrishGrover', color: Colors.light.primary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  soon: { fontSize: 18, color: Colors.light.textSecondary },
});