import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { AdMobBannerCard, getAdMobDebugInfo, initializeMobileAds, showRewardedCreditAd } from "./src/ads/admob";
import { createI18n, detectLocale } from "./src/i18n";
import { getLearnerId, getMemoryMode, getMemoryStatusLabel, loadMemories, loadProfile, saveMemory, saveProfile, loadCards, saveCard, loadSystemGeminiKey, setupSystemGeminiKey } from "./src/memory";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithCredential, signInWithPopup, linkWithPopup, linkWithCredential } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getFirebaseApp } from "./src/firebase";
import { styles } from "./src/styles";
import { Section, Card, Row, Input, Button, GhostButton, Stat, ChipRow, Phrase, History, Plan } from "./src/components";

const ENV_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export default function App() {
  const [locale, setLocale] = useState("zh");
  const { t, dict } = useMemo(() => createI18n(locale), [locale]);
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("Sharon");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [geminiKey, setGeminiKey] = useState(ENV_KEY);
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [cards, setCards] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [showingAd, setShowingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const [freeCredits, setFreeCredits] = useState(3);
  const [streak, setStreak] = useState(1);
  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [plan, setPlan] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [learnerId, setLearnerId] = useState("");
  const [memoryNotice, setMemoryNotice] = useState("");
  const [accent, setAccent] = useState("en-US");
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showHints, setShowHints] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [personalizedLessons, setPersonalizedLessons] = useState([]);
  const profileLoadedRef = useRef(false);
  const adMobInfo = useMemo(() => getAdMobDebugInfo(), []);

  const navItems = [
    ["home", t("nav.home")],
    ["lesson", t("nav.lesson")],
    ["practice", t("nav.practice")],
    ["freeTalk", t("nav.freeTalk")],
    ["review", t("nav.review")],
    ["cards", t("nav.cards")],
    ["plans", t("nav.plans")],
    ["settings", t("nav.settings")],
  ];

  const latestMemory = history[0];
  const memoryMode = getMemoryMode();
  const memoryStatus = getMemoryStatusLabel();

  useEffect(() => {
    Speech.stop();
  }, [screen]);

  useEffect(() => {
    setGoal((current) => current || dict.welcome.defaultGoal);
    setLevel((current) => current || dict.welcome.defaultLevel);
    setTopic((current) => current || dict.topics[0]);
  }, [dict]);

  useEffect(() => {
    setCurrentChat([]);
    setFeedback(null);
    setMemoryNotice("");
  }, [topic, screen]);

  useEffect(() => {
    const app = getFirebaseApp();
    if (app) {
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setAuthUser(user);
        if (user) {
          setLearnerId(user.uid);
          loadProfile().then(p => { if(p) setName(p.name || name); });
        } else {
          getLearnerId().then(setLearnerId);
        }
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID_HERE",
    });
  }, []);

  useEffect(() => {
    initializeMobileAds().catch((e) => setAdMessage(e.message));
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      if (!learnerId) return;
      try {
        const [profile, memories, savedCards] = await Promise.all([loadProfile(), loadMemories(), loadCards()]);
        if (!alive) return;
        
        if (profile) {
          setName(profile.name || "Sharon");
          setGoal(profile.goal || dict.welcome.defaultGoal);
          setLevel(profile.level || dict.welcome.defaultLevel);
          setPlan(profile.plan || "premium");
          setLocale(profile.locale || "zh");
          if (profile.geminiKey !== undefined && profile.geminiKey.trim() !== "") {
            setGeminiKey(profile.geminiKey);
          } else {
            const defaultKey = await loadSystemGeminiKey();
            if (defaultKey) setGeminiKey(defaultKey);
          }

          const today = new Date().toDateString();
          let currentStreak = profile.streak || 1;
          let currentCredits = profile.freeCredits !== undefined ? profile.freeCredits : 3;

          if (profile.lastActiveDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (profile.lastActiveDate === yesterday.toDateString()) {
              currentStreak += 1;
            } else if (profile.lastActiveDate) {
              currentStreak = 1;
            }
            currentCredits = 3;
          }

          setStreak(currentStreak);
          setFreeCredits(currentCredits);
          setWeeklyGoal(profile.weeklyGoal || 0);
          if (profile.accent) setAccent(profile.accent);
          if (profile.speechRate) setSpeechRate(profile.speechRate);
          if (profile.showHints !== undefined) setShowHints(profile.showHints);
          if (profile.completedLessons) setCompletedLessons(profile.completedLessons);
          if (profile.personalizedLessons) setPersonalizedLessons(profile.personalizedLessons);
        } else {
          // No profile, fetch default key
          const defaultKey = await loadSystemGeminiKey();
          if (defaultKey) setGeminiKey(defaultKey);
        }
        setHistory(memories);
        setCards(savedCards);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) {
          profileLoadedRef.current = true;
          setBooting(false);
        }
      }
    }

    loadData();
    return () => { alive = false; };
  }, [learnerId, dict]);

  useEffect(() => {
    getLearnerId().then(setLearnerId);
  }, []);

  useEffect(() => {
    if (!profileLoadedRef.current || booting) return;
    const today = new Date().toDateString();
    saveProfile({ 
      name, goal, level, plan, locale, geminiKey, streak, freeCredits, weeklyGoal, lastActiveDate: today,
      accent, speechRate, showHints, completedLessons, personalizedLessons
    }).catch((e) => setError(e.message));
  }, [name, goal, level, plan, locale, geminiKey, streak, freeCredits, weeklyGoal, booting, accent, speechRate, showHints, completedLessons, personalizedLessons]);

  function buildMemoryPrompt() {
    if (history.length === 0) return "none";
    return history
      .slice(0, 3)
      .map((item) => `${item.topic}: user="${item.message}" ai="${item.reply}"`)
      .join(" | ");
  }

  async function askGemini() {
    Speech.stop();
    const userInput = message.trim();
    if (!userInput || loading) return;
    setLoading(true);
    setError("");
    setMemoryNotice("");

    const textToSubmit = userInput;
    await processGeminiAsk(textToSubmit);
  }

  async function processGeminiAsk(userInput) {
    setLoading(true);
    try {
      const proxyUrl = process.env.EXPO_PUBLIC_VERCEL_PROXY_URL || "https://your-vercel-app.vercel.app/api/gemini";
      
      const historyItems = currentChat.map(c => ({
        role: c.role === "user" ? "user" : "model",
        parts: [{ text: c.text }]
      }));
      
      const promptText = `You are a conversational partner in a '${topic}' scenario. The user is an English learner.
Reply naturally IN CHARACTER to continue the conversation. Do NOT provide tutoring, corrections, or break character.
Return ONLY JSON format: {"reply": "your conversation response", "zh": "繁體中文翻譯"}`;

      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userInput,
          history: [...historyItems, { role: "user", parts: [{ text: promptText }] }, { role: "user", parts: [{ text: userInput }] }],
          generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "連線伺服器錯誤");

      const parsed = JSON.parse(data.text.replace(/```json|```/g, ""));
      const nextReply = parsed.reply || "Thinking...";
      
      setCurrentChat(prev => [...prev, { role: "user", text: userInput }, { role: "model", text: nextReply, zh: parsed.zh }]);
      Speech.speak(nextReply, { language: accent, rate: speechRate });
      setMessage("");
    } catch(e) {
      setError("連線伺服器錯誤：" + e.message);
    }
    setLoading(false);
  }

  async function getFeedback() {
    Speech.stop();
    if (currentChat.length === 0) return;
    setLoading(true);
    setError("");
    
    try {
      const proxyUrl = process.env.EXPO_PUBLIC_VERCEL_PROXY_URL || "https://your-vercel-app.vercel.app/api/gemini";

      const historyItems = currentChat.map(c => ({
        role: c.role === "user" ? "user" : "model",
        parts: [{ text: c.text }]
      }));

      const promptText = `You are an expert English tutor reviewing a '${topic}' scenario conversation.
Review the Learner's sentences.
Return ONLY JSON format: 
{
  "review": "Overall review in Traditional Chinese",
  "categories": { "grammar": [], "vocabulary": [], "naturalness": [] },
  "vocab": [{"word": "word", "ipa": "/phonetic_symbol/", "zh": "繁體中文"}],
  "extendedPhrases": [{"en": "useful phrase", "zh": "翻譯"}]
}`;

      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Provide Feedback",
          history: [...historyItems, { role: "user", parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "連線伺服器錯誤");

      const parsed = JSON.parse(data.text.replace(/```json|```/g, ""));
      
      // 廣告規則：只有免費用戶且對話超過 3 句（包含 AI 的回話）才需要看廣告
      const shouldShowAd = (plan !== "premium" && plan !== "plus") && currentChat.length > 3;

      if (shouldShowAd) {
        setPendingFeedback(parsed);
        setShowingAd(true);
        setAdCountdown(10);
      } else {
        setFeedback(parsed);
      }
    } catch(e) {
      setError("AI 導師連線失敗：" + e.message);
    }
    setLoading(false);
  }

  // 廣告倒數計時器
  useEffect(() => {
    if (!showingAd || adCountdown <= 0) return;
    const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showingAd, adCountdown]);

  function dismissAd() {
    setShowingAd(false);
    setFeedback(pendingFeedback);
    setPendingFeedback(null);
  }

  async function saveCurrentChat() {
    try {
      const summaryText = `${topic} 對話紀錄：\n` + currentChat.map(c => `${c.role==='user'?'我':'對方'}: ${c.text}`).join("\n") + "\n\n--- AI 導師點評 ---\n" + feedback?.review;
      const nextHistory = await saveMemory({
        screen, topic, message: "Chat Session", reply: feedback?.review || "N/A", profile: { name, goal, level, plan, locale, geminiKey }, summary: summaryText
      });
      setHistory(nextHistory);
      
      // 保存延伸課程
      if (feedback?.extendedPhrases) {
        setPersonalizedLessons(prev => [...feedback.extendedPhrases, ...prev].slice(0, 10));
      }

      setMemoryNotice(t("practice.saved"));
      setWeeklyGoal((prev) => Math.min(prev + 1, 5));
    } catch(e) { setError(e.message); }
  }

  function toggleListening() {
    if (typeof window === "undefined" || (!window.SpeechRecognition && !window.webkitSpeechRecognition)) {
      setError(t("practice.micErrorWeb"));
      return;
    }
    
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      // 優化：語音辨識完成後自動進入問答
      if (transcript.trim() && !loading) {
        setTimeout(() => {
          setLoading(true);
          processGeminiAsk(transcript.trim());
        }, 100);
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "no-speech") {
        setError(t("practice.micErrorNoSpeech"));
      } else {
        setError(t("practice.micError", { error: e.error }));
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  }

  async function handleSaveCard(word, zh, ipa) {
    try {
      const nextCards = await saveCard({ word, zh, ipa, context: topic });
      setCards(nextCards);
      setMemoryNotice(t("practice.savedCard", { word }));
    } catch(e) {
      setError(e.message);
    }
  }

  async function rewardAd() {
    try {
      const reward = await showRewardedCreditAd();
      setFreeCredits((prev) => prev + 1);
      setAdMessage(t("plans.rewardSuccess", { amount: reward.amount, type: reward.type }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      const app = getFirebaseApp();
      if (!app) return alert("Firebase 未設定");
      const auth = getAuth(app);
      
      if (Platform.OS === "web") {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(data.idToken);
        await signInWithCredential(auth, googleCredential);
      }
      alert("Google 登入成功！");
    } catch (e) {
      alert("Google 登入失敗：" + e.message);
    }
  }

  async function handleLinkGoogle() {
    try {
      const app = getFirebaseApp();
      if (!app) return alert("Firebase 未設定");
      const auth = getAuth(app);
      if (!auth.currentUser) return;

      if (Platform.OS === "web") {
        const provider = new GoogleAuthProvider();
        await linkWithPopup(auth.currentUser, provider);
      } else {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(data.idToken);
        await linkWithCredential(auth.currentUser, googleCredential);
      }
      alert("Google 帳戶綁定成功！");
    } catch (e) {
      alert("綁定失敗：" + e.message);
    }
  }

  async function handleLogin() {
    try {
      const app = getFirebaseApp();
      if (!app) return alert("Firebase 未設定");
      await signInWithEmailAndPassword(getAuth(app), email, password);
      alert("登入成功！");
    } catch(e) { alert("登入失敗：" + e.message); }
  }

  async function handleRegister() {
    try {
      const app = getFirebaseApp();
      if (!app) return alert("Firebase 未設定");
      await createUserWithEmailAndPassword(getAuth(app), email, password);
      alert("註冊成功！");
    } catch(e) { alert("註冊失敗：" + e.message); }
  }

  async function handleLogout() {
    const app = getFirebaseApp();
    if(app) {
      await signOut(getAuth(app));
      await GoogleSignin.signOut();
    }
    setEmail("");
    setPassword("");
    setAuthUser(null);
  }

  function renderWelcome() {
    return (
      <Section title={t("welcome.title")} subtitle={t("welcome.subtitle")}>
        <Card title={t("welcome.profileSetup")} sub={t("welcome.profileSetupSub")}>
          <Input label={t("welcome.name")} value={name} onChangeText={setName} placeholder="Sharon" />
          <Input label={t("welcome.goal")} value={goal} onChangeText={setGoal} placeholder={t("welcome.defaultGoal")} />
          <Input label={t("welcome.level")} value={level} onChangeText={setLevel} placeholder={t("welcome.defaultLevel")} />
          <Button label={t("welcome.enterApp")} onPress={() => setScreen("home")} />
          <View style={{ marginTop: 12 }}>
            <GhostButton label="或者使用 Google 登入" onPress={handleGoogleLogin} style={{ borderColor: '#4285F4' }} />
          </View>
        </Card>
      </Section>
    );
  }

  function renderHome() {
    return (
      <Section title={t("home.title", { name })} subtitle={t("home.subtitle", { goal, level, plan })}>
        <Row>
          <Stat title={t("home.weeklyGoal")} value={`${weeklyGoal} / 5`} text={t("home.weeklyGoalText")} />
          <Stat title={t("home.streak")} value={locale === "zh" ? `${streak} 天` : `${streak} days`} text={t("home.streakText")} />
        </Row>
        <Card title={dict.lessons.intro.title} sub={dict.lessons.intro.duration}>
          <Text style={styles.body}>{dict.lessons.intro.summary}</Text>
          <Row>
            <Button label={t("home.openLesson")} onPress={() => setScreen("lesson")} />
            <GhostButton label={t("home.startPractice")} onPress={() => setScreen("practice")} />
          </Row>
        </Card>
        <Card title={t("home.memoryTitle")}>
          <Text style={styles.body}>
            {latestMemory ? t("home.memorySummary", { summary: latestMemory.summary || latestMemory.topic }) : t("home.memoryEmpty")}
          </Text>
        </Card>
      </Section>
    );
  }

  const [lessonId, setLessonId] = useState("intro");

  function renderLesson() {
    const lessonKeys = Object.keys(dict.lessons);
    const lessonTitles = lessonKeys.map(k => dict.lessons[k].title);
    const currentLesson = dict.lessons[lessonId] || dict.lessons.intro;

    return (
      <Section title={currentLesson.video || currentLesson.title} subtitle={t("lesson.subtitle")}>
        <Card title={t("lesson.switcher")} sub={t("lesson.switcherSub")}>
          <ChipRow values={lessonTitles} active={currentLesson.title} onSelect={(title) => {
            const key = lessonKeys.find(k => dict.lessons[k].title === title);
            if (key) setLessonId(key);
          }} completedItems={completedLessons} />
        </Card>
        <Card title={currentLesson.title} sub={currentLesson.duration}>
          <Pressable onPress={() => { Speech.stop(); Speech.speak(currentLesson.phrases.map(p=>p[0]).join(". "), { language: accent, rate: speechRate }); }}>
            <Text style={styles.videoBadge}>{t("common.play")} 🔊</Text>
          </Pressable>
          {currentLesson.phrases.map(([en, zh]) => <Phrase key={en} en={en} zh={zh} onPress={() => { Speech.stop(); Speech.speak(en, { language: accent, rate: speechRate }); }} showZh={showHints} />)}
          <Row>
            <Button label={completedLessons.includes(lessonId) ? "✅ 已完成 " : "🎯 標記為完成"} 
                    onPress={() => setCompletedLessons(prev => prev.includes(lessonId) ? prev.filter(i => i !== lessonId) : [...prev, lessonId])} />
            <GhostButton label={t("lesson.goPractice")} onPress={() => setScreen("practice")} />
          </Row>
        </Card>

        {personalizedLessons.length > 0 && (
          <Card title="💡 為您生成的延伸練習" sub="基於您剛才的對話紀錄">
             {personalizedLessons.map((p, idx) => (
                <Phrase key={idx} en={p.en} zh={p.zh} onPress={() => Speech.speak(p.en, { language: accent, rate: speechRate })} showZh={showHints} />
             ))}
          </Card>
        )}
      </Section>
    );
  }

  function renderAiScreen(title, subtitle) {
    return (
      <Section title={title} subtitle={subtitle}>
        <Card title={screen === "practice" ? t("practice.scenario") : t("freeTalk.settings")} sub={screen === "practice" ? t("practice.scenarioSub") : t("freeTalk.settingsSub")}>
          <ChipRow values={dict.topics} active={topic} onSelect={setTopic} />
          {screen === "freeTalk" && plan === "free" ? <Text style={styles.helper}>{t("freeTalk.freeCreditsText", { count: freeCredits })}</Text> : null}
        </Card>
        <Card title={screen === "practice" ? t("practice.conversation") : t("freeTalk.chat")} sub={screen === "practice" ? t("practice.conversationSub") : t("freeTalk.chatSub", { topic })}>
          <Input label={screen === "practice" ? t("practice.yourReply") : t("freeTalk.input")} value={message} onChangeText={setMessage} placeholder="Type English here..." multiline />
          <Row>
            <View style={{ flex: 2 }}><Button label={loading ? t(screen === "practice" ? "practice.sending" : "freeTalk.sending") : t(screen === "practice" ? "practice.send" : "freeTalk.send")} onPress={askGemini} /></View>
            <View style={{ flex: 1.5 }}><GhostButton label={isListening ? "🔴 Listening..." : "🎤 Speak Now"} onPress={toggleListening} /></View>
          </Row>
          <Text style={[styles.helper, { textAlign: 'center', marginTop: 4 }]}>
            {isListening ? "Talking to AI... (Auto-send enabled)" : "Tap microphone to speak, I will reply automatically."}
          </Text>
          {currentChat.map((msg, i) => (
             <View key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#eef5f6' : '#fffdf8', borderColor: "rgba(61,52,38,0.08)", borderWidth: 1, padding: 14, borderRadius: 18, marginBottom: 12, maxWidth: '85%' }}>
                <Text style={msg.role === 'user' ? styles.label : styles.phraseEn}>{msg.text}</Text>
                {msg.zh && showHints && <Text style={{...styles.body, fontSize: 13, marginTop: 4}}>{msg.zh}</Text>}
             </View>
          ))}

          {currentChat.length > 0 && !feedback ? (
             <View style={{ marginTop: 10, alignItems: 'center' }}>
               <GhostButton label="📝 結束對話並取得語法指導" onPress={getFeedback} />
             </View>
          ) : null}

          {feedback ? (
             <View style={styles.replyBox}>
               <Text style={styles.replyLabel}>👨‍🏫 AI 強化回饋</Text>
               <Text style={styles.body}>{feedback.review}</Text>
               
               {feedback.categories && Object.entries(feedback.categories).map(([k, items]) => (
                 <View key={k} style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: '800', color: '#15344f', fontSize: 13 }}>• {k.toUpperCase()}</Text>
                    {items.map((it, idx) => <Text key={idx} style={[styles.body, { fontSize: 13 }]}>- {it}</Text>)}
                 </View>
               ))}

               <Text style={{...styles.replyLabel, marginTop: 10}}>💡重點單字</Text>
               {feedback.vocab && feedback.vocab.map(v => (
                  <Row key={v.word}>
                     <View style={styles.flex}>
                       <Row style={{ alignItems: 'baseline' }}>
                         <Text style={styles.phraseEn}>{v.word}</Text>
                         {v.ipa && <Text style={[styles.body, { color: '#8f4f1f', marginLeft: 6, fontSize: 13 }]}>{v.ipa}</Text>}
                       </Row>
                       <Text style={styles.body}>{v.zh}</Text>
                     </View>
                     <Pressable onPress={() => handleSaveCard(v.word, v.zh, v.ipa)}>
                       <Text style={styles.link}>⭐ 存卡</Text>
                     </Pressable>
                  </Row>
               ))}
               <View style={{marginTop: 10}}>
                 <Button label="💾 儲存並產出延伸練習" onPress={saveCurrentChat} />
               </View>
             </View>
          ) : null}
          {memoryNotice ? <Text style={styles.success}>{memoryNotice}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Card>
      </Section>
    );
  }

  function renderReview() {
    return (
      <Section title={t("review.title")} subtitle={t("review.subtitle")}>
        <Card title={t("review.syncStatus")}>
          <Text style={styles.body}>{t("review.recentSub")}</Text>
        </Card>
        <Card title={t("review.recent")} sub={t("review.recentSub")}>
          {history.length === 0 ? <Text style={styles.body}>{t("review.empty")}</Text> : null}
          {history.map((item) => (
            <History key={item.id} title={item.topic} meta={`${item.message} -> ${item.reply}`} openLabel={t("review.open")} />
          ))}
        </Card>
      </Section>
    );
  }

  function renderCards() {
    return (
      <Section title={t("cards.title")} subtitle={t("cards.subtitle")}>
        <Card title={t("cards.libraryTitle")} sub={t("cards.librarySub", { count: cards.length })}>
          {cards.length === 0 ? <Text style={styles.body}>{t("cards.empty")}</Text> : null}
          {cards.map((c) => (
            <View key={c.id} style={styles.history}>
              <View style={styles.flex}>
                <Row style={{ alignItems: 'baseline' }}>
                  <Text style={styles.phraseEn}>{c.word}</Text>
                  {c.ipa && <Text style={[styles.body, { color: '#8f4f1f', marginLeft: 6, fontSize: 13 }]}>{c.ipa}</Text>}
                </Row>
                <Text style={styles.body}>{c.zh} · {t("cards.source", { context: c.context })}</Text>
              </View>
              <Pressable onPress={() => { Speech.stop(); Speech.speak(c.word, { language: accent, rate: speechRate }); }}>
                <Text style={styles.link}>🔊 {t("cards.pronounce")}</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      </Section>
    );
  }

  function renderPlans() {
    const plans = ["free", "basic", "premium", "plus"].map((id) => ({ id, ...dict.plansData[id] }));
    return (
      <Section title={t("plans.title")} subtitle={t("plans.subtitle")}>
        {plans.map((item) => <Plan key={item.id} item={item} active={plan === item.id} onPress={() => setPlan(item.id)} />)}
        <Card title={t("plans.freeCredits")} sub={t("plans.freeCreditsSub")}>
          <Text style={styles.body}>{t("plans.currentStatusText", { plan, credits: freeCredits })}</Text>
          {plan === "free" ? (
            <>
              <Button label={t("plans.rewardButton")} onPress={rewardAd} />
              {screen === 'plans' && <AdMobBannerCard />}
              <Text style={styles.helper}>{t("plans.rewardHint")}</Text>
            </>
          ) : null}
          {adMessage ? <Text style={styles.success}>{adMessage}</Text> : null}
          <Text style={styles.helper}>{t("plans.admobDebug")}: {adMobInfo}</Text>
        </Card>
      </Section>
    );
  }

  function renderPersonalized() {
    return (
      <Section title="🎯 個人化課程" subtitle="根據您的對話紀錄自動生成的專屬練習">
        <Card title="自動產出建議" sub="這裡會收錄您在自由對話中表現優異或需要加強的句型">
           {personalizedLessons.length === 0 ? <Text style={styles.body}>目前還沒有個人化推薦，去 Free Talk 聊聊吧！</Text> : null}
           {personalizedLessons.map((p, idx) => (
             <Phrase key={idx} en={p.en} zh={p.zh} onPress={() => Speech.speak(p.en, { language: accent, rate: speechRate })} showZh={showHints} />
           ))}
        </Card>
      </Section>
    );
  }

  function renderSettings() {
    return (
      <Section title={t("settings.title")} subtitle={t("settings.subtitle")}>
        <Card title="🎙️ 語音語系與偏好">
           <Text style={styles.label}>發音口音 (Accent)</Text>
           <ChipRow values={["en-US", "en-GB", "en-AU", "en-IN"]} active={accent} onSelect={setAccent} />
           <Text style={[styles.label, {marginTop: 10}]}>語速 (Speed): {speechRate}</Text>
           <ChipRow values={["0.7", "0.9", "1.1", "1.3"]} active={speechRate.toString()} onSelect={(v) => setSpeechRate(parseFloat(v))} />
           <Row style={{ marginTop: 10 }}>
              <Text style={styles.label}>顯示翻譯與提示 (Hints)</Text>
              <Pressable onPress={() => setShowHints(!showHints)}>
                <Text style={styles.link}>{showHints ? "✅ 已開啟" : "❌ 已關閉"}</Text>
              </Pressable>
           </Row>
        </Card>
        <Card title="雲端帳號設定 (Cloud Account)">
          {authUser ? (
            <View>
              <Text style={styles.body}>已登入雲端帳號：{authUser.email}</Text>
              {!authUser.providerData.some(p => p.providerId === 'google.com') && (
                <View style={{ marginTop: 8 }}>
                   <GhostButton label="🤝 綁定 Google 帳戶" onPress={handleLinkGoogle} style={{ borderColor: '#4285F4' }} />
                </View>
              )}
              <GhostButton label="登出 (Logout)" onPress={handleLogout} style={{ marginTop: 10 }} />
            </View>
          ) : (
            <View>
              <Input label="信箱 (Email)" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <Input label="密碼 (Password)" value={password} onChangeText={setPassword} secureTextEntry />
              <Row>
                <View style={{ flex: 1 }}><Button label="登入 (Login)" onPress={handleLogin} /></View>
                <View style={{ flex: 1 }}><GhostButton label="註冊帳號 (Register)" onPress={handleRegister} /></View>
              </Row>
              <View style={{ marginTop: 10 }}>
                <Button label="使用 Google 登入" onPress={handleGoogleLogin} style={{ backgroundColor: '#4285F4' }} />
              </View>
            </View>
          )}
        </Card>
        <Card title={t("settings.profile")} sub={t("settings.profileSub")}>
          <Input label={t("settings.name")} value={name} onChangeText={setName} placeholder={t("settings.name")} />
          <Input label={t("settings.goal")} value={goal} onChangeText={setGoal} placeholder={t("settings.goal")} />
          <Input label={t("settings.level")} value={level} onChangeText={setLevel} placeholder={t("settings.level")} />
          <Input label={t("settings.geminiKey")} value={geminiKey} onChangeText={setGeminiKey} placeholder="EXPO_PUBLIC_GEMINI_API_KEY" secure />
          <Text style={styles.helper}>{t("settings.helper")}</Text>
          <View style={{ marginTop: 10 }}>
             <GhostButton label="⚠️ 設定為全域預設 Key (Admin Only)" onPress={async () => {
                const confirmed = confirm("確定要將目前的 Key 存入 Firebase 'system' 集合嗎？這會變成所有新使用者的預設 Key。");
                if (confirmed) {
                   const success = await setupSystemGeminiKey(geminiKey);
                   alert(success ? "已成功建立 System Collection 並存入 Key！" : "設定失敗，請檢查權限。");
                }
             }} />
          </View>
        </Card>
        <Card title={t("settings.memory")} sub={t("settings.memorySub")}>
          <Text style={styles.helper}>{t("settings.memoryCount", { count: history.length })}</Text>
        </Card>
        <Card title={t("settings.language")} sub={t("settings.languageSub")}>
          <Row>
            <GhostButton label={t("common.localeChinese")} onPress={() => setLocale("zh")} />
            <GhostButton label={t("common.localeEnglish")} onPress={() => setLocale("en")} />
          </Row>
        </Card>
      </Section>
    );
  }

  const content =
    screen === "welcome" ? renderWelcome()
      : screen === "home" ? renderHome()
      : screen === "lesson" ? renderLesson()
      : screen === "practice" ? renderAiScreen(dict.scenarios.coffee.title, t("practice.subtitle"))
      : screen === "freeTalk" ? renderAiScreen(t("freeTalk.title"), t("freeTalk.subtitle"))
      : screen === "review" ? renderReview()
      : screen === "cards" ? renderCards()
      : screen === "plans" ? renderPlans()
      : screen === "personalized" ? renderPersonalized()
      : renderSettings();

  return (
    <LinearGradient colors={["#f7efe4", "#eee1ce", "#d5dddf"]} style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <View style={styles.top}>
            <View>
              <Text style={styles.brand}>{t("appName")}</Text>
              <Text style={styles.sub}>{booting ? t("common.loading") : t("appSubtitle")}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{t("screenCount")}</Text>
            </View>
          </View>
          {screen !== "welcome" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nav} contentContainerStyle={styles.navContent}>
              {navItems.map(([id, label]) => (
                <Pressable key={id} style={[styles.navChip, screen === id && styles.navChipActive]} onPress={() => setScreen(id)}>
                  <Text style={[styles.navText, screen === id && styles.navTextActive]}>{label}</Text>
                </Pressable>
              ))}
              {personalizedLessons.length > 0 && (
                <Pressable style={[styles.navChip, screen === 'personalized' && styles.navChipActive, {borderColor: '#ff9800'}]} onPress={() => setScreen('personalized')}>
                  <Text style={[styles.navText, screen === 'personalized' && styles.navTextActive]}>⭐ 個人化</Text>
                </Pressable>
              )}
            </ScrollView>
          ) : null}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {content}
          </ScrollView>
        </View>

        {/* 廣告插頁 - 免費用戶在取得學習報告前必須觀看 */}
        {showingAd ? (
          <View style={styles.adOverlay}>
            <View style={styles.adModal}>
              <Text style={styles.adTitle}>📢 廣告時間</Text>
              <Text style={styles.adSubtitle}>感謝使用免費版！觀看完廣告後即可查閱您的學習報告。</Text>
              <Text style={styles.adSubtitle}>升級 Premium 方案可跳過所有廣告。</Text>
              
              <View style={styles.adSlot}>
                {plan === "free" && <AdMobBannerCard slot="" />}
              </View>

              {adCountdown > 0 ? (
                <View style={styles.adCountdownBox}>
                  <Text style={styles.adCountdownText}>⏳ 請稍候 {adCountdown} 秒...</Text>
                </View>
              ) : (
                <Pressable style={styles.btn} onPress={dismissAd}>
                  <Text style={styles.btnText}>✅ 查看我的學習報告</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : null}

      </SafeAreaView>
    </LinearGradient>
  );
}


