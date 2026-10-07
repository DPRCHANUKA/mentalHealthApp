import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button, Screen, palette, ui } from '@/components/wellbeing/screen';

const moods = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'okay', label: 'Okay', emoji: '🙂' },
  { value: 'sad', label: 'Sad', emoji: '😔' },
  { value: 'anxious', label: 'Anxious', emoji: '😟' },
  { value: 'stressed', label: 'Stressed', emoji: '😣' },
] as const;
type Mood = typeof moods[number]['value'];

export default function CheckInScreen() {
  const [mood, setMood] = useState<Mood | null>(null);

  return (
    <Screen title="Daily Check-in" subtitle="Take a moment for yourself.">
      <Text accessibilityRole="header" style={[ui.heading, { textAlign: 'center', marginVertical: 16 }]}>
        How are you feeling today?
      </Text>
      <Text style={[ui.body, { textAlign: 'center' }]}>Choose the mood that feels closest to you.</Text>
      <View style={{ gap: 12, marginVertical: 12 }}>
        {moods.map((item) => (
          <Pressable
            key={item.value}
            accessibilityRole="radio"
            accessibilityLabel={item.label}
            accessibilityState={{ checked: mood === item.value }}
            aria-checked={mood === item.value}
            onPress={() => setMood(item.value)}
            style={({ pressed }) => [
              ui.card, ui.row,
              { minHeight: 64, borderWidth: 2, borderColor: mood === item.value ? palette.teal : palette.border,
                backgroundColor: mood === item.value ? '#DDEEEB' : '#FFF', opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={{ fontSize: 28 }} accessible={false}>{item.emoji}</Text>
            <Text style={[ui.title, { flex: 1 }]}>{item.label}</Text>
            {mood === item.value && <Text style={{ color: palette.teal, fontSize: 22 }}>✓</Text>}
          </Pressable>
        ))}
      </View>
      <Button label="Continue" disabled={!mood} onPress={() => {
        if (mood) router.push({ pathname: '/student/mood-result', params: { mood } });
      }} />
      <Text style={[ui.small, { textAlign: 'center' }]}>Your selection opens a mood preview. Check-ins are not saved yet.</Text>
    </Screen>
  );
}

