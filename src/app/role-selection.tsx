import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoleSelectionScreen() {
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
          <Text style={styles.title}>Choose Your Role</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Student Card */}
          <TouchableOpacity style={styles.roleCard} activeOpacity={0.8}>
            <Text style={styles.icon}>🎓</Text>

            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Student</Text>

              <Text style={styles.roleDescription}>
                Access mental health support, self-help resources and
                counselling
              </Text>
            </View>
          </TouchableOpacity>

          {/* Mentor Card */}
          <TouchableOpacity style={styles.roleCard} activeOpacity={0.8}>
            <Text style={styles.icon}>👤</Text>

            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Mentor</Text>

              <Text style={styles.roleDescription}>
                Support students for counselling and make a difference
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        {/* Privacy Link (pinned to bottom) */}
        <TouchableOpacity style={styles.privacyLink}>
          <Text style={styles.privacyLinkText}>
            Learn more about our privacy
          </Text>

          <Text style={styles.arrow}>→</Text>
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
    marginBottom: 56,
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

  cards: {
    gap: 24,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 130,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
  },

  icon: {
    fontSize: 40,
    marginRight: 20,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  roleDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },

  nextButton: {
    width: '100%',
    height: 56,
    marginTop: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.surface,
  },

  privacyLink: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  privacyLinkText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  arrow: {
    marginLeft: 6,
    fontSize: 16,
    color: Colors.light.accent,
  },
});