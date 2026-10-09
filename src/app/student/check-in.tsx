import { MOODS, type Mood, type MoodId } from '@/constants/moods';
import { Colors } from '@/constants/theme';
import { saveCheckIn } from '@/lib/mood-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// How each emoji moves while idle (y/x in px, rot in degrees, d = ms per half-cycle)
const IDLE_MOTION: Record<MoodId, { y: number; x: number; rot: number; d: number }> = {
  great: { y: -6, x: 0, rot: 0, d: 650 },
  good: { y: -3, x: 0, rot: 8, d: 1300 },
  okay: { y: 0, x: 4, rot: 0, d: 1500 },
  low: { y: 3, x: 0, rot: -6, d: 1800 },
  'very-low': { y: 2, x: 2, rot: 0, d: 260 },
};

type MoodItemProps = {
  mood: Mood;
  index: number;
  isSelected: boolean;
  onPress: () => void;
};

function MoodItem({ mood, index, isSelected, onPress }: MoodItemProps) {
  const idle = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  // Idle loop: each emoji keeps moving, slightly staggered
  useEffect(() => {
    const cfg = IDLE_MOTION[mood.id];
    const loop = Animated.sequence([
      Animated.delay(index * 150),
      Animated.loop(
        Animated.sequence([
          Animated.timing(idle, {
            toValue: 1,
            duration: cfg.d,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(idle, {
            toValue: 0,
            duration: cfg.d,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]);
    loop.start();
    return () => loop.stop();
  }, [idle, index, mood.id]);

  // Pop + wiggle when selected, settle back when not
  useEffect(() => {
    if (isSelected) {
      Animated.parallel([
        Animated.spring(pop, {
          toValue: 1.2,
          friction: 4,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(wiggle, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: 120, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected, pop, wiggle]);

  const cfg = IDLE_MOTION[mood.id];

  const idleStyle = {
    transform: [
      { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, cfg.y] }) },
      { translateX: idle.interpolate({ inputRange: [0, 1], outputRange: [0, cfg.x] }) },
      { rotate: idle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${cfg.rot}deg`] }) },
    ],
  };

  const circleStyle = {
    transform: [
      { scale: pop },
      { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] }) },
    ],
  };

  return (
    <TouchableOpacity style={styles.moodItem} activeOpacity={0.8} onPress={onPress}>
      <Animated.View
        style={[styles.moodCircle, isSelected && styles.moodCircleSelected, circleStyle]}
      >
        <Animated.Text style={[styles.moodEmoji, idleStyle]}>{mood.emoji}</Animated.Text>
      </Animated.View>
      <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
        {mood.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CheckInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const noteRef = useRef<TextInput>(null);

  const [selected, setSelected] = useState<MoodId | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || saving) return;

    Keyboard.dismiss();
    setSaving(true);

    try {
      await saveCheckIn(selected, note);
    } catch {
      // If saving fails, still let the student continue
    }

    setSaving(false);
    router.replace({
      pathname: '/student/mood-result',
      params: { mood: selected },
    } as unknown as Href);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/student/student-home')}
            hitSlop={12}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Daily Check-in</Text>
        </View>

        {/* Privacy banner */}
        <View style={styles.privacyBanner}>
          <Ionicons name="lock-closed" size={22} color={Colors.light.secondary} />
          <Text style={styles.privacyText}>
            Your check-in is private and anonymous.
          </Text>
        </View>

        {/* Mood picker */}
        <Text style={styles.question}>How are you feeling today?</Text>

        <View style={styles.moodRow}>
          {MOODS.map((mood, index) => (
            <MoodItem
              key={mood.id}
              mood={mood}
              index={index}
              isSelected={selected === mood.id}
              onPress={() => setSelected(mood.id)}
            />
          ))}
        </View>

        {/* Optional note */}
        <View style={styles.noteHeader}>
          <Text style={styles.noteLabel}>
            Add a note <Text style={styles.noteOptional}>(optional)</Text>
          </Text>

          <TouchableOpacity
            style={styles.plusButton}
            hitSlop={10}
            onPress={() => noteRef.current?.focus()}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TextInput
          ref={noteRef}
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Type here....."
          placeholderTextColor={Colors.light.textSecondary}
          multiline
          maxLength={300}
          textAlignVertical="top"
        />

        <View style={styles.spacer} />

        {/* Continue */}
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={!selected || saving}
          onPress={handleContinue}
          style={[styles.raised, (!selected || saving) && styles.disabled]}
        >
          <LinearGradient colors={['#6CC3BB', '#4FA7A0']} style={styles.buttonFace}>
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    flexGrow: 1,
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

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.primary,
  },

  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  privacyText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.primary,
  },

  question: {
    marginTop: 36,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  moodItem: {
    alignItems: 'center',
    width: 62,
  },

  moodCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },

  // CHANGED: removed the static scale, the animation handles it now
  moodCircleSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent + '26',
  },

  moodEmoji: {
    fontSize: 30,
  },

  moodLabel: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },

  moodLabelSelected: {
    fontWeight: '700',
    color: Colors.light.primary,
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 36,
    marginBottom: 12,
  },

  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  noteOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textSecondary,
  },

  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noteInput: {
    minHeight: 130,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: Colors.light.primary,
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  spacer: {
    flex: 1,
    minHeight: 24,
  },

  raised: {
    borderRadius: 16,
    paddingBottom: 4,
    backgroundColor: '#3A8A84',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6,
  },

  disabled: {
    opacity: 0.4,
  },

  buttonFace: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});