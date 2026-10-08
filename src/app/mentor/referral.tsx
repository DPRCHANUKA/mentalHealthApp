import { mentorStyles as s } from '@/components/mentor/styles';
import { router, useLocalSearchParams } from 'expo-router';
import { MentorScreen } from '@/components/mentor/screen';
import { addReferral } from '@/state/mentor-session';
import { counsellors } from '@/constants/wellbeing-content';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { Asset, Button, Chips, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';

const services = ['Psychologist', 'Counsellor'] as const;
const priorities = ['Normal', 'Priority'] as const;
export default function MentorReferralScreen() {
  const { recipient } = useLocalSearchParams<{ recipient?: string }>();
  const person = counsellors.find(item => item.id === recipient);
  const [student, setStudent] = useState('');
  const [reason, setReason] = useState('');
  const [service, setService] = useState<(typeof services)[number]>(person?.speciality ?? 'Psychologist');
  const [priority, setPriority] = useState<(typeof priorities)[number]>('Normal');
  const [error, setError] = useState('');

  function submit() {
    if (!student.trim()) { setError('Enter the student name before preparing a referral.'); return; }
    setError('');
    const id = addReferral({ student: student.trim(), reason: reason.trim(), service, priority, recipient: person?.name ?? 'Unassigned counsellor' });
    router.replace({ pathname: '/mentor/referral-sent', params: { id } });
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <MentorScreen title="New Referral" back navigation={false} subtitle="Help a student take the next step." contentStyle={{ gap: 20, paddingTop: 8 }}>
      <View style={s.notice}><Text style={s.eyebrow}>REFERRAL DETAILS</Text><Text style={ui.body}>To: {person?.name ?? 'Unassigned counsellor'}</Text><Text style={ui.small}>Only include information needed to arrange support.</Text></View>
      <View style={s.panel}>
        <Text style={ui.title}>Student name</Text>
        <View style={[ui.search, { borderRadius: 10 }]}><Asset source={assets.directoryFrame} width={24} /><TextInput accessibilityLabel="Student name" placeholder="Enter the student name" placeholderTextColor={palette.muted} value={student} onChangeText={value => { setStudent(value); setError(''); }} maxLength={100} autoCapitalize="words" style={[ui.searchInput, { fontSize: 16 }]} /></View>
        {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
      </View>
      <View style={s.panel}>
        <Text style={ui.title}>Reason (optional)</Text>
        <TextInput accessibilityLabel="Referral reason, optional" multiline maxLength={1000} value={reason} onChangeText={setReason} placeholder="Briefly describe the support needed..." placeholderTextColor={palette.muted} style={[ui.input, { minHeight: 132, textAlignVertical: 'top' }]} />
        <Text style={[ui.small, { textAlign: 'right' }]}>{reason.length}/1000</Text><Text style={ui.title}>Priority</Text><Chips values={priorities} value={priority} onChange={setPriority} />
        <Text style={ui.title}>Service</Text><Chips values={services} value={service} onChange={setService} />
      </View>
      <View style={{ gap: 12, marginTop: 0 }}>
        <Button label="Send Referral" onPress={submit} style={{ borderRadius: 20, minHeight: 56, marginHorizontal: 0 }} />
        <Text style={[ui.small, { textAlign: 'center' }]}>Demo only. Details stay in this session and are not delivered to a counsellor.</Text>
      </View>

    </MentorScreen>
  </KeyboardAvoidingView>;
}




