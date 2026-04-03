import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";
import { getDb, getFirebaseApp, getFirebaseConfigSummary, hasFirebaseConfig } from "./firebase";

const DEVICE_ID_KEY = "englishtalk.deviceId";
const PROFILE_KEY = "englishtalk.profile";
const MEMORY_KEY = "englishtalk.memory";
const CARDS_KEY = "englishtalk.cards";

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getLearnerId() {
  const app = getFirebaseApp();
  if (app) {
    const auth = getAuth(app);
    if (auth.currentUser) return auth.currentUser.uid;
  }
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const next = createId("learner");
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

export async function loadProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile) {
  const learnerId = await getLearnerId();
  const payload = { ...profile, learnerId, updatedAt: Date.now() };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, "learners", learnerId), payload, { merge: true });
    } catch (err) {
      console.warn("Firebase Profile Sync Error:", err.message);
    }
  }
  return payload;
}

export async function loadMemories() {
  const learnerId = await getLearnerId();
  const raw = await AsyncStorage.getItem(MEMORY_KEY);
  let localItems = raw ? JSON.parse(raw) : [];
  const db = getDb();

  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, "learners", learnerId, "memories"), orderBy("updatedAt", "desc"), limit(20)));
      const remoteItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      if (remoteItems.length > 0) {
        localItems = remoteItems;
        await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(remoteItems));
      } else {
        const remoteProfile = await getDoc(doc(db, "learners", learnerId));
        if (remoteProfile.exists()) {
          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(remoteProfile.data()));
        }
      }
    } catch (err) {
      console.warn("Firebase Memory Sync Error:", err.message);
    }
  }

  return localItems;
}

export async function saveMemory(memory) {
  const learnerId = await getLearnerId();
  const entry = { id: createId("memory"), learnerId, ...memory, updatedAt: Date.now() };
  const current = await loadMemories();
  const next = [entry, ...current].slice(0, 50);
  await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(next));
  const db = getDb();
  if (db) {
    try {
      await addDoc(collection(db, "learners", learnerId, "memories"), entry);
    } catch (err) {
      console.warn("Firebase Memory Add Error:", err.message);
    }
  }
  return next;
}

export async function loadCards() {
  const learnerId = await getLearnerId();
  const raw = await AsyncStorage.getItem(CARDS_KEY);
  let localItems = raw ? JSON.parse(raw) : [];
  const db = getDb();

  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, "learners", learnerId, "cards"), orderBy("updatedAt", "desc"), limit(100)));
      const remoteItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      if (remoteItems.length > 0) {
        localItems = remoteItems;
        await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(remoteItems));
      }
    } catch (err) {
      console.warn("Firebase Cards Sync Error:", err.message);
    }
  }

  return localItems;
}

export async function saveCard(card) {
  const learnerId = await getLearnerId();
  const entry = { id: createId("card"), learnerId, ...card, updatedAt: Date.now() };
  const current = await loadCards();
  const next = [entry, ...current].slice(0, 100);
  await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(next));
  const db = getDb();
  if (db) {
    try {
      await addDoc(collection(db, "learners", learnerId, "cards"), entry);
    } catch (err) {
      console.warn("Firebase Card Add Error:", err.message);
    }
  }
  return next;
}

export function getMemoryMode() {
  return hasFirebaseConfig() ? "firebase" : "local";
}

export function getMemoryStatusLabel() {
  return hasFirebaseConfig() ? `firebase:${getFirebaseConfigSummary()}` : "local-only";
}
