import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { MentorScreen } from '@/components/mentor/screen';
import { Asset, Button, palette, ui } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { useMentorSession } from '@/state/mentor-session';
export default function ReferralSentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { referrals } = useMentorSession();
  const referral = referrals.find(item => item.id === id);
  return <MentorScreen navigation={false} contentStyle={{ justifyContent: 'space-around', paddingTop: 50, gap: 30 }}>
    {referral ? <>
      <View style={{ alignItems: 'center', gap: 22 }}>
        <Asset source={assets.moodImage21} width={57} />
        <Text style={[ui.heading, { color: '#5B8F73', fontSize: 32 }]}>Referral Sent!</Text>
        <Asset source={assets.moodImage18} width={80} />
        <Text style={[ui.title, { textAlign: 'center' }]}>Demo confirmation for{ '\n'}{referral.student}</Text>
        <Text style={[ui.small, { textAlign: 'center' }]}>Not delivered. This referral exists only in this app session.</Text>
      </View>
      <View style={[ui.card, { backgroundColor: palette.lavender, gap: 8 }]}>
        <Text style={ui.title}>To: {referral.recipient}</Text><Text style={ui.title}>Service: {referral.service}</Text><Text style={ui.title}>Priority: {referral.priority}</Text>
        {!!referral.reason && <Text style={ui.body}>Reason: {referral.reason}</Text>}
      </View>
    </> : <><Text style={ui.heading}>No referral available</Text><Text style={ui.body}>This demo referral may have been cleared when the app reloaded.</Text></>}
    <Button label="Done" onPress={() => router.replace('/mentor/mentor-home')} style={{ marginHorizontal: 22 }} />
  </MentorScreen>;
}

