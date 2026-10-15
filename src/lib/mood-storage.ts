import type { MoodId } from '@/constants/moods';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'luma.moodCheckIns';

// A mood can be changed for 24 hours after the check-in was made
export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export type CheckIn = {
  id: string;
  mood: MoodId;
  note: string;
  createdAt: string; // ISO date
  editedAt?: string; // set when the mood was changed
};

export function canEditCheckIn(c: CheckIn, now = Date.now()) {
  return now - new Date(c.createdAt).getTime() < EDIT_WINDOW_MS;
}

export function editTimeLeftMs(c: CheckIn, now = Date.now()) {
  return Math.max(0, EDIT_WINDOW_MS - (now - new Date(c.createdAt).getTime()));
}

// Newest first
export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list: CheckIn[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function saveCheckIn(mood: MoodId, note: string): Promise<CheckIn> {
  const entry: CheckIn = {
    id: String(Date.now()),
    mood,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  };

  const list = await getCheckIns();
  await AsyncStorage.setItem(KEY, JSON.stringify([entry, ...list].slice(0, 200)));
  return entry;
}

// Change the mood of an existing check-in (only within 24 hours).
// Returns true if it was changed.
export async function updateCheckInMood(id: string, mood: MoodId): Promise<boolean> {
  try {
    const list = await getCheckIns();
    const entry = list.find((c) => c.id === id);

    if (!entry || !canEditCheckIn(entry)) return false;

    const updated = list.map((c) =>
      c.id === id ? { ...c, mood, editedAt: new Date().toISOString() } : c
    );
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function getLatestCheckIn(): Promise<CheckIn | undefined> {
  const list = await getCheckIns();
  return list[0];
}

export async function clearCheckIns() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}