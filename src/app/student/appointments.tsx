import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DAY_SHORT,
  MONTH_LONG,
  SLOT_GROUPS,
  cancelAppointment,
  formatShortDate,
  fromDateKey,
  isSlotPast,
  isSlotTaken,
  toDateKey,
  useAppointments,
} from '@/data/appointment-store';
import { useCounselors, type Counselor, type SessionKey } from '@/data/counselor-store';

// Change this if you use a different currency
const CURRENCY = 'Rs.';

const GREEN = '#0D6A4D';
const NAVY = '#1F2D45';
const BG = '#F7F6F2';

const TOTAL_DAYS = 15; // days you can book ahead
const PAGE_SIZE = 5; // days shown at once

const FORMAT_LABEL: Record<SessionKey, string> = {
  video: '1 to 1 Video',
  audio: 'Audio Call',
  office: 'Live in Office',
};

const FORMAT_ICON: Record<SessionKey, keyof typeof Ionicons.glyphMap> = {
  video: 'videocam',
  audio: 'mic',
  office: 'business',
};

/* ------------------------------------------------------------------ */
/* Entry: show the booking page, or the list of appointments           */
/* ------------------------------------------------------------------ */

export default function AppointmentsScreen() {
  const { counselorId } = useLocalSearchParams<{ counselorId?: string | string[] }>();
  const counselors = useCounselors();

  const id = Array.isArray(counselorId) ? counselorId[0] : counselorId;
  const counselor = counselors.find((c) => c.id === id);

  if (!counselor) return <MyAppointments />;
  return <BookingView counselor={counselor} />;
}

/* ------------------------------------------------------------------ */
/* Booking view (counselor details + availability)                     */
/* ------------------------------------------------------------------ */

function BookingView({ counselor }: { counselor: Counselor }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appointments = useAppointments();

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return toDateKey(d);
    });
  }, []);

  const [page, setPage] = useState(0);
  const [dateKey, setDateKey] = useState(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [format, setFormat] = useState<SessionKey>(counselor.sessions[0]?.format ?? 'video');

  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local time';
    } catch {
      return 'your local time';
    }
  }, []);

  const fullName = `${counselor.firstName} ${counselor.lastName}`;
  const initials = `${counselor.firstName[0] ?? ''}${counselor.lastName[0] ?? ''}`.toUpperCase();

  const openCount = (key: string) => {
    let count = 0;
    for (const group of SLOT_GROUPS) {
      for (const slot of group.slots) {
        if (
          !isSlotTaken(appointments, counselor.id, key, slot.label) &&
          !isSlotPast(key, slot)
        ) {
          count++;
        }
      }
    }
    return count;
  };

  const visibleDays = days.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const selectedDate = fromDateKey(dateKey);
  const monthLabel = `${MONTH_LONG[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const lastPage = Math.ceil(TOTAL_DAYS / PAGE_SIZE) - 1;

  const proceed = () => {
    if (!time) return;
    router.push(
      `/student/payment?counselorId=${encodeURIComponent(counselor.id)}&format=${format}&date=${dateKey}&time=${encodeURIComponent(time)}` as Href
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Counselor Details</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Counselor card */}
        <View style={styles.profileCard}>
          {counselor.photoUri ? (
            <Image source={{ uri: counselor.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={2}>
                {fullName}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={GREEN} />
            </View>
            <Text style={styles.specialties} numberOfLines={2}>
              {counselor.specialties.join(' · ')}
            </Text>
            <View style={styles.formatBadge}>
              <Ionicons name={FORMAT_ICON[format]} size={14} color={GREEN} />
              <Text style={styles.formatBadgeText}>{FORMAT_LABEL[format]}</Text>
            </View>
          </View>
        </View>

        {/* Consultation type */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <Text style={styles.sectionHint}>Select one</Text>
        </View>
        <View style={styles.typeRow}>
          {counselor.sessions.map((s) => {
            const selected = format === s.format;
            return (
              <Pressable
                key={s.format}
                onPress={() => setFormat(s.format)}
                style={[styles.typeCard, selected && styles.typeCardSelected]}
              >
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={GREEN}
                    style={styles.typeCheck}
                  />
                )}
                <View style={[styles.typeIcon, selected && styles.typeIconSelected]}>
                  <Ionicons
                    name={FORMAT_ICON[s.format]}
                    size={22}
                    color={selected ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
                <Text style={styles.typeLabel}>{FORMAT_LABEL[s.format]}</Text>
                <Text style={styles.typeFee}>
                  {CURRENCY} {s.fee}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Month + day picker */}
        <View style={styles.monthRow}>
          <Text style={styles.month}>{monthLabel}</Text>
          <View style={styles.arrows}>
            <Pressable
              disabled={page === 0}
              onPress={() => setPage((p) => p - 1)}
              style={[styles.arrow, page === 0 && styles.arrowDisabled]}
            >
              <Ionicons name="chevron-back" size={18} color={NAVY} />
            </Pressable>
            <Pressable
              disabled={page === lastPage}
              onPress={() => setPage((p) => p + 1)}
              style={[styles.arrow, page === lastPage && styles.arrowDisabled]}
            >
              <Ionicons name="chevron-forward" size={18} color={NAVY} />
            </Pressable>
          </View>
        </View>

        <View style={styles.daysRow}>
          {visibleDays.map((key) => {
            const d = fromDateKey(key);
            const selected = key === dateKey;
            const available = openCount(key) > 0;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setDateKey(key);
                  setTime(null);
                }}
                style={[styles.dayPill, selected && styles.dayPillSelected]}
              >
                <Text style={[styles.dayName, selected && styles.dayTextSelected]}>
                  {DAY_SHORT[d.getDay()]}
                </Text>
                <Text style={[styles.dayNumber, selected && styles.dayTextSelected]}>
                  {d.getDate()}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: selected ? '#FFFFFF' : available ? '#4FA69E' : '#F4A58F' },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.timezone}>
          <Ionicons name="time-outline" size={20} color={GREEN} />
          <Text style={styles.timezoneText}>
            Time zone: <Text style={{ fontWeight: '700' }}>{timeZone}</Text>
          </Text>
        </View>

        {/* Time slots */}
        {SLOT_GROUPS.map((group) => {
          const available = group.slots.filter(
            (slot) =>
              !isSlotTaken(appointments, counselor.id, dateKey, slot.label) &&
              !isSlotPast(dateKey, slot)
          ).length;

          return (
            <View key={group.id} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotTitleRow}>
                  <View style={styles.slotIcon}>
                    <Ionicons name={group.icon} size={20} color={GREEN} />
                  </View>
                  <Text style={styles.slotTitle}>{group.title}</Text>
                </View>
                <Text style={styles.slotCount}>{available} available</Text>
              </View>

              <View style={styles.slotRow}>
                {group.slots.map((slot) => {
                  const booked = isSlotTaken(appointments, counselor.id, dateKey, slot.label);
                  const past = isSlotPast(dateKey, slot);
                  const disabled = booked || past;
                  const selected = time === slot.label;

                  return (
                    <Pressable
                      key={slot.label}
                      disabled={disabled}
                      onPress={() => setTime(slot.label)}
                      style={[
                        styles.slot,
                        selected && styles.slotSelected,
                        disabled && styles.slotDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotTime,
                          selected && styles.slotTimeSelected,
                          disabled && styles.slotTimeDisabled,
                          booked && styles.strike,
                        ]}
                      >
                        {slot.label}
                      </Text>
                      <Text
                        style={[
                          styles.slotNote,
                          selected && styles.slotNoteSelected,
                          disabled && styles.slotTimeDisabled,
                        ]}
                      >
                        {selected ? '● Selected' : booked ? 'Booked' : past ? 'Closed' : 'Open'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.flex}>
          <View style={styles.footerLabelRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.footerLabel}>SELECTED SLOT</Text>
          </View>
          <Text style={styles.footerValue} numberOfLines={1}>
            {time ? `${formatShortDate(dateKey)} · ${time}` : 'Pick a time'}
          </Text>
        </View>

        <Pressable
          disabled={!time}
          onPress={proceed}
          style={({ pressed }) => [
            styles.proceed,
            !time && styles.proceedDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.proceedText}>Proceed to Booking</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Fallback: the student's booked appointments                         */
/* ------------------------------------------------------------------ */

function MyAppointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appointments = useAppointments();

  const list = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'confirmed')
        .sort((a, b) => a.startsAt - b.startsAt),
    [appointments]
  );

  const confirmCancel = (id: string, name: string) => {
    Alert.alert('Cancel appointment', `Cancel your session with ${name}?`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel session', style: 'destructive', onPress: () => cancelAppointment(id) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={46} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptyText}>
              Choose a counselor to book your first session.
            </Text>
            <Pressable
              onPress={() => router.push('/student/counselor-page' as Href)}
              style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
            >
              <Text style={styles.emptyButtonText}>Find a counselor</Text>
            </Pressable>
          </View>
        ) : (
          list.map((a) => (
            <View key={a.id} style={styles.apptCard}>
              <View style={styles.apptTop}>
                <View style={styles.slotIcon}>
                  <Ionicons name={FORMAT_ICON[a.format]} size={20} color={GREEN} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.apptName}>{a.counselorName}</Text>
                  <Text style={styles.apptMeta}>{FORMAT_LABEL[a.format]}</Text>
                </View>
                <Text style={styles.apptFee}>
                  {CURRENCY} {a.fee}
                </Text>
              </View>
              <View style={styles.apptWhen}>
                <Ionicons name="calendar-outline" size={16} color={GREEN} />
                <Text style={styles.apptWhenText}>
                  {formatShortDate(a.date)} · {a.time}
                </Text>
              </View>
              <Pressable onPress={() => confirmCancel(a.id, a.counselorName)}>
                <Text style={styles.cancelLink}>Cancel session</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: BG },
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

  profileCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#E6F4EE',
    borderRadius: 28,
    padding: 16,
    marginTop: 8,
  },
  avatar: { width: 82, height: 82, borderRadius: 24 },
  avatarFallback: { backgroundColor: '#D5F5E8', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 26, fontWeight: '700', color: GREEN },
  profileInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', flexShrink: 1 },
  specialties: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#C9F0E0',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  formatBadgeText: { fontSize: 13, fontWeight: '600', color: GREEN },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: NAVY },
  sectionHint: { fontSize: 13, color: '#6B7280' },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  typeCardSelected: { borderColor: GREEN },
  typeCheck: { position: 'absolute', top: 8, right: 8 },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF0F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconSelected: { backgroundColor: GREEN },
  typeLabel: { fontSize: 14, fontWeight: '600', color: NAVY, textAlign: 'center' },
  typeFee: { fontSize: 12, color: '#6B7280' },

  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },
  month: { fontSize: 24, fontWeight: '700', color: NAVY },
  arrows: { flexDirection: 'row', gap: 10 },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.4 },

  daysRow: { flexDirection: 'row', gap: 8 },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 14,
    gap: 4,
  },
  dayPillSelected: { backgroundColor: GREEN },
  dayName: { fontSize: 13, color: '#4B5563' },
  dayNumber: { fontSize: 22, fontWeight: '700', color: NAVY },
  dayTextSelected: { color: '#FFFFFF' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },

  timezone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECEBE6',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  timezoneText: { fontSize: 14, color: NAVY, flex: 1 },

  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 16,
    marginTop: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  slotTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitle: { fontSize: 17, fontWeight: '600', color: NAVY },
  slotCount: { fontSize: 13, color: '#6B7280' },
  slotRow: { flexDirection: 'row', gap: 10 },
  slot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F2F1EC',
    borderRadius: 24,
    paddingVertical: 14,
    gap: 2,
  },
  slotSelected: { backgroundColor: GREEN },
  slotDisabled: { backgroundColor: '#F6F5F2' },
  slotTime: { fontSize: 14, fontWeight: '600', color: NAVY },
  slotTimeSelected: { color: '#FFFFFF' },
  slotTimeDisabled: { color: '#B8BDC2' },
  strike: { textDecorationLine: 'line-through' },
  slotNote: { fontSize: 12, color: '#6B7280' },
  slotNoteSelected: { color: '#FFFFFF' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.5 },
  footerValue: { fontSize: 17, fontWeight: '700', color: NAVY, marginTop: 2 },
  proceed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  proceedDisabled: { backgroundColor: '#9DB8AF' },
  proceedText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: NAVY, marginTop: 6 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  emptyButton: {
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 14,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  apptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    gap: 12,
  },
  apptTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  apptName: { fontSize: 17, fontWeight: '700', color: NAVY },
  apptMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  apptFee: { fontSize: 15, fontWeight: '700', color: NAVY },
  apptWhen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2F1EC',
    borderRadius: 12,
    padding: 12,
  },
  apptWhenText: { fontSize: 14, fontWeight: '600', color: NAVY },
  cancelLink: { color: '#B42318', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});