import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Web app's Firebase configuration from environment / user credentials
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBrEMKudlUnN8iCfM7CUv9i8P2dLfPCHt4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cmcart-cm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cmcart-cm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cmcart-cm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "154594968096",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:154594968096:web:fd2e9802cf578ba3a27245",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KTS9PQ2HLN"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firebase Analytics (browser-only with support check)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('🔥 Firebase Analytics active for CMCart:', firebaseConfig.measurementId);
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported in this environment:', err);
  });
}

export default app;
