import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

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

export async function removeCounselor(id: string) {
  await ready;
  counselors = counselors.filter((c) => c.id !== id);
  emit();
  await persist();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => counselors;

export function useCounselors(): Counselor[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}