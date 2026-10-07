import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Asset, Dialog, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';

const moods = { happy: 'Happy', okay: 'Okay', sad: 'Sad', anxious: 'Anxious', stressed: 'Stressed' } as const;
export default function MoodResultScreen() {
  const { mood } = useLocalSearchParams<{ mood?: string }>();
  const [history, setHistory] = useState(false);
  const validMood = typeof mood === 'string' && Object.prototype.hasOwnProperty.call(moods, mood) ? mood as keyof typeof moods : null;
  const actions = [
    { title: 'Self-help Tips', asset: assets.moodImage11, open: () => router.push('/student/self-help') },
    { title: 'Breathing Exercise', asset: assets.moodImage22, open: () => router.push('/student/breathing') },
    { title: 'Book a Counselor', asset: assets.moodImage23, open: () => router.push('/student/counselling') },
    { title: 'View Mood History', asset: assets.moodImage24, open: () => setHistory(true) },
  ];
  return <Screen contentStyle={{ paddingTop: 22, gap: 24 }}>
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Asset source={assets.moodImage21} width={57} />
      <Text accessibilityRole="header" style={[ui.heading, { fontSize: 32, color: '#5B8F73', textAlign: 'center' }]}>Your mood check-in</Text>
      <Text style={[ui.title, { fontSize: 20 }]}>Today’s mood</Text>
      {!validMood || validMood === 'happy' ? <Asset source={assets.moodImage18} width={77} label={validMood ? 'Happy' : 'Example happy mood'} /> : <Text style={[ui.heading, { paddingVertical: 16 }]}>{moods[validMood]}</Text>}
      <Text style={[ui.small, { textAlign: 'center' }]}>{validMood ? 'Preview of your selected mood; not saved.' : 'Example result — no check-in has been saved.'}</Text>
    </View>
    <Text style={[ui.title, { fontSize: 20, textAlign: 'center' }]}>You can explore some support options.</Text>
    <View style={{ gap: 28 }}>
      {actions.map((action, index) => <Pressable key={action.title} accessibilityRole="button" onPress={action.open} style={({ pressed }) => [ui.card, ui.row, { borderRadius: 20, minHeight: 80, paddingHorizontal: 20, backgroundColor: index === 0 || index === 3 ? palette.pink : palette.lavender, opacity: pressed ? 0.7 : 1 }]}>
        <Asset source={action.asset} width={43} /><Text style={[ui.title, { fontSize: 23, flex: 1, marginLeft: 20 }]}>{action.title}</Text>
      </Pressable>)}
    </View>
    <Dialog title="Mood history" visible={history} onClose={() => setHistory(false)}><Text style={ui.body}>No saved check-ins are available. Mood history will appear here when check-in storage is connected.</Text></Dialog>
  </Screen>;
}

