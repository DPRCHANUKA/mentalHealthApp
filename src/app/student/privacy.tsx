import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIVACY_POINTS = [
  'Your check-ins are private and anonymous.',
  'Your information is protected and secure.',
  'Only the appropriate counselor can access relevant information.',
];

// Timing (milliseconds): change these to make it faster or slower
const FIRST_ROW_DELAY = 500; // wait before the first point
const ROW_GAP = 650; // time between points
const BUTTON_DELAY = FIRST_ROW_DELAY + ROW_GAP * PRIVACY_POINTS.length;

function PrivacyPoint({ text, delay }: { text: string; delay: number }) {
  const row = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Row slides up and fades in
        Animated.timing(row, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Tick pops in shortly after the row starts
        Animated.sequence([
          Animated.delay(250),
          Animated.parallel([
            Animated.spring(tick, {
              toValue: 1,
              friction: 4,
              tension: 120,
              useNativeDriver: true,
            }),
            Animated.timing(ripple, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]).start();
  }, [delay, row, tick, ripple]);

  return (
    <Animated.View
      style={[
        styles.pointRow,
        {
          opacity: row,
          transform: [
            { translateY: row.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.checkRing}>
        {/* Ripple */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              opacity: ripple.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] }),
              transform: [
                { scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) },
              ],
            },
          ]}
        />
        {/* Tick */}
        <Animated.View
          style={[
            styles.checkCircle,
            {
              transform: [
                { scale: tick },
                { rotate: tick.interpolate({ inputRange: [0, 1], outputRange: ['-35deg', '0deg'] }) },
              ],
            },
          ]}
        >
          <Text style={styles.checkMark}>✓</Text>
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.pointText,
          {
            opacity: row,
            transform: [
              { translateX: row.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
            ],
          },
        ]}
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const headerFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title and subtitle
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Button appears after the last point
    Animated.sequence([
      Animated.delay(BUTTON_DELAY),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, buttonFade]);

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
        <Animated.View style={{ opacity: headerFade }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Your Privacy</Text>
          </View>

          <Text style={styles.subtitle}>Before you begin.....</Text>
        </Animated.View>

        {/* Privacy points */}
        <View style={styles.points}>
          {PRIVACY_POINTS.map((point, index) => (
            <PrivacyPoint
              key={point}
              text={point}
              delay={FIRST_ROW_DELAY + index * ROW_GAP}
            />
          ))}
        </View>

        {/* Continue */}
        <Animated.View style={[styles.buttonWrap, { opacity: buttonFade }]}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.replace('/student/student-home')}
          >
            <Text style={styles.buttonText}>Continue Privately</Text>
          </TouchableOpacity>
        </Animated.View>
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

  // Only the title 
  title: {
    fontSize: 32,
    fontWeight: '800',
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

  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.success,
  },

  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
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

  buttonWrap: {
    marginTop: 'auto',
    width: '100%',
  },

  button: {
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