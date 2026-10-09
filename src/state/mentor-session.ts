import { auth, db, ensureUser } from '@/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useSyncExternalStore } from 'react';

export type Referral = { id: string; student: string; reason: string; service: string; priority: string; recipient: string; createdAt: string };
export type MentorProfile = { name: string; id: string; sex: string };

const EMPTY: MentorProfile = { name: '', id: '', sex: '' };
const KEY = 'mentor-profile';

let state = { profile: EMPTY, referrals: [] as Referral[] };
const listeners = new Set<() => void>();
function publish() { listeners.forEach(listener => listener()); }

export function useMentorSession() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state, () => state);
}

export function isMentorProfileComplete(p: MentorProfile) {
  return p.name.trim() !== '' && p.id.trim() !== '' && p.sex.trim() !== '';
}

// Call once when the app starts
export async function loadMentorProfile() {
  try {
    // 1) Fast: from the phone
    const cached = await AsyncStorage.getItem(KEY);
    if (cached) {
      state = { ...state, profile: JSON.parse(cached) };
      publish();
    }
    // 2) From Firebase (updates the cache)
    const user = await ensureUser();
    const snap = await getDoc(doc(db, 'mentors', user.uid));
    if (snap.exists()) {
      const d = snap.data();
      const profile = { name: d.name ?? '', id: d.id ?? '', sex: d.sex ?? '' };
      state = { ...state, profile };
      await AsyncStorage.setItem(KEY, JSON.stringify(profile));
      publish();
    }
  } catch (e) {
    console.warn('Could not load mentor profile', e); // offline: the cached one is still used
  }
}

export async function saveProfile(profile: MentorProfile) {
  state = { ...state, profile };
  publish();
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  try {
    const user = await ensureUser();
    await setDoc(doc(db, 'mentors', user.uid), { ...profile, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn('Could not save mentor profile to Firebase', e);
  }
}

export function addReferral(details: Omit<Referral, 'id' | 'createdAt'>) {
  const referral = { ...details, id: Date.now().toString() + Math.random().toString(36).slice(2), createdAt: new Date().toISOString() };
  state = { ...state, referrals: [referral, ...state.referrals] }; publish(); return referral.id;
}

export async function clearMentorSession() {
  state = { profile: EMPTY, referrals: [] };
  publish();
  await AsyncStorage.removeItem(KEY);
  try { await signOut(auth); } catch {}
}