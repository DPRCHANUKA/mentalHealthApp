import { MentorScreen } from '@/components/mentor/screen';
import { mentorStyles as s } from '@/components/mentor/styles';
import { Button, palette, ui } from '@/components/wellbeing/screen';
import { counsellors } from '@/constants/wellbeing-content';
import { addReferral } from '@/state/mentor-session';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';

const services = ['Psychologist', 'Counsellor'] as const;
const priorities = ['Normal', 'High'] as const;

type IconName = keyof typeof Ionicons.glyphMap;

const SERVICE_ICON: Record<(typeof services)[number], IconName> = {
  Psychologist: 'pulse-outline',
  Counsellor: 'chatbubbles-outline',
};
const PRIORITY_ICON: Record<(typeof priorities)[number], IconName> = {
  Normal: 'time-outline',
  High: 'flash-outline',
};

/* Section heading with a small icon */
function Label({ icon, text, hint }: { icon: IconName; text: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E3EEEB', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={16} color={palette.teal} />
      </View>
      <Text style={[ui.title, { fontSize: 16 }]}>{text}</Text>
      {!!hint && <Text style={ui.small}>{hint}</Text>}
    </View>
  );
}

/* Two selectable tiles side by side */
function OptionGroup<T extends string>({ values, value, onChange, icons }: {
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  icons: Record<T, IconName>;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {values.map(item => {
        const selected = item === value;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(item)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 64,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: selected ? palette.teal : palette.border,
              backgroundColor: selected ? '#E3EEEB' : '#FFF',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name={icons[item]} size={22} color={selected ? palette.teal : palette.muted} />
            <Text style={{ fontSize: 14, fontWeight: selected ? '700' : '600', color: selected ? palette.ink : palette.muted }}>{item}</Text>
            {selected && (
              <View style={{ position: 'absolute', top: 6, right: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color={palette.teal} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MentorReferralScreen() {
  const { recipient } = useLocalSearchParams<{ recipient?: string }>();
  const [recipientId, setRecipientId] = useState<string | undefined>(
    counsellors.find(item => item.id === recipient)?.id
  );
  const person = counsellors.find(item => item.id === recipientId);
  const [student, setStudent] = useState('');
  const [reason, setReason] = useState('');
  const [service, setService] = useState<(typeof services)[number]>(person?.speciality ?? 'Psychologist');
  const [priority, setPriority] = useState<(typeof priorities)[number]>('Normal');
  const [error, setError] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [focus, setFocus] = useState<'student' | 'reason' | null>(null);

  function pickPerson(item: (typeof counsellors)[number]) {
    setRecipientId(item.id);
    setService(item.speciality); // keep the service in line with the chosen person
    setRecipientError('');
  }

  function submit() {
    let ok = true;
    if (!person) { setRecipientError('Choose a counsellor or psychologist before sending.'); ok = false; }
    if (!student.trim()) { setError('Enter the student name before preparing a referral.'); ok = false; }
    if (!ok || !person) return;
    setError('');
    setRecipientError('');
    const id = addReferral({ student: student.trim(), reason: reason.trim(), service, priority, recipient: person.name });
    router.replace({ pathname: '/mentor/referral-sent', params: { id } });
  }

  const studentBorder = error ? palette.danger : focus === 'student' ? palette.teal : palette.border;
  const reasonBorder = focus === 'reason' ? palette.teal : palette.border;

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <MentorScreen title="New Referral" back navigation={false} subtitle="Help a student take the next step." contentStyle={{ gap: 18, paddingTop: 8 }}>

      {/* Recipient */}
      <View style={[s.panel, { gap: 12 }]}>
        <Label icon="people-outline" text="Refer to" hint="(required)" />
        <View style={{ gap: 10 }}>
          {counsellors.map(item => {
            const selected = item.id === recipientId;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${item.name}, ${item.speciality}`}
                onPress={() => pickPerson(item)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: selected ? palette.teal : recipientError ? palette.danger : palette.border,
                  backgroundColor: selected ? '#E3EEEB' : '#FFF',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: selected ? palette.teal : '#E3EEEB', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="person" size={20} color={selected ? '#FFF' : palette.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[ui.title, { fontSize: 16 }]}>{item.name}</Text>
                  <Text style={[ui.small, { marginTop: 2 }]}>{item.speciality}</Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={selected ? palette.teal : palette.muted}
                />
              </Pressable>
            );
          })}
        </View>
        {!!recipientError && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle" size={16} color={palette.danger} />
            <Text accessibilityRole="alert" style={[ui.error, { flex: 1 }]}>{recipientError}</Text>
          </View>
        )}
        <Text style={ui.small}>Only include information needed to arrange support.</Text>
      </View>

      {/* Student name */}
      <View style={[s.panel, { gap: 12 }]}>
        <Label icon="school-outline" text="Student name" />
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1.5, borderColor: studentBorder,
          paddingHorizontal: 14,
        }}>
          <Ionicons name="person-outline" size={20} color={error ? palette.danger : palette.teal} />
          <TextInput
            accessibilityLabel="Student name"
            placeholder="Enter the student name"
            placeholderTextColor={palette.muted}
            value={student}
            onChangeText={value => { setStudent(value); setError(''); }}
            onFocus={() => setFocus('student')}
            onBlur={() => setFocus(null)}
            maxLength={100}
            autoCapitalize="words"
            style={[ui.searchInput, { fontSize: 16, minHeight: 52 }]}
          />
          {student.length > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear name" onPress={() => setStudent('')} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={palette.muted} />
            </Pressable>
          )}
        </View>
        {!!error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle" size={16} color={palette.danger} />
            <Text accessibilityRole="alert" style={[ui.error, { flex: 1 }]}>{error}</Text>
          </View>
        )}
      </View>

      {/* Reason */}
      <View style={[s.panel, { gap: 12 }]}>
        <Label icon="document-text-outline" text="Reason" hint="(optional)" />
        <TextInput
          accessibilityLabel="Referral reason, optional"
          multiline
          maxLength={1000}
          value={reason}
          onChangeText={setReason}
          onFocus={() => setFocus('reason')}
          onBlur={() => setFocus(null)}
          placeholder="Briefly describe the support needed..."
          placeholderTextColor={palette.muted}
          style={[ui.input, { minHeight: 120, textAlignVertical: 'top', borderWidth: 1.5, borderColor: reasonBorder, borderRadius: 14 }]}
        />
        <Text style={[ui.small, { textAlign: 'right' }]}>{reason.length}/1000</Text>
      </View>

      {/* Priority + service */}
      <View style={[s.panel, { gap: 14 }]}>
        <Label icon="flag-outline" text="Priority" />
        <OptionGroup values={priorities} value={priority} onChange={setPriority} icons={PRIORITY_ICON} />
        <View style={{ height: 4 }} />
        <Label icon="briefcase-outline" text="Service" />
        <OptionGroup values={services} value={service} onChange={setService} icons={SERVICE_ICON} />
      </View>

      {/* Send */}
      <View style={{ gap: 12 }}>
        <Button
          label="Send Referral"
          onPress={submit}
          icon={<Ionicons name="send" size={18} color="#FFF" />}
          style={{ borderRadius: 20, minHeight: 56, marginHorizontal: 0 }}
        />
        <Text style={[ui.small, { textAlign: 'center' }]}>Demo only. Details stay in this session and are not delivered to a counsellor.</Text>
      </View>

    </MentorScreen>
  </KeyboardAvoidingView>;
}