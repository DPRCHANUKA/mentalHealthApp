import type { MoodId } from '@/constants/moods';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'luma.moodCheckIns';

export type CheckIn = {
  id: string;
  mood: MoodId;
  note: string;
  createdAt: string; // ISO date
};

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

export async function getLatestCheckIn(): Promise<CheckIn | undefined> {
  const list = await getCheckIns();
  return list[0];
}