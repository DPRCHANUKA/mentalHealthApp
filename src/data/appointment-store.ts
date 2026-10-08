import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { SessionKey } from '@/data/counselor-store';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Appointment = {
  id: string;
  counselorId: string;
  counselorName: string;
  format: SessionKey;
  date: string; // yyyy-mm-dd
  time: string; // e.g. "03:30 PM"
  startsAt: number; // timestamp, used for sorting
  fee: number;
  concerns: string[];
  note: string;
  paymentMethod: string;
  status: 'confirmed' | 'cancelled';
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/* Time slots and date helpers (shared by the booking + payment pages) */
/* ------------------------------------------------------------------ */

export type Slot = { label: string; hour: number; minute: number };

export const SLOT_GROUPS: {
  id: string;
  title: string;
  icon: 'sunny-outline' | 'partly-sunny-outline' | 'moon-outline';
  slots: Slot[];
}[] = [
  {
    id: 'morning',
    title: 'Morning Slots',
    icon: 'sunny-outline',
    slots: [
      { label: '09:00 AM', hour: 9, minute: 0 },
      { label: '10:30 AM', hour: 10, minute: 30 },
      { label: '11:30 AM', hour: 11, minute: 30 },
    ],
  },
  {
    id: 'afternoon',
    title: 'Afternoon Slots',
    icon: 'partly-sunny-outline',
    slots: [
      { label: '02:00 PM', hour: 14, minute: 0 },
      { label: '03:30 PM', hour: 15, minute: 30 },
      { label: '04:30 PM', hour: 16, minute: 30 },
    ],
  },
  {
    id: 'evening',
    title: 'Evening Slots',
    icon: 'moon-outline',
    slots: [
      { label: '06:00 PM', hour: 18, minute: 0 },
      { label: '07:00 PM', hour: 19, minute: 0 },
      { label: '08:00 PM', hour: 20, minute: 0 },
    ],
  },
];

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
export const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatLongDate = (key: string) => {
  const d = fromDateKey(key);
  return `${DAY_LONG[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const formatShortDate = (key: string) => {
  const d = fromDateKey(key);
  return `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
};

export const findSlot = (label: string): Slot | undefined => {
  for (const group of SLOT_GROUPS) {
    const slot = group.slots.find((s) => s.label === label);
    if (slot) return slot;
  }
  return undefined;
};

export const isSlotPast = (dateKey: string, slot: Slot) => {
  const d = fromDateKey(dateKey);
  d.setHours(slot.hour, slot.minute, 0, 0);
  return d.getTime() <= Date.now();
};

export const isSlotTaken = (
  list: Appointment[],
  counselorId: string,
  date: string,
  time: string
) =>
  list.some(
    (a) =>
      a.status === 'confirmed' &&
      a.counselorId === counselorId &&
      a.date === date &&
      a.time === time
  );

/* ------------------------------------------------------------------ */
/* Store (saved on the phone with AsyncStorage)                        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'luma.appointments.v1';

let appointments: Appointment[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const persist = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.warn('Could not save appointments', error);
  }
};

const ready = (async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: Appointment[] = JSON.parse(raw);
      const savedIds = new Set(saved.map((a) => a.id));
      appointments = [...appointments.filter((a) => !savedIds.has(a.id)), ...saved];
      emit();
    }
  } catch (error) {
    console.warn('Could not load appointments', error);
  }
})();

export async function addAppointment(
  data: Omit<Appointment, 'id' | 'startsAt' | 'status' | 'createdAt'>
): Promise<Appointment> {
  await ready;

  const start = fromDateKey(data.date);
  const slot = findSlot(data.time);
  if (slot) start.setHours(slot.hour, slot.minute, 0, 0);

  const appointment: Appointment = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startsAt: start.getTime(),
    status: 'confirmed',
    createdAt: Date.now(),
  };

  appointments = [appointment, ...appointments];
  emit();
  await persist();
  return appointment;
}

export async function cancelAppointment(id: string) {
  await ready;
  appointments = appointments.map((a) =>
    a.id === id ? { ...a, status: 'cancelled' as const } : a
  );
  emit();
  await persist();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => appointments;

export function useAppointments(): Appointment[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}