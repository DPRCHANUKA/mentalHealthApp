import { auth, db, ensureUser } from '@/lib/firebase';
import { isProfileValid, normalizeProfile, validateProfile } from '@/lib/profile-validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

export type Referral = {
  id: string;
  student: string;
  reason: string;
  service: string;
  priority: string;
  recipient: string;
  createdAt: string;
  mentorName: string;
  mentorId: string;
};
export type MentorProfile = { name: string; id: string; sex: string };

const EMPTY: MentorProfile = { name: '', id: '', sex: '' };
const PROFILE_KEY = 'mentor-profile';
const REFERRALS_KEY = 'mentor-referrals';

let state = { profile: EMPTY, referrals: [] as Referral[] };
const listeners = new Set<() => void>();
function publish() { listeners.forEach(listener => listener()); }

export function useMentorSession() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state, () => state);
}

// Mentor rules: LI + digits, name like KARUNARATHNE D.P.G, gender Male/Female/None
export function isMentorProfileComplete(p: MentorProfile) {
  return isProfileValid(p, 'mentor');
}

function sortNewestFirst(list: Referral[]) {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Call once when the app starts
export async function loadMentorProfile() {
  try {
    // 1) Fast: from the phone
    const [cachedProfile, cachedReferrals] = await Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(REFERRALS_KEY),
    ]);
    state = {
      profile: cachedProfile ? JSON.parse(cachedProfile) : state.profile,
      referrals: cachedReferrals ? JSON.parse(cachedReferrals) : state.referrals,
    };
    publish();

    // 2) From Firebase (updates the cache)
    const user = await ensureUser();

    const snap = await getDoc(doc(db, 'mentors', user.uid));
    if (snap.exists()) {
      const d = snap.data();
      const profile = { name: d.name ?? '', id: d.id ?? '', sex: d.sex ?? '' };
      state = { ...state, profile };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      publish();
    }

    const refs = await getDocs(query(collection(db, 'referrals'), where('mentorUid', '==', user.uid)));
    const referrals = sortNewestFirst(
      refs.docs.map(item => {
        const d = item.data();
        return {
          id: item.id,
          student: d.student ?? '',
          reason: d.reason ?? '',
          service: d.service ?? '',
          priority: d.priority ?? '',
          recipient: d.recipient ?? '',
          createdAt: d.createdAt ?? '',
          mentorName: d.mentorName ?? '',
          mentorId: d.mentorId ?? '',
        } as Referral;
      })
    );
    state = { ...state, referrals };
    await AsyncStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
    publish();
  } catch (e) {
    console.warn('Could not load mentor data', e); // offline: the cached data is still used
  }
}

export async function saveProfile(input: MentorProfile) {
  // Validate FIRST. If anything is wrong, show the problems and save nothing.
  const errors = validateProfile(input, 'mentor');
  if (Object.keys(errors).length > 0) {
    Alert.alert('Check your details', Object.values(errors).join('\n\n'));
    return;
  }

  const profile = normalizeProfile(input);
  state = { ...state, profile };
  publish();
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  try {
    const user = await ensureUser();
    await setDoc(doc(db, 'mentors', user.uid), { ...profile, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn('Could not save mentor profile to Firebase', e);
  }
}

export function addReferral(details: Omit<Referral, 'id' | 'createdAt' | 'mentorName' | 'mentorId'>) {
  const referral: Referral = {
    ...details,
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
    mentorName: state.profile.name,
    mentorId: state.profile.id,
  };
  state = { ...state, referrals: [referral, ...state.referrals] };
  publish();
  AsyncStorage.setItem(REFERRALS_KEY, JSON.stringify(state.referrals)).catch(() => {});

  // Save to Firebase in the background
  (async () => {
    try {
      const user = await ensureUser();
      await setDoc(doc(db, 'referrals', referral.id), { ...referral, mentorUid: user.uid });
    } catch (e) {
      console.warn('Could not save referral to Firebase', e);
    }
  })();

  return referral.id;
}

export async function clearMentorSession() {
  state = { profile: EMPTY, referrals: [] };
  publish();
  await AsyncStorage.multiRemove([PROFILE_KEY, REFERRALS_KEY]);
  try { await signOut(auth); } catch {}
}