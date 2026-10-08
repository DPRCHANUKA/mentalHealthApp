import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/mental-health-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Luma</Text>

        <Text style={styles.description}>
          your space to check in and get support
        </Text>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>
              Private & Confidential
            </Text>

            <Text style={styles.privacyText}>
              Your information is handled with care.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/role-selection')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },

  title: {
    fontSize: 36,
    fontFamily:'IrishGrover',
    color: Colors.light.primary,
    textAlign: 'center',
  },

  description: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 330,
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
  },

  privacyIcon: {
    fontSize: 22,
    marginRight: 12,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  privacyText: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  button: {
    marginTop: 20,
    width: '100%',
    maxWidth: 330,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.surface,
  },

  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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