import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { MentorScreen } from '@/components/mentor/screen';
import { palette, ui } from '@/components/wellbeing/screen';
import { useMentorSession } from '@/state/mentor-session';

export default function MentorHomeScreen() {
  const { profile, referrals } = useMentorSession();
  const cards = [
    { label: 'Refer a Student', icon: '👤', route: '/mentor/referral' as const },
    { label: 'Counselling Directory', icon: '🔍', route: '/mentor/directory' as const },
    { label: 'View My Referrals', icon: '📋', route: '/mentor/referrals' as const },
  ];
  return <MentorScreen contentStyle={{ paddingTop: 38, gap: 28 }}>
    <View style={ui.row}><Text style={{ fontSize: 46 }}>☀️</Text><View style={ui.grow}>
      <Text style={[ui.title, { fontSize: 23 }]}>Hello, {profile.name}</Text>
      <Text style={[ui.title, { marginTop: 14 }]}>Together we support{ '\n'}student well-being</Text>
    </View></View>
    <View style={ui.row}>{[
      { label: 'Students', icon: '🎓', value: new Set(referrals.map(item => item.student.toLowerCase())).size },
      { label: 'Referrals', icon: '🏢', value: referrals.length },
      { label: 'Today', icon: '🗓️', value: referrals.filter(item => new Date(item.createdAt).toDateString() === new Date().toDateString()).length },
    ].map((item, i) => <Pressable key={item.label} accessibilityRole="button" onPress={() => router.push('/mentor/referrals')} style={[ui.card, { flex: 1, padding: 10, alignItems: 'center', backgroundColor: i === 1 ? palette.lavender : palette.pink }]}>
      <Text style={{ fontSize: 30 }}>{item.icon}</Text><Text style={ui.title}>{item.label}</Text><Text style={ui.small}>{item.value}</Text>
    </Pressable>)}</View>
    <Text style={[ui.heading, { marginTop: 20 }]}>Quick Actions</Text>
    {cards.map((card, i) => <Pressable key={card.label} accessibilityRole="button" onPress={() => router.push(card.route)} style={[ui.card, ui.row, { minHeight: 80, borderRadius: 22, backgroundColor: i === 1 ? palette.lavender : palette.pink }]}>
      <Text style={{ fontSize: 34 }}>{card.icon}</Text><Text style={[ui.title, { fontSize: 23, flex: 1, textAlign: 'center' }]}>{card.label}</Text>
    </Pressable>)}
    <Text style={ui.small}>Demo workspace. Profile and referral details stay in memory until the app reloads.</Text>
  </MentorScreen>;
}

