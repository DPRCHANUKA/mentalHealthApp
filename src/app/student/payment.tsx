import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    addAppointment,
    formatLongDate,
    formatShortDate,
    isSlotTaken,
    useAppointments,
} from '@/data/appointment-store';
import { type SessionKey, useCounselors } from '@/data/counselor-store';

// Change this if you use a different currency
const CURRENCY = 'Rs.';

const GREEN = '#0D6A4D';
const NAVY = '#1F2D45';
const BG = '#F7F6F2';

const CONCERNS = [
  'Anxiety Management',
  'Self-Compassion',
  'Overthinking',
  'Stress',
  'General Check-in',
];

type PayKey = 'card' | 'bank' | 'office';

const PAY_METHODS: {
  key: PayKey;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard', icon: 'card-outline' },
  { key: 'bank', label: 'Bank Transfer', sub: 'Pay by online banking', icon: 'swap-horizontal-outline' },
  { key: 'office', label: 'Pay at the Office', sub: 'Live in Office sessions only', icon: 'cash-outline' },
];

const FORMAT_LABEL: Record<SessionKey, string> = {
  video: '1 to 1 Video',
  audio: 'Audio Call',
  office: 'Live in Office',
};

const FORMAT_ICON: Record<SessionKey, keyof typeof Ionicons.glyphMap> = {
  video: 'videocam-outline',
  audio: 'call-outline',
  office: 'business-outline',
};

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const counselors = useCounselors();
  const appointments = useAppointments();

  const params = useLocalSearchParams<{
    counselorId?: string;
    format?: string;
    date?: string;
    time?: string;
  }>();

  const counselor = counselors.find((c) => c.id === first(params.counselorId));
  const format = first(params.format) as SessionKey | undefined;
  const date = first(params.date);
  const time = first(params.time);
  const session = counselor?.sessions.find((s) => s.format === format);

  const [concerns, setConcerns] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [agree, setAgree] = useState(false);
  const [method, setMethod] = useState<PayKey>('card');
  const [saving, setSaving] = useState(false);

  // Something is missing (for example the page was opened directly)
  if (!counselor || !session || !date || !time) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={46} color="#9CA3AF" />
        <Text style={styles.invalidTitle}>Booking details not found</Text>
        <Text style={styles.invalidText}>Please choose a counselor and a time slot first.</Text>
        <Pressable onPress={() => router.back()} style={styles.invalidButton}>
          <Text style={styles.invalidButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const fullName = `${counselor.firstName} ${counselor.lastName}`;
  const initials = `${counselor.firstName[0] ?? ''}${counselor.lastName[0] ?? ''}`.toUpperCase();
  const methods = PAY_METHODS.filter((m) => m.key !== 'office' || session.format === 'office');
  const fee = session.fee;

  const toggleConcern = (item: string) =>
    setConcerns((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );

  const handleConfirm = async () => {
    if (!agree) {
      Alert.alert('One more step', 'Please confirm the rescheduling policy to continue.');
      return;
    }

    // Someone may have taken this slot while you were on this page
    if (isSlotTaken(appointments, counselor.id, date, time)) {
      Alert.alert('Slot no longer available', 'Please choose another time.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    setSaving(true);
    await addAppointment({
      counselorId: counselor.id,
      counselorName: fullName,
      format: session.format,
      date,
      time,
      fee,
      concerns,
      note: note.trim(),
      paymentMethod: PAY_METHODS.find((m) => m.key === method)?.label ?? method,
    });
    setSaving(false);

    Alert.alert(
      'Booking confirmed',
      `Your session with ${fullName} is booked for ${formatShortDate(date)} at ${time}.`,
      [{ text: 'OK', onPress: () => router.replace('/student/student-home') }]
    );
  };

  const disabled = !agree || saving;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            {counselor.photoUri ? (
              <Image source={{ uri: counselor.photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <View style={styles.flex}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.specialties} numberOfLines={2}>
                {counselor.specialties.join(' · ')}
              </Text>
            </View>
          </View>

          <View style={styles.whenBox}>
            <View style={styles.whenRow}>
              <Ionicons name="calendar-outline" size={20} color={GREEN} />
              <Text style={styles.whenDate}>{formatLongDate(date)}</Text>
              <Text style={styles.whenTime}>{time}</Text>
            </View>
            <View style={styles.whenRow}>
              <Ionicons name={FORMAT_ICON[session.format]} size={20} color={GREEN} />
              <Text style={styles.whenFormat}>{FORMAT_LABEL[session.format]} session</Text>
            </View>
          </View>
        </View>

        {/* Concerns + note */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>What brings you in today?</Text>
            <Text style={styles.cardHint}>Select all that apply</Text>
          </View>
          <Text style={styles.cardSub}>
            This creates a gentle starting point for {counselor.firstName}.
          </Text>

          <View style={styles.chipWrap}>
            {CONCERNS.map((item) => {
              const selected = concerns.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggleConcern(item)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  {selected && <Ionicons name="checkmark" size={16} color={GREEN} />}
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.noteLabel}>
            Personal Note <Text style={styles.noteOptional}>(Optional & Private)</Text>
          </Text>
          <View style={styles.noteBox}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder={`Tell ${counselor.firstName} anything you'd like them to know beforehand...`}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={250}
              textAlignVertical="top"
            />
            <Text style={styles.noteCount}>{note.length}/250</Text>
          </View>

          <Pressable onPress={() => setAgree((v) => !v)} style={styles.agreeRow}>
            <Ionicons
              name={agree ? 'checkbox' : 'square-outline'}
              size={24}
              color={agree ? GREEN : '#6B7280'}
            />
            <Text style={styles.agreeText}>
              I understand the rescheduling policy and confirm these booking details are correct.
            </Text>
          </Pressable>
        </View>

        {/* Payment summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>

          <View style={styles.priceBox}>
            <View style={styles.priceLine}>
              <Text style={styles.priceLabel}>{FORMAT_LABEL[session.format]} session</Text>
              <Text style={styles.priceValue}>
                {CURRENCY} {fee}
              </Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalValue}>
                {CURRENCY} {fee}
              </Text>
            </View>
          </View>

          <Text style={styles.methodTitle}>Select Payment Method</Text>
          {methods.map((m) => {
            const selected = method === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[styles.method, selected && styles.methodSelected]}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name={m.icon} size={22} color={GREEN} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodSub}>{m.sub}</Text>
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selected ? GREEN : '#9CA3AF'}
                />
              </Pressable>
            );
          })}

          <View style={styles.demoNote}>
            <Ionicons name="information-circle-outline" size={20} color="#5B3E96" />
            <Text style={styles.demoText}>
              Demo checkout: no real payment is processed and no card details are collected.
            </Text>
          </View>

          <View style={styles.policyNote}>
            <Ionicons name="time-outline" size={20} color="#5B3E96" />
            <Text style={styles.demoText}>
              Gentle Rescheduling: free cancellation or rescheduling up to 24 hours before the
              session starts.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          disabled={disabled}
          onPress={handleConfirm}
          style={({ pressed }) => [
            styles.confirm,
            disabled && styles.confirmDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
          <Text style={styles.confirmText}>
            {saving
              ? 'Booking...'
              : method === 'office'
                ? 'Confirm Booking'
                : `Confirm & Pay ${CURRENCY} ${fee}`}
          </Text>
        </Pressable>
        {!agree && <Text style={styles.footerHint}>Tick the box above to continue</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: BG },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: NAVY },

  summaryCard: {
    backgroundColor: '#E6F4EE',
    borderRadius: 28,
    padding: 16,
    marginTop: 8,
    gap: 14,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#D5F5E8', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 24, fontWeight: '700', color: GREEN },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  specialties: { fontSize: 13, color: '#4B5563', marginTop: 4, lineHeight: 18 },

  whenBox: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, gap: 10 },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whenDate: { flex: 1, fontSize: 15, fontWeight: '700', color: NAVY },
  whenTime: { fontSize: 15, fontWeight: '700', color: GREEN },
  whenFormat: { fontSize: 14, color: '#4B5563' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginTop: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: NAVY, flex: 1 },
  cardHint: { fontSize: 12, color: '#6B7280', maxWidth: 80, textAlign: 'right' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 6 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F1EC',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  chipSelected: { backgroundColor: '#C9F0E0' },
  chipText: { fontSize: 14, fontWeight: '500', color: NAVY },
  chipTextSelected: { color: GREEN, fontWeight: '700' },

  noteLabel: { fontSize: 14, fontWeight: '700', color: NAVY, marginTop: 22, marginBottom: 8 },
  noteOptional: { fontWeight: '400', color: '#6B7280' },
  noteBox: { backgroundColor: '#F2F1EC', borderRadius: 14, padding: 14 },
  noteInput: { minHeight: 90, fontSize: 15, color: NAVY },
  noteCount: { textAlign: 'right', fontSize: 12, color: '#6B7280', marginTop: 6 },

  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F2F1EC',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  agreeText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },

  priceBox: { backgroundColor: '#F2F1EC', borderRadius: 14, padding: 16, marginTop: 16, gap: 14 },
  priceLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 15, color: NAVY },
  priceValue: { fontSize: 15, fontWeight: '600', color: NAVY },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDDBD3',
    paddingTop: 14,
  },
  totalLabel: { fontSize: 18, fontWeight: '700', color: NAVY },
  totalValue: { fontSize: 26, fontWeight: '800', color: NAVY },

  methodTitle: { fontSize: 14, fontWeight: '700', color: NAVY, marginTop: 22, marginBottom: 10 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#FBFAF7',
  },
  methodSelected: { borderColor: GREEN, backgroundColor: '#F2F1EC' },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { fontSize: 16, fontWeight: '600', color: NAVY },
  methodSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  demoNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F4F2FB',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  policyNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F4F2FB',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  demoText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },

  footer: {
    paddingTop: 14,
    paddingHorizontal: 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: GREEN,
    borderRadius: 30,
    paddingVertical: 17,
  },
  confirmDisabled: { backgroundColor: '#9DB8AF' },
  confirmText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  footerHint: { textAlign: 'center', fontSize: 12, color: '#6B7280' },
  pressed: { opacity: 0.85 },

  invalidTitle: { fontSize: 18, fontWeight: '700', color: NAVY, marginTop: 8 },
  invalidText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  invalidButton: {
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginTop: 14,
  },
  invalidButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});