import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIVACY_POINTS = [
  'Your check-ins are private and anonymous.',
  'Your information is protected and secure.',
  'Only the appropriate counselor can access relevant information.',
];

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Privacy</Text>
        </View>

        <Text style={styles.subtitle}>Before you begin.....</Text>

        {/* Privacy points */}
        <View style={styles.points}>
          {PRIVACY_POINTS.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.replace('/mentor/mentor-home')}
        >
          <Text style={styles.buttonText}>Continue Privately</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backArrow: {
    fontSize: 28,
    color: Colors.light.textSecondary,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontFamily: 'IrishGrover',
    color: Colors.light.primary,
  },

  subtitle: {
    marginTop: 32,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },

  points: {
    marginTop: 32,
  },

  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.textSecondary + '55',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  checkMark: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.surface,
  },

  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.primary,
  },

  button: {
    marginTop: 'auto',
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.surface,
  },
});