import { MOODS, type MoodId } from '@/constants/moods';
import { Colors } from '@/constants/theme';
import { saveCheckIn } from '@/lib/mood-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import {
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
          {MOODS.map((mood) => {
            const isSelected = selected === mood.id;

            return (
              <TouchableOpacity
                key={mood.id}
                style={styles.moodItem}
                activeOpacity={0.8}
                onPress={() => setSelected(mood.id)}
              >
                <View
                  style={[styles.moodCircle, isSelected && styles.moodCircleSelected]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </View>
                <Text
                  style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    fontFamily: 'IrishGrover',
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

  moodCircleSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent + '26',
    transform: [{ scale: 1.1 }],
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