import { mentorStyles as s } from '@/components/mentor/styles';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { MentorScreen } from '@/components/mentor/screen';
import { Asset, Button, ui } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { useMentorSession } from '@/state/mentor-session';
export default function ReferralSentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { referrals } = useMentorSession();
  const referral = referrals.find(item => item.id === id);
  return <MentorScreen navigation={false} contentStyle={{ paddingTop: 36, gap: 24 }}>
    {referral ? <>
      <View style={[s.panel, { alignItems: 'center', gap: 18, paddingVertical: 32 }]}>
        <Asset source={assets.moodImage21} width={57} />
        <Text style={[ui.heading, { color: '#5B8F73', fontSize: 32 }]}>Referral prepared</Text>
        <Text style={[s.eyebrow, { backgroundColor: '#E3EEEB', padding: 10, borderRadius: 12 }]}>DEMO CONFIRMATION</Text>
        <Text style={[ui.title, { textAlign: 'center' }]}>Demo confirmation for{ '\n'}{referral.student}</Text>
        <Text style={[ui.small, { textAlign: 'center' }]}>Not delivered. This referral exists only in this app session.</Text>
      </View>
      <View style={s.panel}><Text style={s.eyebrow}>REFERRAL SUMMARY</Text>
        <Text style={ui.title}>To: {referral.recipient}</Text><Text style={ui.title}>Service: {referral.service}</Text><Text style={ui.title}>Priority: {referral.priority}</Text>
        {!!referral.reason && <Text style={ui.body}>Reason: {referral.reason}</Text>}
      </View>
    </> : <><Text style={ui.heading}>No referral available</Text><Text style={ui.body}>This demo referral may have been cleared when the app reloaded.</Text></>}
    <Button label="View my referrals" tone="secondary" onPress={() => router.replace('/mentor/referrals')} />
    <Button label="Back to Mentor Home" onPress={() => router.replace('/mentor/mentor-home')} style={{ borderRadius: 16 }} />
  </MentorScreen>;
}


