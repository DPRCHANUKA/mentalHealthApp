import { MentorScreen } from '@/components/mentor/screen';
import { mentorStyles as s } from '@/components/mentor/styles';
import { palette, ui } from '@/components/wellbeing/screen';
import { useMentorSession } from '@/state/mentor-session';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function MentorHomeScreen() {
  const { profile, referrals } = useMentorSession();
  const cards = [
    { label: 'Refer a student', detail: 'Prepare a supportive next step.', icon: 'person-add-outline', route: '/mentor/referral' },
    { label: 'Counselling directory', detail: 'Explore the available support team.', icon: 'people-outline', route: '/mentor/directory' },
    { label: 'My referrals', detail: 'Review referrals from this session.', icon: 'documents-outline', route: '/mentor/referrals' },
  ] as const;
  return <MentorScreen title="Mentor Home" subtitle="Small actions. Meaningful support." contentStyle={{ gap: 20 }}>
    <View style={s.banner}>
      <Text style={[s.eyebrow, { color: '#9DD8D0' }]}>YOUR MENTOR SPACE</Text>
     <Text style={[ui.heading, { color: '#FFF', fontSize: 28 }]}>Hello{profile.name ? `, ${profile.name}` : ''}</Text>
      <Text style={[ui.body, { color: '#D4E2E7' }]}>Together, we can make it easier for students to reach out.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/mentor/profile')} style={{ alignSelf: 'flex-start', paddingVertical: 12 }}>
        <Text style={{ color: '#B8EAE2', fontWeight: '600' }}>View your profile →</Text>
      </Pressable>
    </View>
    <View style={ui.row}>{[
      { label: 'Students', value: new Set(referrals.map(item => item.student.toLowerCase())).size },
      { label: 'Referrals', value: referrals.length },
      { label: 'Today', value: referrals.filter(item => new Date(item.createdAt).toDateString() === new Date().toDateString()).length },
    ].map(item => <Pressable key={item.label} accessibilityRole="button" onPress={() => router.push('/mentor/referrals')} style={[s.panel, { flex: 1, padding: 12, gap: 6, alignItems: 'center' }]}>
      <Text style={[ui.heading, { fontSize: 28 }]}>{item.value}</Text><Text style={ui.small}>{item.label}</Text>
    </Pressable>)}</View>
    <Text style={[ui.title, { fontSize: 20 }]}>How can we help today?</Text>
    {cards.map(card => <Pressable key={card.label} accessibilityRole="button" onPress={() => router.push(card.route)}
      style={({ pressed }) => [s.panel, ui.row, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={s.icon}><Ionicons name={card.icon} size={24} color={palette.teal} /></View>
      <View style={ui.grow}><Text style={ui.title}>{card.label}</Text><Text style={[ui.small, { marginTop: 5 }]}>{card.detail}</Text></View>
      <Ionicons name="chevron-forward" size={18} color={palette.muted} />
    </Pressable>)}
    <View style={s.notice}><Text style={ui.small}>Demo workspace · Counts reflect this session only. Referrals are not delivered to a counsellor.</Text></View>
  </MentorScreen>;
}
