import { auth, db, ensureUser } from '@/lib/firebase';
import { clearCheckIns } from '@/lib/mood-storage';
import { isProfileValid, normalizeProfile, validateProfile } from '@/lib/profile-validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser, signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

export type Profile = { name: string; id: string; sex: string };

const EMPTY: Profile = { name: '', id: '', sex: '' };
const KEY = 'student-profile';

let profile: Profile = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useStudentProfile() {
  return useSyncExternalStore(subscribe, () => profile, () => profile);
}
export function useProfileLoaded() {
  return useSyncExternalStore(subscribe, () => loaded, () => loaded);
}

// Student rules: 2 letters + 8 digits (IT23728462), name like KARUNARATHNE D.P.G
export function isProfileComplete(p: Profile) {
  return isProfileValid(p, 'student');
}

// Call once when the app starts
export async function loadStudentProfile() {
  try {
    // 1) Fast: from the phone
    const cached = await AsyncStorage.getItem(KEY);
    if (cached) {
      profile = JSON.parse(cached);
      emit();
    }
    // 2) From Firebase (updates the cache)
    const user = await ensureUser();
    const snap = await getDoc(doc(db, 'students', user.uid));
    if (snap.exists()) {
      const d = snap.data();
      profile = { name: d.name ?? '', id: d.id ?? '', sex: d.sex ?? '' };
      await AsyncStorage.setItem(KEY, JSON.stringify(profile));
    }
  } catch (e) {
    console.warn('Could not load profile', e); // offline: the cached one is still used
  } finally {
    loaded = true;
    emit();
  }
}

export async function saveStudentProfile(input: Profile) {
  // Validate FIRST. If anything is wrong, show the problems and save nothing.
  const errors = validateProfile(input, 'student');
  if (Object.keys(errors).length > 0) {
    Alert.alert('Check your details', Object.values(errors).join('\n\n'));
    return;
  }

  const value = normalizeProfile(input);
  profile = value;
  emit();
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
  try {
    const user = await ensureUser();
    await setDoc(doc(db, 'students', user.uid), { ...value, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn('Could not save to Firebase', e);
  }
}

// Log out: clears this phone only, the data stays on the server
export async function clearStudentProfile() {
  profile = EMPTY;
  emit();
  await AsyncStorage.removeItem(KEY);
  try { await signOut(auth); } catch {}
}

// Delete: removes the profile from the server AND this phone.
// Returns true only if the server delete worked.
export async function deleteStudentProfile(): Promise<boolean> {
  try {
    const user = await ensureUser();

    // 1) Delete the server data first (needs the signed-in user)
    await deleteDoc(doc(db, 'students', user.uid));

    // 2) Remove the anonymous account; if that is refused, just sign out
    try {
      await deleteUser(user);
    } catch {
      try { await signOut(auth); } catch {}
    }
  } catch (e) {
    console.warn('Could not delete student profile', e);
    return false; // keep local data so the student can try again
  }

  // 3) Clear this phone
  profile = EMPTY;
  emit();
  await AsyncStorage.removeItem(KEY);
  await clearCheckIns();
  return true;
}