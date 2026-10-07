import { router } from 'expo-router';
import { Text, Pressable } from 'react-native';
import { MentorScreen } from '@/components/mentor/screen';
import { Button, ui } from '@/components/wellbeing/screen';
import { useMentorSession } from '@/state/mentor-session';
export default function ReferralsScreen() {
  const { referrals } = useMentorSession();
  return <MentorScreen title="My Referrals">
    <Text style={ui.small}>Demo referrals from this session. These have not been delivered to a counsellor.</Text>
    {!referrals.length && <Text style={ui.body}>No referrals yet. Prepare a student referral to see it here.</Text>}
    {referrals.map(item => <Pressable key={item.id} accessibilityRole="button" style={ui.card} onPress={() => router.push({ pathname: '/mentor/referral-sent', params: { id: item.id } })}>
      <Text style={ui.title}>{item.student}</Text><Text style={ui.body}>{item.recipient} · {item.service}</Text><Text style={ui.small}>{item.priority} · Demo only</Text>
    </Pressable>)}
    <Button label="Refer a Student" onPress={() => router.push('/mentor/referral')} />
  </MentorScreen>;
}

