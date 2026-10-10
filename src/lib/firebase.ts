import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  type Auth,
} from 'firebase/auth';
// @ts-ignore: exists at runtime in React Native, but missing from the type definitions
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Uses .env when it exists (local development).
// Falls back to the project values so the APK build works without .env.
// A Firebase web key is not a secret: your Firestore rules protect the data.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyB2Q-ThotZY9KCTMzGoQP0i07on8lxh9SY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'luma-164fb.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'luma-164fb',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'luma-164fb.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '154843890898',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:154843890898:web:0f6a40b654e51d4035990b',
};

const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

let authInstance: Auth;
if (isNewApp) {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  authInstance = getAuth(app); // fast refresh: already initialised
}

export const auth = authInstance;
export const db = getFirestore(app);

export async function ensureUser() {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}