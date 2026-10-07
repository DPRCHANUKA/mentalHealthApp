import { useStudentProfile } from '@/state/student-profile';
import StudentBottomNav from '@/components/student-bottom-nav';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons'; // ← new
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router'; // ← new
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUICK_ACCESS = [
  { id: 'self-help', route: '/student/self-help', icon: '📖', label: 'Self-help', colors: ['#FCEEEE', '#F3D6D6'], edge: '#E2BCBC' },
  { id: 'breathing', route: '/student/breathing', icon: '🧘', label: 'Breathing', colors: ['#F0EDFA', '#DCD7F1'], edge: '#C3BDE2' },
  // Counselling now opens the counselor list page
  { id: 'counselling', route: '/student/counselor-page', icon: '🧑‍⚕️', label: 'Counselling', colors: ['#F0EDFA', '#DCD7F1'], edge: '#C3BDE2' },
  { id: 'mood-history', route: '/student/mood-history', icon: '🕒', label: 'Mood History', colors: ['#FCEEEE', '#F3D6D6'], edge: '#E2BCBC' },
] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentHomeScreen() {
  const router = useRouter(); // ← new
  const insets = useSafeAreaInsets();
  const { name: userName } = useStudentProfile();

  return (
    <View style={styles.container}>
      {/* Change role button (top left, floats above the greeting) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.roleButton, { top: insets.top + 6 }]} // ← new
        onPress={() => router.replace('/role-selection')}
      >
        <Ionicons name="swap-horizontal" size={16} color={Colors.light.primary} />
        <Text style={styles.roleButtonText}>Change role</Text>
      </TouchableOpacity>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Greeting + profile */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {getGreeting()}, {userName}
          </Text>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open student profile" onPress={() => router.push('/student/profile')} style={styles.avatarShadow}>
            <LinearGradient
              colors={['#8F88C9', '#4FA7A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <View style={styles.avatarGloss} />
              <Text style={styles.avatarIcon}>👤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          your wellbeing starts with one check-in
        </Text>

        {/* Check-in button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.raised, styles.checkInRaised]}
          onPress={() => router.push('/student/check-in')} // ← new
        >
          <LinearGradient colors={['#6CC3BB', '#4FA7A0']} style={styles.checkInFace}>
            <Text style={styles.checkInText}>Check in privately</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Access */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>

        <View style={styles.grid}>
          {QUICK_ACCESS.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={[styles.raised, styles.gridRaised, { backgroundColor: item.edge }]}
              onPress={() => router.push(item.route as Href)} // ← new
            >
              <LinearGradient colors={[...item.colors]} style={styles.gridFace}>
                <View style={styles.iconBubble}>
                  <Text style={styles.gridIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flexible space: pushes the cards below toward the nav bar */}
        <View style={styles.spacer} />

        {/* Next Appointment */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.raised, styles.appointmentRaised]}
          onPress={() => router.push('/student/appointments')} // ← new
        >
          <LinearGradient
            colors={['#F4F2FB', '#E1DDF3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appointmentFace}
          >
            <View style={styles.iconBubbleSmall}>
              <Text style={styles.smallIcon}>📅</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.appointmentTitle}>Next Appointment</Text>
              <Text style={styles.appointmentText}>No upcoming appointment</Text>
            </View>

            <View style={styles.arrowBubble}>
              <Text style={styles.appointmentArrow}>›</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Emergency */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.raised, styles.emergencyRaised]}
          onPress={() => router.push('/student/emergency')} // ← new
        >
          <LinearGradient colors={['#E4707A', '#C94B55']} style={styles.emergencyFace}>
            <Text style={styles.emergencyIcon}>⚠️</Text>
            <Text style={styles.emergencyText}>Emergency Support</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom navigation */}
      <StudentBottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  /* Change role pill (new) */
  roleButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },

  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  spacer: {
    flex: 1,
    minHeight: 12,
  },

  /* Shared raised look */
  raised: {
    borderRadius: 16,
    paddingBottom: 4,
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6,
  },

  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greeting: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  avatarShadow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 6,
  },

  avatar: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  avatarIcon: {
    fontSize: 20,
  },

  subtitle: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.light.textSecondary,
  },

  /* Check-in */
  checkInRaised: {
    marginTop: 30,
    backgroundColor: '#3A8A84',
  },

  checkInFace: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* Quick Access header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 58,
    marginBottom: 16,
  },

  sectionBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.light.accent,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'IrishGrover',
    color: Colors.light.primary,
    textShadowColor: 'rgba(79,167,160,0.35)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },

  gridRaised: {
    width: '47.5%',
  },

  gridFace: {
    height: 92,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },

  gridIcon: {
    fontSize: 22,
  },

  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  /* Appointment */
  appointmentRaised: {
    backgroundColor: '#C3BDE2',
  },

  appointmentFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  iconBubbleSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallIcon: {
    fontSize: 20,
  },

  appointmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  appointmentText: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  arrowBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  appointmentArrow: {
    fontSize: 20,
    lineHeight: 24,
    color: Colors.light.primary,
  },

  /* Emergency */
  emergencyRaised: {
    marginTop: 16,
    backgroundColor: '#A03842',
    shadowColor: '#C94B55',
    shadowOpacity: 0.4,
  },

  emergencyFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  emergencyIcon: {
    fontSize: 18,
  },

  emergencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
