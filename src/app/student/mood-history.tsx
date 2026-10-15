import { getMood, MOODS, type Mood, type MoodId } from '@/constants/moods'; // ← new (MOODS, MoodId)
import { Colors } from '@/constants/theme';
import {
  canEditCheckIn, // ← new
  editTimeLeftMs, // ← new
  getCheckIns,
  updateCheckInMood, // ← new
  type CheckIn,
} from '@/lib/mood-storage';
import { Ionicons } from '@expo/vector-icons'; // ← new
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert, // ← new
  Animated,
  Easing,
  Modal, // ← new
  Pressable, // ← new
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BAR_MAX_HEIGHT = 140;

type MoodCount = { mood: Mood; count: number };

type DayData = {
  key: string;
  label: string;
  total: number;
  avgValue: number;
  breakdown: MoodCount[]; // all moods of that day, most frequent first
};

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function relativeDay(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (dayKey(date) === dayKey(today)) return 'Today';
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
  return DAYS[date.getDay()];
}

// e.g. "9:41 AM"
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// e.g. "5h 20m left" / "42m left" ← new
function formatTimeLeft(ms: number) {
  const totalMinutes = Math.max(1, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

// Bar that grows from 0 to its height every time `replayKey` changes
function AnimatedBar({
  height,
  delay,
  replayKey,
  selected,
  children,
}: {
  height: number;
  delay: number;
  replayKey: number;
  selected: boolean;
  children: ReactNode;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: height,
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // height can't use the native driver
    }).start();
  }, [height, replayKey, delay, anim]);

  return (
    <Animated.View style={[styles.bar, { height: anim }, selected && styles.barSelected]}>
      {children}
    </Animated.View>
  );
}

// One mood row: slides in, and its percentage counts up from 0
function LegendRow({
  item,
  percent,
  index,
}: {
  item: MoodCount;
  percent: number;
  index: number;
}) {
  const appear = useRef(new Animated.Value(0)).current;
  const count = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const delay = 300 + index * 110;
    const id = count.addListener(({ value }) => setDisplay(Math.round(value)));

    Animated.parallel([
      Animated.timing(appear, {
        toValue: 1,
        duration: 400,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(count, {
        toValue: percent,
        duration: 800,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    return () => count.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.legendRow,
        {
          opacity: appear,
          transform: [
            {
              translateX: appear.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.legendDot, { backgroundColor: item.mood.color }]} />
      <Text style={styles.legendEmoji}>{item.mood.emoji}</Text>
      <Text style={styles.legendLabel}>{item.mood.label}</Text>
      <Text style={[styles.legendPercent, { color: item.mood.color }]}>{display}%</Text>
    </Animated.View>
  );
}

// Percentage card: pops in, color strip fills, rows slide in one by one.
// It is mounted with key={day.key}, so it replays for every tapped bar.
function BreakdownCard({ day }: { day: DayData }) {
  const enter = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enter, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fill, {
        toValue: 1,
        duration: 800,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width can't use the native driver
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.breakdownCard,
        {
          opacity: enter.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateY: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: enter.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.breakdownTitle}>
        {day.label}: {day.total} {day.total === 1 ? 'check-in' : 'check-ins'}
      </Text>
      <Text style={styles.breakdownSub}>Mood split for this day</Text>

      {/* Stacked color bar that fills from left to right */}
      <View style={styles.stack}>
        <Animated.View
          style={{
            flexDirection: 'row',
            height: '100%',
            width: fill.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        >
          {day.breakdown.map((item) => (
            <View
              key={item.mood.label}
              style={{ flex: item.count, backgroundColor: item.mood.color }}
            />
          ))}
        </Animated.View>
      </View>

      {/* Each mood with its percentage */}
      {day.breakdown.map((item, index) => (
        <LegendRow
          key={item.mood.label}
          item={item}
          index={index}
          percent={Math.round((item.count / day.total) * 100)}
        />
      ))}
    </Animated.View>
  );
}

export default function MoodHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // Change-mood sheet ← new
  const [editing, setEditing] = useState<CheckIn | null>(null);
  const [pickedMood, setPickedMood] = useState<MoodId | null>(null);
  const [saving, setSaving] = useState(false);

  // Reload every time the screen is opened, and replay the bar animation
  useFocusEffect(
    useCallback(() => {
      getCheckIns().then((list) => {
        setCheckIns(list);
        setLoaded(true);
        setAnimKey((k) => k + 1);
      });
    }, [])
  );

  // Last 7 days, with ALL check-ins of each day
  const week: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = dayKey(date);

    const counts = new Map<string, MoodCount>();
    let valueSum = 0;
    let total = 0;

    checkIns.forEach((c) => {
      if (dayKey(new Date(c.createdAt)) !== key) return;
      const mood = getMood(c.mood) as Mood | undefined;
      if (!mood) return;

      total += 1;
      valueSum += mood.value;

      const existing = counts.get(mood.label);
      if (existing) existing.count += 1;
      else counts.set(mood.label, { mood, count: 1 });
    });

    const breakdown = Array.from(counts.values()).sort((a, b) => b.count - a.count);

    return {
      key,
      label: DAYS[date.getDay()],
      total,
      avgValue: total > 0 ? valueSum / total : 0,
      breakdown,
    };
  });

  const selectedDay = week.find((d) => d.key === selectedKey);

  const toggleBar = (key: string, hasMood: boolean) => {
    if (!hasMood) return;
    setSelectedKey((prev) => (prev === key ? null : key));
  };

  const recent = checkIns.slice(0, 7);
  const isEmpty = loaded && checkIns.length === 0;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/student/student-home');
  };

  // ← new: open / save / close the change-mood sheet
  const openEdit = (entry: CheckIn) => {
    setEditing(entry);
    setPickedMood(entry.mood);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setPickedMood(null);
  };

  const handleSave = async () => {
    if (!editing || !pickedMood || saving) return;

    setSaving(true);
    const ok = await updateCheckInMood(editing.id, pickedMood);
    setSaving(false);

    if (!ok) {
      Alert.alert(
        'Too late to change',
        'A mood can only be changed within 24 hours of checking in.'
      );
    }

    // Refresh the list and replay the chart animation
    const list = await getCheckIns();
    setCheckIns(list);
    setAnimKey((k) => k + 1);
    setEditing(null);
    setPickedMood(null);
  };

  const now = Date.now();
  const unchanged = !editing || pickedMood === editing.mood;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mood History</Text>
        </View>

        {isEmpty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No check-ins yet</Text>
            <Text style={styles.emptyText}>
              Your moods will appear here after your first check-in.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.9}
              onPress={() => router.push('/student/check-in' as Href)}
            >
              <Text style={styles.emptyButtonText}>Check in now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Weekly trend */}
            <Text style={styles.sectionTitle}>Your weekly Trend</Text>

            <View style={styles.chartCard}>
              {week.map((day, index) => {
                const hasMood = day.total > 0;
                const isSelected = selectedKey === day.key;
                const dimmed = selectedKey !== null && !isSelected;
                const topMood = day.breakdown[0]?.mood;

                return (
                  <TouchableOpacity
                    key={day.key}
                    activeOpacity={0.8}
                    disabled={!hasMood}
                    onPress={() => toggleBar(day.key, hasMood)}
                    style={[styles.barColumn, dimmed && styles.barDimmed]}
                  >
                    <Text style={styles.barEmoji}>{topMood?.emoji ?? ' '}</Text>

                    {hasMood ? (
                      <AnimatedBar
                        height={(day.avgValue / 5) * BAR_MAX_HEIGHT}
                        delay={index * 80}
                        replayKey={animKey}
                        selected={isSelected}
                      >
                        {/* One colored segment per mood of that day */}
                        {day.breakdown.map((item) => (
                          <View
                            key={item.mood.label}
                            style={{ flex: item.count, backgroundColor: item.mood.color }}
                          />
                        ))}
                        <View style={styles.barShine} />
                      </AnimatedBar>
                    ) : (
                      <View style={styles.barEmpty} />
                    )}

                    <Text style={styles.barDay}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Percentage breakdown of the tapped day (animated) */}
            {selectedDay && selectedDay.total > 0 ? (
              <BreakdownCard key={selectedDay.key} day={selectedDay} />
            ) : (
              <Text style={styles.hint}>Tap a bar to see your mood percentages</Text>
            )}

            {/* Recent check-ins */}
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
              Recent Check-ins
            </Text>

            <View style={styles.list}>
              {recent.map((entry, index) => {
                const mood = getMood(entry.mood);
                if (!mood) return null;

                const editable = canEditCheckIn(entry, now); // ← new

                return (
                  <TouchableOpacity
                    key={entry.id}
                    activeOpacity={editable ? 0.7 : 1}
                    disabled={!editable}
                    onPress={() => openEdit(entry)}
                    style={[styles.row, index === recent.length - 1 && styles.rowLast]}
                  >
                    <Text style={styles.rowDay}>{relativeDay(entry.createdAt)}</Text>
                    <Text style={styles.rowEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.rowLabel, { color: mood.color }]}>
                      {mood.label}
                      {entry.editedAt ? <Text style={styles.edited}> · edited</Text> : null}
                    </Text>
                    <Text style={styles.rowTime}>{formatTime(entry.createdAt)}</Text>

                    {/* ← new: pencil if changeable, lock if not */}
                    {editable ? (
                      <View style={styles.editChip}>
                        <Ionicons name="pencil" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.lockChip}>
                        <Ionicons
                          name="lock-closed"
                          size={13}
                          color={Colors.light.textSecondary}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.footnote}>
              You can change a mood within 24 hours of checking in.
            </Text>
          </>
        )}
      </ScrollView>

      {/* ← new: change-mood sheet */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <Pressable style={styles.backdrop} onPress={closeEdit} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.grabber} />

          <Text style={styles.sheetTitle}>Change your mood</Text>
          {editing && (
            <Text style={styles.sheetSub}>
              {formatTimeLeft(editTimeLeftMs(editing))} to change this check-in
            </Text>
          )}

          <View style={styles.pickRow}>
            {MOODS.map((mood) => {
              const isPicked = pickedMood === mood.id;

              return (
                <TouchableOpacity
                  key={mood.id}
                  style={styles.pickItem}
                  activeOpacity={0.8}
                  onPress={() => setPickedMood(mood.id)}
                >
                  <View style={[styles.pickCircle, isPicked && styles.pickCircleSelected]}>
                    <Text style={styles.pickEmoji}>{mood.emoji}</Text>
                  </View>
                  <Text style={[styles.pickLabel, isPicked && styles.pickLabelSelected]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={unchanged || saving}
            onPress={handleSave}
            style={[styles.saveButton, (unchanged || saving) && styles.saveDisabled]}
          >
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save change'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={closeEdit} style={styles.cancelButton} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backArrow: {
    fontSize: 32,
    color: Colors.light.textSecondary,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.primary,
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  chartCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 40,
  },

  barDimmed: {
    opacity: 0.4,
  },

  barEmoji: {
    fontSize: 16,
    marginBottom: 6,
    height: 22,
  },

  // Column direction so the mood segments stack vertically
  bar: {
    width: 28,
    borderRadius: 9,
    overflow: 'hidden',
    flexDirection: 'column',
  },

  barSelected: {
    width: 32,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },

  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  barEmpty: {
    width: 28,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundSelected,
  },

  barDay: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },

  hint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  breakdownCard: {
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  breakdownTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  breakdownSub: {
    marginTop: 2,
    marginBottom: 14,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  stack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: Colors.light.backgroundSelected,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  legendEmoji: {
    marginLeft: 10,
    fontSize: 18,
  },

  legendLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  legendPercent: {
    fontSize: 15,
    fontWeight: '700',
  },

  list: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    shadowColor: '#1F2D3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.textSecondary + '55',
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  rowDay: {
    width: 88,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  rowEmoji: {
    width: 44,
    fontSize: 22,
  },

  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  edited: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.light.textSecondary,
  },

  rowTime: {
    marginLeft: 8,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  // ← new
  editChip: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockChip: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footnote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  /* Change-mood sheet */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,30,40,0.45)',
  },

  sheet: {
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
  },

  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.light.backgroundSelected,
  },

  sheetTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
    textAlign: 'center',
  },

  sheetSub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  pickItem: {
    alignItems: 'center',
    width: 60,
  },

  pickCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  pickCircleSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent + '26',
    transform: [{ scale: 1.1 }],
  },

  pickEmoji: {
    fontSize: 28,
  },

  pickLabel: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },

  pickLabelSelected: {
    fontWeight: '700',
    color: Colors.light.primary,
  },

  saveButton: {
    marginTop: 28,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveDisabled: {
    opacity: 0.4,
  },

  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cancelButton: {
    marginTop: 14,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },

  empty: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 12,
  },

  emptyEmoji: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },

  emptyButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
  },

  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});