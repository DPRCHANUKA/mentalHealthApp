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
            paddingBottom: insets.bottom + 32,
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
              <View style={styles.checkRing}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              </View>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.replace('/student/student-home')}
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
    fontSize: 32,
    color: Colors.light.textSecondary,
    marginRight: 16,
  },

  // Only the title uses IrishGrover
  title: {
    fontSize: 32,
    fontFamily: 'IrishGrover',
    color: Colors.light.primary,
  },

  subtitle: {
    marginTop: 36,
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },

  points: {
    marginTop: 36,
  },

  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 4,
    borderBottomColor: Colors.light.textSecondary + '66',
  },

  checkRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.success + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },

  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  pointText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
    color: Colors.light.primary,
  },

  button: {
    marginTop: 'auto',
    width: '100%',
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});