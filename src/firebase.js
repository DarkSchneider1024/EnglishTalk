import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBGheuvbR1NKe6PA0pLrdeJB0kyr5mNSxQ",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "eatdinner-bb986.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "eatdinner-bb986",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "eatdinner-bb986.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "503284615803",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:503284615803:web:455a12f1c5d2438fa5f0de",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LFQZ1NFR9H"
};

let firebaseApp;
let firestoreDb;
let firebaseFunctions;

export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.projectId);
}

export function getFirebaseConfigSummary() {
  if (!hasFirebaseConfig()) {
    return "missing";
  }
  return firebaseConfig.projectId;
}

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    return null;
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export function getDb() {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!firestoreDb) {
    firestoreDb = getFirestore(app);
  }
  return firestoreDb;
}

export function getFirebaseFunctions() {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!firebaseFunctions) {
    // 預設區域是 us-central1
    firebaseFunctions = getFunctions(app);
  }
  return firebaseFunctions;
}
