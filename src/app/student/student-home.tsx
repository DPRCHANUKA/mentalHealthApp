import { Colors } from '@/constants/theme';
import { useStudentProfile } from '@/state/student-profile';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const QUICK_ACCESS: readonly {
  id: string;
  route: string;
  icon: IconName;
  iconColor: string;
  label: string;
  colors: readonly [string, string];
  edge: string;
}[] = [
  { id: 'self-help', route: '/student/self-help', icon: 'book-open-page-variant', iconColor: '#C25B6B', label: 'Self-help', colors: ['#FCEEEE', '#F3D6D6'], edge: '#E2BCBC' },
  { id: 'breathing', route: '/student/breathing', icon: 'meditation', iconColor: '#6E63B5', label: 'Breathing', colors: ['#F0EDFA', '#DCD7F1'], edge: '#C3BDE2' },
  // Counselling now opens the counselor list page
  { id: 'counselling', route: '/student/counselor-page', icon: 'account-heart', iconColor: '#4FA7A0', label: 'Counselling', colors: ['#F0EDFA', '#DCD7F1'], edge: '#C3BDE2' },
  { id: 'mood-history', route: '/student/mood-history', icon: 'chart-line', iconColor: '#D9822B', label: 'Mood History', colors: ['#FCEEEE', '#F3D6D6'], edge: '#E2BCBC' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/* Fades + slides up on open. If onPress is given, it also shrinks a little when pressed. */
function Reveal({
  delay = 0,
  style,
  onPress,
  children,
}: {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children: ReactNode;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, delay]);

  const animStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      { scale: press },
    ],
  };

  const springTo = (value: number) =>
    Animated.spring(press, { toValue: value, speed: 30, bounciness: 6, useNativeDriver: true }).start();

  if (!onPress) {
    return <Animated.View style={[style, animStyle]}>{children}</Animated.View>;
  }

  return (
    <Animated.View style={[style, animStyle]}>
      <Pressable onPress={onPress} onPressIn={() => springTo(0.96)} onPressOut={() => springTo(1)}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function StudentHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name: userName } = useStudentProfile();

  const pulse = useRef(new Animated.Value(0)).current; // avatar
  const warn = useRef(new Animated.Value(0)).current; // emergency icon
  const shine = useRef(new Animated.Value(0)).current; // check-in light sweep

  useEffect(() => {
    const loopPulse = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );

    const a = loopPulse(pulse, 1800);
    const b = loopPulse(warn, 1000);
    const c = Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(shine, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ])
    );
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [pulse, warn, shine]);

  return (
    <View style={styles.container}>
      {/* Change role button (top left, floats above the greeting) */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.roleButton, { top: insets.top + 6 }]}
        onPress={() => router.replace('/role-selection')}
      >
        <Ionicons name="swap-horizontal" size={16} color={Colors.light.primary} />
        <Text style={styles.roleButtonText}>Change role</Text>
      </TouchableOpacity>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Greeting + profile */}
        <Reveal delay={0} style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </Text>

          <Animated.View
            style={{
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }],
            }}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open student profile"
              onPress={() => router.push('/student/profile')}
              style={styles.avatarShadow}
            >
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
          </Animated.View>
        </Reveal>

        <Reveal delay={100}>
          <Text style={styles.subtitle}>your wellbeing starts with one check-in</Text>
        </Reveal>

        {/* Check-in button */}
        <Reveal
          delay={200}
          style={[styles.raised, styles.checkInRaised]}
          onPress={() => router.push('/student/check-in')}
        >
          <LinearGradient colors={['#6CC3BB', '#4FA7A0']} style={styles.checkInFace}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shine,
                {
                  transform: [
                    { translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-120, 420] }) },
                    { rotate: '20deg' },
                  ],
                },
              ]}
            />
            <Text style={styles.checkInText}>Check in privately</Text>
          </LinearGradient>
        </Reveal>

        {/* Quick Access */}
        <Reveal delay={300} style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </Reveal>

        <View style={styles.grid}>
          {QUICK_ACCESS.map((item, index) => (
            <Reveal
              key={item.id}
              delay={380 + index * 90}
              style={[styles.raised, styles.gridRaised, { backgroundColor: item.edge }]}
              onPress={() => router.push(item.route as Href)}
            >
              <LinearGradient colors={[item.colors[0], item.colors[1]]} style={styles.gridFace}>
                <View style={[styles.iconBubble, { borderColor: item.iconColor + '33' }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </LinearGradient>
            </Reveal>
          ))}
        </View>

        {/* Flexible space: pushes the cards below toward the nav bar */}
        <View style={styles.spacer} />

        {/* Next Appointment */}
        <Reveal
          delay={750}
          style={[styles.raised, styles.appointmentRaised]}
          onPress={() => router.push('/student/appointments')}
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
        </Reveal>

        {/* Emergency */}
        <Reveal
          delay={850}
          style={[styles.raised, styles.emergencyRaised]}
          onPress={() => router.push('/student/emergency')}
        >
          <LinearGradient colors={['#E4707A', '#C94B55']} style={styles.emergencyFace}>
            <Animated.Text
              style={[
                styles.emergencyIcon,
                { transform: [{ scale: warn.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] },
              ]}
            >
              ⚠️
            </Animated.Text>
            <Text style={styles.emergencyText}>Emergency Support</Text>
          </LinearGradient>
        </Reveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  /* Change role pill */
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
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
    overflow: 'hidden', // keeps the light sweep inside the button
  },

  shine: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.28)',
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
    fontWeight: '800',
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },

  gridLabel: {
    fontSize: 13,
    fontWeight: '700',
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