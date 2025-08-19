import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD9f7eUJMyf7RC136rr4EOMSD30MvbQJ4U",
  authDomain: "radha-counter-e4240.firebaseapp.com",
  projectId: "radha-counter-e4240",
  storageBucket: "radha-counter-e4240.firebasestorage.app",
  messagingSenderId: "780124704663",
  appId: "1:780124704663:web:b5d016a4aa01ed42553ed2",
  measurementId: "G-JJSZ4QN7PR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enable network for Firestore
try {
  enableNetwork(db);
} catch (error) {
  console.log('Network enable error:', error);
}

export const analytics = getAnalytics(app);