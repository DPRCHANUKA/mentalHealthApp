import { useSyncExternalStore } from 'react';

type Profile = { name: string; id: string; sex: string };
let profile: Profile = { name: 'Alex', id: '', sex: '' };
const listeners = new Set<() => void>();
export function useStudentProfile() {
  return useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, () => profile, () => profile);
}
export function saveStudentProfile(value: Profile) {
  profile = value;
  listeners.forEach(listener => listener());
}
export function clearStudentProfile() {
  saveStudentProfile({ name: 'Alex', id: '', sex: '' });
}
