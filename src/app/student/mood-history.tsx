import { Text } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, ui } from '@/components/wellbeing/screen';

export default function MoodHistoryScreen() {
  return <Screen title="Mood History" back>
    <Text style={ui.heading}>No saved check-ins yet</Text>
    <Text style={ui.body}>Your current check-ins are previews and are not stored. You can start a new check-in below.</Text>
    <Button label="Start a check-in" onPress={() => router.push('/student/check-in')} />
  </Screen>;
}
