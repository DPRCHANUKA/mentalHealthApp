import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  MONTH_SHORT,
  SLOT_GROUPS,
  cancelAppointment,
  formatShortDate,
  fromDateKey,
  isSlotPast,
  isSlotTaken,
  toDateKey,
  useAppointments,
  type Appointment,
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

const TIP: Record<SessionKey, string> = {
  video: 'Find a quiet, private spot and check your connection a few minutes early.',
  audio: 'Find a quiet spot and keep your phone nearby.',
  office: 'Please arrive a few minutes early.',
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
/* My Appointments (reminders)                                         */
/* ------------------------------------------------------------------ */

type Tab = 'upcoming' | 'past';

// "Today · in 3 h", "Tomorrow", "In 4 days" ...
const relativeLabel = (a: Appointment) => {
  const diff = a.startsAt - Date.now();
  if (diff <= 0) return 'Started';

  const mins = Math.ceil(diff / 60000);
  if (mins < 60) return `In ${mins} min`;

  const today = fromDateKey(toDateKey(new Date())).getTime();
  const days = Math.round((fromDateKey(a.date).getTime() - today) / 86400000);

  if (days <= 0) return `Today · in ${Math.floor(mins / 60)} h`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

function MyAppointments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const appointments = useAppointments();
  const counselors = useCounselors();
  const [tab, setTab] = useState<Tab>('upcoming');

  // counselor id -> photo, so the hero card can show the counselor's picture
  const photoOf = useMemo(() => {
    const map = new Map<string, string | null>();
    counselors.forEach((c) => map.set(c.id, c.photoUri));
    return map;
  }, [counselors]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: Appointment[] = [];
    const done: Appointment[] = [];
    appointments.forEach((a) => {
      if (a.status === 'confirmed' && a.startsAt > now) up.push(a);
      else done.push(a);
    });
    up.sort((x, y) => x.startsAt - y.startsAt);
    done.sort((x, y) => y.startsAt - x.startsAt);
    return { upcoming: up, past: done };
  }, [appointments]);

  const confirmCancel = (a: Appointment) => {
    Alert.alert('Cancel appointment', `Cancel your session with ${a.counselorName}?`, [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel session', style: 'destructive', onPress: () => cancelAppointment(a.id) },
    ]);
  };

  const [next, ...later] = upcoming;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>
      <Text style={styles.pageSubtitle}>Your upcoming sessions and gentle reminders.</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'past'] as Tab[]).map((t) => {
          const selected = tab === t;
          const count = t === 'upcoming' ? upcoming.length : past.length;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                {t === 'upcoming' ? 'Upcoming' : 'Past'}
              </Text>
              <View style={[styles.tabCount, selected && styles.tabCountSelected]}>
                <Text style={[styles.tabCountText, selected && styles.tabCountTextSelected]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'upcoming' ? (
          upcoming.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No upcoming sessions"
              text="When you book a session, it will show up here with a reminder."
            />
          ) : (
            <>
              <HeroCard
                a={next}
                photoUri={photoOf.get(next.counselorId)}
                onCancel={() => confirmCancel(next)}
              />

              {later.length > 0 && (
                <>
                  <Text style={styles.listHeading}>Later</Text>
                  {later.map((a) => (
                    <AppointmentRow key={a.id} a={a} kind="upcoming" onCancel={() => confirmCancel(a)} />
                  ))}
                </>
              )}
            </>
          )
        ) : past.length === 0 ? (
          <EmptyState
            icon="time-outline"
            title="Nothing here yet"
            text="Your finished and cancelled sessions will be listed here."
          />
        ) : (
          past.map((a) => <AppointmentRow key={a.id} a={a} kind="past" />)
        )}
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.myFooter, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={() => router.push('/student/counselor-page' as Href)}
          style={({ pressed }) => [styles.bookNew, pressed && styles.pressed]}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.bookNewText}>Book a new session</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Avatar({
  name,
  photoUri,
  size,
}: {
  name: string;
  photoUri?: string | null;
  size: number;
}) {
  const box = { width: size, height: size, borderRadius: size * 0.3 };
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

  if (photoUri) return <Image source={{ uri: photoUri }} style={[styles.avatarImg, box]} />;

  return (
    <View style={[styles.avatarBox, box]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

function HeroCard({
  a,
  photoUri,
  onCancel,
}: {
  a: Appointment;
  photoUri?: string | null;
  onCancel: () => void;
}) {
  return (
    <LinearGradient
      colors={['#0D6A4D', '#2F8F7E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroTop}>
        <Text style={styles.heroLabel}>NEXT SESSION</Text>
        <View style={styles.heroChip}>
          <Ionicons name="alarm-outline" size={14} color="#FFFFFF" />
          <Text style={styles.heroChipText}>{relativeLabel(a)}</Text>
        </View>
      </View>

      <View style={styles.heroPerson}>
        <Avatar name={a.counselorName} photoUri={photoUri} size={66} />
        <View style={styles.flex}>
          <Text style={styles.heroName} numberOfLines={2}>
            {a.counselorName}
          </Text>
          <View style={styles.heroFormat}>
            <Ionicons name={FORMAT_ICON[a.format]} size={14} color="#FFFFFF" />
            <Text style={styles.heroFormatText}>{FORMAT_LABEL[a.format]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.heroWhen}>
        <View style={styles.heroWhenItem}>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <View>
            <Text style={styles.heroWhenLabel}>Date</Text>
            <Text style={styles.heroWhenValue}>{formatShortDate(a.date)}</Text>
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroWhenItem}>
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
          <View>
            <Text style={styles.heroWhenLabel}>Time</Text>
            <Text style={styles.heroWhenValue}>{a.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.heroTip}>
        <Ionicons name="bulb-outline" size={18} color="#D8F3EA" />
        <Text style={styles.heroTipText}>{TIP[a.format]}</Text>
      </View>

      <Pressable onPress={onCancel} style={({ pressed }) => [styles.heroCancel, pressed && styles.pressed]}>
        <Text style={styles.heroCancelText}>Cancel session</Text>
      </Pressable>
    </LinearGradient>
  );
}

function AppointmentRow({
  a,
  kind,
  onCancel,
}: {
  a: Appointment;
  kind: 'upcoming' | 'past';
  onCancel?: () => void;
}) {
  const d = fromDateKey(a.date);
  const isPast = kind === 'past';
  const cancelled = a.status === 'cancelled';

  return (
    <View style={[styles.row, isPast && styles.rowPast]}>
      <View style={styles.rowMain}>
        <View style={[styles.dateBlock, isPast && styles.dateBlockPast]}>
          <Text style={styles.dateMonth}>{MONTH_SHORT[d.getMonth()].toUpperCase()}</Text>
          <Text style={styles.dateDay}>{d.getDate()}</Text>
          <Text style={styles.dateWeekday}>{DAY_SHORT[d.getDay()]}</Text>
        </View>

        <View style={styles.flex}>
          <Text style={styles.rowName} numberOfLines={1}>
            {a.counselorName}
          </Text>
          <View style={styles.rowMeta}>
            <Ionicons name={FORMAT_ICON[a.format]} size={14} color={GREEN} />
            <Text style={styles.rowMetaText}>{FORMAT_LABEL[a.format]}</Text>
          </View>
          <View style={styles.rowMeta}>
            <Ionicons name="time-outline" size={14} color={GREEN} />
            <Text style={styles.rowMetaText}>{a.time}</Text>
          </View>
        </View>

        {isPast ? (
          <View style={[styles.statusChip, cancelled ? styles.statusCancelled : styles.statusDone]}>
            <Text
              style={[styles.statusText, { color: cancelled ? '#B42318' : GREEN }]}
            >
              {cancelled ? 'Cancelled' : 'Completed'}
            </Text>
          </View>
        ) : (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{relativeLabel(a)}</Text>
          </View>
        )}
      </View>

      {!isPast && onCancel && (
        <View style={styles.rowFooter}>
          <Text style={styles.rowFee}>
            {CURRENCY} {a.fee}
          </Text>
          <Pressable onPress={onCancel} hitSlop={8}>
            <Text style={styles.rowCancel}>Cancel session</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyCircle}>
        <Ionicons name={icon} size={38} color={GREEN} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
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

  /* ---------- Booking view ---------- */
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

  /* ---------- My Appointments ---------- */
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginTop: -4,
    marginBottom: 14,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ECEBE6',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 20,
  },
  tabSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  tabTextSelected: { color: NAVY },
  tabCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: '#DAD9D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountSelected: { backgroundColor: GREEN },
  tabCountText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  tabCountTextSelected: { color: '#FFFFFF' },

  listContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  listHeading: { fontSize: 18, fontWeight: '700', color: NAVY, marginTop: 26, marginBottom: 4 },

  hero: {
    borderRadius: 30,
    padding: 20,
    gap: 16,
    shadowColor: '#0D6A4D',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#CDEFE3' },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  heroChipText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  heroPerson: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  heroFormat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  heroFormatText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  heroWhen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  heroWhenItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroWhenLabel: { fontSize: 12, color: '#CDEFE3' },
  heroWhenValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  heroDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 12 },

  heroTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  heroTipText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#E4F7F0' },

  heroCancel: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingVertical: 13,
  },
  heroCancelText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  avatarImg: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  avatarBox: {
    backgroundColor: '#D5F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarInitials: { fontWeight: '800', color: GREEN },

  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  rowPast: { opacity: 0.88 },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateBlock: {
    width: 62,
    alignItems: 'center',
    backgroundColor: '#E6F4EE',
    borderRadius: 18,
    paddingVertical: 10,
  },
  dateBlockPast: { backgroundColor: '#EFEEE9' },
  dateMonth: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: GREEN },
  dateDay: { fontSize: 24, fontWeight: '800', color: NAVY, lineHeight: 28 },
  dateWeekday: { fontSize: 12, color: '#6B7280' },

  rowName: { fontSize: 17, fontWeight: '700', color: NAVY, marginBottom: 4 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  rowMetaText: { fontSize: 13, color: '#4B5563' },

  countChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9DEFB',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  countChipText: { fontSize: 12, fontWeight: '700', color: '#4B3A78' },

  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusDone: { backgroundColor: '#E6F4EE' },
  statusCancelled: { backgroundColor: '#FEECEC' },
  statusText: { fontSize: 12, fontWeight: '700' },

  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EFEEE9',
    marginTop: 14,
    paddingTop: 12,
  },
  rowFee: { fontSize: 15, fontWeight: '700', color: NAVY },
  rowCancel: { fontSize: 14, fontWeight: '600', color: '#B42318' },

  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 12, gap: 8 },
  emptyCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: NAVY },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },

  myFooter: {
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: GREEN,
    borderRadius: 30,
    paddingVertical: 16,
  },
  bookNewText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});