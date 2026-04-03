import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnJqrW8zZU3FAgTYc9fSJIqHC2PMKYUY8",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "englishtalk-d01a6.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "englishtalk-d01a6",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "englishtalk-d01a6.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "667382669757",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:667382669757:web:6b68179245bbc34634f2d4",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-F74KNBPGB5"
};

let firebaseApp;
let firestoreDb;

export function hasFirebaseConfig() {
  // Use Firebase if projectId is configured, as requested by the user. 
  // User may need to provide actual apiKey if strictly required.
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
    firestoreDb = getFirestore(app, "englishtalk");
  }
  return firestoreDb;
}
