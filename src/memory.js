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

/**
 * 取得當前學習者的 ID
 * 如果已登入 Firebase 則回傳 UID，否則回傳裝置生成的 ID
 */
export async function getLearnerId() {
  try {
    const app = getFirebaseApp();
    if (app) {
      const auth = getAuth(app);
      if (auth.currentUser) return auth.currentUser.uid;
    }
  } catch (e) {}
  
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const next = createId("learner");
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

/**
 * 內部使用的儲存金鑰生成器，確保不同帳號資料隔離
 */
async function getUserKey(baseKey) {
  const learnerId = await getLearnerId();
  return `${baseKey}.${learnerId}`;
}

export async function loadProfile() {
  const key = await getUserKey(PROFILE_KEY);
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile) {
  try {
    const learnerId = await getLearnerId();
    const key = await getUserKey(PROFILE_KEY);
    await AsyncStorage.setItem(key, JSON.stringify(profile));
    
    const _db = getDb();
    if (_db) {
      // 安全保護：在推送到雲端前，拔除個人的 Gemini API Key
      const cloudProfile = { ...profile, learnerId, updatedAt: Date.now() };
      delete cloudProfile.geminiKey;
      await setDoc(doc(_db, `learners`, learnerId), cloudProfile, { merge: true });
    }
  } catch (err) {
    console.warn("Firebase Profile Sync Error:", err.message);
  }
  return profile;
}

export async function loadMemories() {
  const learnerId = await getLearnerId();
  const key = await getUserKey(MEMORY_KEY);
  const raw = await AsyncStorage.getItem(key);
  let localItems = raw ? JSON.parse(raw) : [];
  const db = getDb();

  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, "learners", learnerId, "memories"), orderBy("updatedAt", "desc"), limit(20)));
      const remoteItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      
      if (remoteItems.length > 0) {
        localItems = remoteItems;
        await AsyncStorage.setItem(key, JSON.stringify(remoteItems));
      } else if (localItems.length === 0) {
         // 如果遠端沒資料且本地也沒資料，嘗試同步 Remote Profile 以免遺漏
         const remoteProfile = await getDoc(doc(db, "learners", learnerId));
         if (remoteProfile.exists()) {
           const profileKey = await getUserKey(PROFILE_KEY);
           await AsyncStorage.setItem(profileKey, JSON.stringify(remoteProfile.data()));
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
  const key = await getUserKey(MEMORY_KEY);
  const entry = { id: createId("memory"), learnerId, ...memory, updatedAt: Date.now() };
  const current = await loadMemories();
  const next = [entry, ...current].slice(0, 50);
  await AsyncStorage.setItem(key, JSON.stringify(next));
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
  const key = await getUserKey(CARDS_KEY);
  const raw = await AsyncStorage.getItem(key);
  let localItems = raw ? JSON.parse(raw) : [];
  const db = getDb();

  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, "learners", learnerId, "cards"), orderBy("updatedAt", "desc"), limit(100)));
      const remoteItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      if (remoteItems.length > 0) {
        localItems = remoteItems;
        await AsyncStorage.setItem(key, JSON.stringify(remoteItems));
      }
    } catch (err) {
      console.warn("Firebase Cards Sync Error:", err.message);
    }
  }

  return localItems;
}

export async function saveCard(card) {
  const learnerId = await getLearnerId();
  const key = await getUserKey(CARDS_KEY);
  const entry = { id: createId("card"), learnerId, ...card, updatedAt: Date.now() };
  const current = await loadCards();
  const next = [entry, ...current].slice(0, 100);
  await AsyncStorage.setItem(key, JSON.stringify(next));
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


export async function loadSystemGeminiKey() {
  const db = getDb();
  if (!db) return null;
  try {
    // 預設 System ID (MD5 of 'gemini_config')
    const docRef = doc(db, "system", "0317e07663d2745a5575b5f903740e53");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().apiKey;
    }
  } catch (err) {
    console.warn("Failed to load System Gemini Key:", err.message);
  }
  return null;
}

export async function setupSystemGeminiKey(key) {
  const db = getDb();
  if (!db) return false;
  try {
    const docRef = doc(db, "system", "0317e07663d2745a5575b5f903740e53");
    await setDoc(docRef, { apiKey: key, updatedAt: Date.now() });
    return true;
  } catch (err) {
    console.error("Setup System Gemini Key Error:", err.message);
    return false;
  }
}

export function getMemoryMode() {
  return hasFirebaseConfig() ? "firebase" : "local";
}

export function getMemoryStatusLabel() {
  return hasFirebaseConfig() ? `firebase:${getFirebaseConfigSummary()}` : "local-only";
}
