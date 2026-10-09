import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useCounselors,
  type Counselor,
  type SessionKey,
} from '@/data/counselor-store';

// Change this if you use a different currency
const CURRENCY = 'Rs.';

const ALL = 'All Practitioners';
const FILTERS = [ALL, 'Anxiety Management', 'Self-Compassion', 'Overthinking', 'Stress'];

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

const CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  'Anxiety Management': { bg: '#FDE3DC', text: '#9A3B2A' },
  'Self-Compassion': { bg: '#D5F5E8', text: '#0B5A41' },
  Overthinking: { bg: '#EDE4FB', text: '#5B3E96' },
  Stress: { bg: '#E9E8E4', text: '#4B5563' },
};

const GREEN = '#0D6A4D';
const NAVY = '#1F2D45';

export default function CounselorPageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const counselors = useCounselors();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return counselors.filter((c) => {
      const matchesFilter = filter === ALL || c.specialties.includes(filter);
      const text =
        `${c.firstName} ${c.lastName} ${c.about} ${c.specialties.join(' ')}`.toLowerCase();
      return matchesFilter && (!q || text.includes(q));
    });
  }, [counselors, query, filter]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#6B7280" />
        </Pressable>

        <View style={styles.tagRow}>
          <Ionicons name="heart" size={16} color={GREEN} />
          <Text style={styles.tagText}>Empathetic, licensed care</Text>
        </View>
        <Text style={styles.title}>Find your supportive space</Text>
        <Text style={styles.subtitle}>
          Connect with trusted practitioners aligned with your personal journey and pace.
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by concern or counselor"
            placeholderTextColor="#6B7280"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>

        {/* Specialty filter */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>EXPLORE SPECIALTIES</Text>
          <Text style={styles.sectionCount}>{counselors.length} counselors</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => {
            const selected = filter === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={44} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {counselors.length === 0 ? 'No counselors yet' : 'No matches found'}
            </Text>
            <Text style={styles.emptyText}>
              {counselors.length === 0
                ? 'Add a counselor and they will appear here.'
                : 'Try a different search or specialty.'}
            </Text>
            {counselors.length === 0 && (
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push('/student/add-counselor')}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Counselor</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((c) => <CounselorCard key={c.id} counselor={c} />)
        )}
      </ScrollView>
    </View>
  );
}

function CounselorCard({ counselor: c }: { counselor: Counselor }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const fullName = `${c.firstName} ${c.lastName}`;
  const initials = `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
  const lowestFee = c.sessions.length ? Math.min(...c.sessions.map((s) => s.fee)) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {c.photoUri ? (
          <Image source={{ uri: c.photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {fullName}
          </Text>
          <Text style={styles.meta}>
            {c.gender} · {c.age} years old
          </Text>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.chipRow}>
        {c.specialties.map((s) => {
          const color = CHIP_COLORS[s] ?? CHIP_COLORS.Stress;
          return (
            <View key={s} style={[styles.chip, { backgroundColor: color.bg }]}>
              <Text style={[styles.chipText, { color: color.text }]}>{s}</Text>
            </View>
          );
        })}
      </View>

      {/* Formats + price */}
      <View style={styles.priceRow}>
        <View style={styles.formatIcons}>
          {c.sessions.map((s) => (
            <Ionicons key={s.format} name={FORMAT_ICON[s.format]} size={18} color={GREEN} />
          ))}
        </View>
        <Text style={styles.price}>
          {c.sessions.length > 1 ? 'From ' : ''}
          {CURRENCY} {lowestFee}
          <Text style={styles.perSession}> /session</Text>
        </Text>
      </View>

      {/* Expanded profile */}
      {open && (
        <View style={styles.details}>
          <Text style={styles.detailsHeading}>About</Text>
          <Text style={styles.detailsText}>{c.about}</Text>

          <Text style={[styles.detailsHeading, { marginTop: 14 }]}>Sessions & fees</Text>
          {c.sessions.map((s) => (
            <View key={s.format} style={styles.feeLine}>
              <View style={styles.feeLineLeft}>
                <Ionicons name={FORMAT_ICON[s.format]} size={16} color={GREEN} />
                <Text style={styles.detailsText}>{FORMAT_LABEL[s.format]}</Text>
              </View>
              <Text style={styles.feeValue}>
                {CURRENCY} {s.fee}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          <Text style={styles.profileButtonText}>{open ? 'Hide Profile' : 'View Profile'}</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push(`/student/appointments?counselorId=${encodeURIComponent(c.id)}` as Href)
          }
          style={({ pressed }) => [styles.bookButton, pressed && styles.pressed]}
        >
          <Text style={styles.bookButtonText}>Book</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { paddingHorizontal: 20 },

  backButton: { alignSelf: 'flex-start', marginBottom: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagText: { color: GREEN, fontSize: 14, fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginTop: 6 },
  subtitle: { fontSize: 15, color: '#4B5563', marginTop: 6, lineHeight: 21 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginTop: 18,
  },
  searchInput: { flex: 1, fontSize: 16, color: NAVY, paddingVertical: 12 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#374151', letterSpacing: 0.5 },
  sectionCount: { fontSize: 12, fontWeight: '600', color: GREEN },

  filterRow: { gap: 10, paddingRight: 20 },
  filterChip: {
    backgroundColor: '#FDE3DC',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  filterChipSelected: { backgroundColor: GREEN },
  filterText: { fontSize: 15, fontWeight: '600', color: '#9A3B2A' },
  filterTextSelected: { color: '#FFFFFF' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 66, height: 66, borderRadius: 16 },
  avatarFallback: { backgroundColor: '#D5F5E8', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 22, fontWeight: '700', color: GREEN },
  info: { flex: 1 },
  name: { fontSize: 19, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 3 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { fontSize: 13, fontWeight: '500' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F1EC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  formatIcons: { flexDirection: 'row', gap: 12 },
  price: { fontSize: 17, fontWeight: '800', color: '#111827' },
  perSession: { fontSize: 12, fontWeight: '400', color: '#6B7280' },

  details: { marginTop: 14 },
  detailsHeading: { fontSize: 14, fontWeight: '700', color: NAVY, marginBottom: 6 },
  detailsText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  feeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  feeLineLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feeValue: { fontSize: 14, fontWeight: '700', color: NAVY },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  profileButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9DEFB',
    borderRadius: 28,
    paddingVertical: 15,
  },
  profileButtonText: { fontSize: 16, fontWeight: '500', color: '#4B3A78' },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: GREEN,
    borderRadius: 28,
    paddingVertical: 15,
  },
  bookButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  pressed: { opacity: 0.85 },

  empty: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: NAVY, marginTop: 6 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 14,
  },
  emptyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});