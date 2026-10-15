import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export type SessionKey = 'video' | 'audio' | 'office';
export type Gender = 'Male' | 'Female';

export type Counselor = {
  id: string;
  photoUri: string | null;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  about: string;
  specialties: string[];
  sessions: { format: SessionKey; fee: number }[];
};

const STORAGE_KEY = 'luma.counselors.v1';

let counselors: Counselor[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const persist = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(counselors));
  } catch (error) {
    console.warn('Could not save counselors', error);
  }
};

// Load saved counselors once when the app starts
const ready = (async () => {
  if (Platform.OS === 'web' && typeof window === 'undefined') return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: Counselor[] = JSON.parse(raw);
      const savedIds = new Set(saved.map((c) => c.id));
      counselors = [...counselors.filter((c) => !savedIds.has(c.id)), ...saved];
      emit();
    }
  } catch (error) {
    console.warn('Could not load counselors', error);
  }
})();

export async function addCounselor(data: Omit<Counselor, 'id'>): Promise<Counselor> {
  await ready;
  const counselor: Counselor = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  counselors = [counselor, ...counselors];
  emit();
  await persist();
  return counselor;
}

export async function updateCounselor(
  id: string,
  data: Omit<Counselor, 'id'>
): Promise<Counselor | null> {
  await ready;
  const existing = counselors.find((c) => c.id === id);
  if (!existing) return null;

  const updated: Counselor = { ...data, id };
  // New array so every screen using useCounselors() re-renders
  counselors = counselors.map((c) => (c.id === id ? updated : c));
  emit();
  await persist();
  return updated;
}

export async function removeCounselor(id: string) {
  await ready;
  counselors = counselors.filter((c) => c.id !== id);
  emit();
  await persist();
}

export function getCounselor(id: string): Counselor | undefined {
  return counselors.find((c) => c.id === id);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => counselors;
const serverSnapshot: Counselor[] = [];
const getServerSnapshot = () => serverSnapshot;

export function useCounselors(): Counselor[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}