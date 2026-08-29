import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Safe environment accessor
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || defaultValue;
    }
  } catch {
    // fallback
  }
  return defaultValue;
};

// Fallback config from environment variables or active project configuration
const firebaseConfig = {
  apiKey:
    getEnvVar('VITE_FIREBASE_API_KEY') ||
    'AIzaSyBVne1yiBPm_vJLwAA-RZR43cT2nPZSdOo',
  authDomain:
    getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') ||
    'crafty-guard-vq6d2.firebaseapp.com',
  projectId:
    getEnvVar('VITE_FIREBASE_PROJECT_ID') ||
    'crafty-guard-vq6d2',
  storageBucket:
    getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') ||
    'crafty-guard-vq6d2.firebasestorage.app',
  messagingSenderId:
    getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') ||
    '156795143015',
  appId:
    getEnvVar('VITE_FIREBASE_APP_ID') ||
    '1:156795143015:web:e02972ec7bfe7cfcc7e5c2',
};

const databaseId =
  getEnvVar('VITE_FIREBASE_DATABASE_ID') ||
  'ai-studio-sayvi-f7be4159-b22a-4ff8-bf1e-7529d772930f';

// Initialize Firebase App
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Initialize Storage
export const storage: FirebaseStorage = getStorage(app);

// Connectivity validation
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_health', 'ping'));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
      return false;
    }
    return true;
  }
}
