import { useSyncExternalStore } from 'react';

export type Referral = { id: string; student: string; reason: string; service: string; priority: string; recipient: string; createdAt: string };
let state = { profile: { name: 'Alex', id: '', sex: '' }, referrals: [] as Referral[] };
const listeners = new Set<() => void>();
function publish() { listeners.forEach(listener => listener()); }
export function useMentorSession() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state, () => state);
}
export function saveProfile(profile: typeof state.profile) { state = { ...state, profile }; publish(); }
export function addReferral(details: Omit<Referral, 'id' | 'createdAt'>) {
  const referral = { ...details, id: Date.now().toString() + Math.random().toString(36).slice(2), createdAt: new Date().toISOString() };
  state = { ...state, referrals: [referral, ...state.referrals] }; publish(); return referral.id;
}
export function clearMentorSession() { state = { profile: { name: 'Alex', id: '', sex: '' }, referrals: [] }; publish(); }

