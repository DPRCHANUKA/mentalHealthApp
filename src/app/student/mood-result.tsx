
import { getMood } from '@/constants/moods';
import { Colors } from '@/constants/theme';
import { getLatestCheckIn } from '@/lib/mood-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type McIconName = keyof typeof MaterialCommunityIcons.glyphMap;

const OPTIONS: {
  id: string;
  label: string;
  icon: McIconName;
  iconColor: string;
  // Optional: your own PNG. If set, it is shown instead of the icon.
  image?: ImageSourcePropType;
  route: string;
  colors: [string, string];
  edge: string;
}[] = [
  {
    id: 'self-help',
    label: 'Self-help Tips',
    icon: 'book-open-page-variant',
    iconColor: '#E0707A',
    // image: require('../../../assets/images/self-help.png'),
    route: '/student/self-help',
    colors: ['#FCEEEE', '#F3D6D6'],
    edge: '#E2BCBC',
  },
  {
    id: 'breathing',
    label: 'Breathing Exercise',
    icon: 'meditation',
    iconColor: '#7C6BC4',
    // image: require('../../../assets/images/breathing.png'),
    route: '/student/breathing',
    colors: ['#F0EDFA', '#DCD7F1'],
    edge: '#C3BDE2',
  },
  {
    id: 'counselling',
    label: 'Book a Counselor',
    icon: 'calendar-heart',
    iconColor: '#7C6BC4',
    // image: require('../../../assets/images/counselor.png'),
    route: '/student/counselling',
    colors: ['#F0EDFA', '#DCD7F1'],
    edge: '#C3BDE2',
  },
  {
    id: 'mood-history',
    label: 'View Mood History',
    icon: 'chart-timeline-variant',
    iconColor: '#E0707A',
    // image: require('../../../assets/images/mood-history.png'),
    route: '/student/mood-history',
    colors: ['#FCEEEE', '#F3D6D6'],
    edge: '#E2BCBC',
  },
];

export default function MoodResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mood } = useLocalSearchParams<{ mood?: string }>();

  // If opened without a mood (e.g. from the nav), fall back to the latest saved one
  const [latestId, setLatestId] = useState<string | undefined>();

  // ---- Success sound ----
  // src/app/student/mood-result.tsx -> three levels up to the project root
  const successPlayer = useAudioPlayer(
    require('../../../assets/sounds/success.mp3')
  );

  // ---- Tick animation values ----
  const circleScale = useRef(new Animated.Value(0)).current;
  const tickScale = useRef(new Animated.Value(0)).current;
  const tickRotate = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  // ---- Option card entrance animation values (one per card) ----
  const cardAnims = useRef(
    OPTIONS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // 1. Circle springs in
    const circleAnim = Animated.spring(circleScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    });

    // 2. Tick pops in + ripple ring expands and fades
    const tickAnim = Animated.parallel([
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(tickRotate, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 2.2,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    // 3. Support cards appear one after another (staggered)
    const cardsAnim = Animated.sequence([
      Animated.delay(250),
      Animated.stagger(
        140,
        cardAnims.map((value) =>
          Animated.spring(value, {
            toValue: 1,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          })
        )
      ),
    ]);

    circleAnim.start(({ finished }) => {
      // Skip everything if the screen was left before the circle finished
      if (!finished) return;

      // Play the sound exactly when the tick pops in
      try {
        successPlayer.seekTo(0);
        successPlayer.play();
      } catch (e) {
        // Sound is a nice-to-have, never crash the screen over it
      }

      tickAnim.start();
      cardsAnim.start();
    });

    // Stop animations if the user leaves the screen early
    return () => {
      circleAnim.stop();
      tickAnim.stop();
      cardsAnim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tickRotation = tickRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-35deg', '0deg'],
  });

  useEffect(() => {
    if (!mood) {
      getLatestCheckIn().then((entry) => setLatestId(entry?.mood));
    }
  }, [mood]);

  const current = getMood(mood ?? latestId);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        {/* Checked in */}
        <View style={styles.top}>
          <View style={styles.checkWrapper}>
            {/* Ripple ring */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                },
              ]}
            />

            {/* Animated circle */}
            <Animated.View style={{ transform: [{ scale: circleScale }] }}>
              <LinearGradient
                colors={['#6BC79A', Colors.light.success]}
                style={styles.checkCircle}
              >
                {/* Animated tick */}
                <Animated.View
                  style={{
                    transform: [
                      { scale: tickScale },
                      { rotate: tickRotation },
                    ],
                  }}
                >
                  <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.title}>You're checked in!</Text>

          <Text style={styles.moodLabel}>Today's mood</Text>

          <View style={styles.emojiBubble}>
            <Text style={styles.emoji}>{current?.emoji ?? '🙂'}</Text>
          </View>

          {current && <Text style={styles.moodName}>{current.label}</Text>}

          <Text style={styles.subtitle}>You can explore some support options.</Text>
        </View>

        {/* Support options */}
        <View style={styles.options}>
          {OPTIONS.map((item, index) => {
            const anim = cardAnims[index];

            return (
              <Animated.View
                key={item.id}
                style={{
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.92, 1],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.raised, { backgroundColor: item.edge }]}
                  onPress={() => router.push(item.route as Href)}
                >
                  <LinearGradient colors={item.colors} style={styles.optionFace}>
                    <View style={styles.iconBubble}>
                      {item.image ? (
                        <Image
                          source={item.image}
                          style={styles.iconImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={32}
                          color={item.iconColor}
                        />
                      )}
                    </View>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={Colors.light.textSecondary}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
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
    paddingBottom: 20,
  },

  top: {
    alignItems: 'center',
  },

  // Wrapper so the ripple ring can sit behind the circle
  checkWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.light.success,
  },

  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.success,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  title: {
    marginTop: 14,
    fontSize: 26,
   fontWeight: '800',
    color: Colors.light.success,
  },

  moodLabel: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.light.textSecondary,
  },

  emojiBubble: {
    marginTop: 10,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  emoji: {
    fontSize: 50,
  },

  moodName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  subtitle: {
    marginTop: 14,
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // marginTop controls the gap under the subtitle
  options: {
    gap: 14,
    marginTop: 20,
  },

  raised: {
    borderRadius: 18,
    paddingBottom: 4,
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6,
  },

  optionFace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 76,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconImage: {
    width: 36,
    height: 36,
  },

  optionLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});