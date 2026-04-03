import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { AdMobBannerCard, getAdMobDebugInfo, initializeMobileAds, showRewardedCreditAd } from "./src/ads/admob";
import { createI18n, detectLocale } from "./src/i18n";
import { getLearnerId, getMemoryMode, getMemoryStatusLabel, loadMemories, loadProfile, saveMemory, saveProfile, loadCards, saveCard } from "./src/memory";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirebaseApp } from "./src/firebase";

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
    initializeMobileAds().catch((e) => setAdMessage(e.message));
  }, []);

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      try {
        const [profile, memories, savedCards, id] = await Promise.all([loadProfile(), loadMemories(), loadCards(), getLearnerId()]);
        if (!alive) return;
        setLearnerId(id);
        if (profile) {
          setName(profile.name || "Sharon");
          setGoal(profile.goal || dict.welcome.defaultGoal);
          setLevel(profile.level || dict.welcome.defaultLevel);
          setPlan(profile.plan || "premium");
          setLocale(profile.locale || "zh");
          if (profile.geminiKey !== undefined) setGeminiKey(profile.geminiKey);

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
            currentCredits = 3; // Reset daily credits
          }

          setStreak(currentStreak);
          setFreeCredits(currentCredits);
          setWeeklyGoal(profile.weeklyGoal || 0);
        } else {
          setLocale("zh");
          setStreak(1);
          setFreeCredits(3);
          setWeeklyGoal(0);
        }
        setHistory(memories);
        setCards(savedCards);
      } catch (e) {
        if (alive) {
          setError(e.message);
        }
      } finally {
        if (alive) {
          profileLoadedRef.current = true;
          setBooting(false);
        }
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!profileLoadedRef.current || booting) return;
    const today = new Date().toDateString();
    saveProfile({ name, goal, level, plan, locale, geminiKey, streak, freeCredits, weeklyGoal, lastActiveDate: today }).catch((e) => setError(e.message));
  }, [name, goal, level, plan, locale, geminiKey, streak, freeCredits, weeklyGoal, booting]);

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
    if (screen === "freeTalk" && plan === "free" && freeCredits <= 0) {
      setError(t("freeTalk.noCredits"));
      return;
    }

    setLoading(true);
    setError("");
    setMemoryNotice("");

    if (!geminiKey.trim()) {
      setError("Please set your Gemini Key in Settings.");
      setLoading(false);
      return;
    }

    try {
      const historyText = currentChat.map(c => `${c.role === "user" ? "Learner" : "You"}: ${c.text}`).join("\n");
      const prompt = `You are a conversational partner in a '${topic}' scenario. The user is an English learner.
Chat History:
${historyText}
Learner: "${userInput}"

Reply naturally IN CHARACTER to continue the conversation. Do NOT provide tutoring, corrections, or break character.
Return ONLY JSON format: {"reply": "your conversation response", "zh": "繁體中文翻譯"}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, responseMimeType: "application/json" } })
      });
      
      if (!res.ok) throw new Error(t("gemini.error", { status: res.status }));
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(t("gemini.empty"));
      
      const parsed = JSON.parse(text.replace(/```json|```/g, ''));
      const nextReply = parsed.reply || "Thinking...";
      
      setCurrentChat(prev => [...prev, { role: "user", text: userInput }, { role: "model", text: nextReply, zh: parsed.zh }]);
      
      Speech.speak(nextReply, { language: "en-US", rate: 0.9 });
      setMessage("");
      
      if (screen === "freeTalk" && plan === "free") setFreeCredits((prev) => Math.max(prev - 1, 0));
    } catch(e) {
      setError("API 錯誤：" + e.message);
    }
    setLoading(false);
  }

  async function getFeedback() {
    Speech.stop();
    if (!geminiKey.trim() || currentChat.length === 0) return;
    setLoading(true);
    setError("");
    
    try {
      const historyText = currentChat.map(c => `${c.role === "user" ? "Learner" : "AI"}: ${c.text}`).join("\n");
      const prompt = `You are an expert English tutor. Review the following conversation.
Scenario: ${topic}
Conversation:
${historyText}

Analyze the Learner's sentences ONLY. Provide grammar/vocabulary corrections, praise good usage, and extract useful vocabulary.
Return ONLY JSON format: {"review": "Your overall review and corrections in Traditional Chinese", "vocab": [{"word": "word", "zh": "繁體中文解釋"}]}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, responseMimeType: "application/json" } })
      });
      
      if (!res.ok) throw new Error(t("gemini.error", { status: res.status }));
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text.replace(/```json|```/g, ''));
      
      // 免費用戶：先跳廣告倒數，再顯示報告
      if (plan !== "premium" && plan !== "plus") {
        setPendingFeedback(parsed);
        setShowingAd(true);
        setAdCountdown(10);
      } else {
        setFeedback(parsed);
      }
    } catch(e) {
      setError("API 錯誤：" + e.message);
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
      setMessage((prev) => (prev ? prev + " " + transcript : transcript));
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

  async function handleSaveCard(word, zh) {
    try {
      const nextCards = await saveCard({ word, zh, context: topic });
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
    if(app) await signOut(getAuth(app));
    setEmail("");
    setPassword("");
  }

  function renderWelcome() {
    return (
      <Section title={t("welcome.title")} subtitle={t("welcome.subtitle")}>
        <Card title={t("welcome.profileSetup")} sub={t("welcome.profileSetupSub")}>
          <Input label={t("welcome.name")} value={name} onChangeText={setName} placeholder="Sharon" />
          <Input label={t("welcome.goal")} value={goal} onChangeText={setGoal} placeholder={t("welcome.defaultGoal")} />
          <Input label={t("welcome.level")} value={level} onChangeText={setLevel} placeholder={t("welcome.defaultLevel")} />
          <Button label={t("welcome.enterApp")} onPress={() => setScreen("home")} />
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
        <Card title={t("home.memoryTitle")} sub={memoryMode === "firebase" ? t("review.sourceFirebase") : t("review.sourceLocal")}>
          <Text style={styles.body}>
            {latestMemory ? t("home.memorySummary", { summary: latestMemory.summary || latestMemory.topic }) : t("home.memoryEmpty")}
          </Text>
        </Card>
      </Section>
    );
  }

  function renderLesson() {
    return (
      <Section title={dict.lessons.intro.video} subtitle={t("lesson.subtitle")}>
        <Card title={t("lesson.switcher")} sub={t("lesson.switcherSub")}>
          <ChipRow values={[dict.lessons.intro.title, dict.lessons.cafe.title]} active={dict.lessons.intro.title} />
        </Card>
        <Card title={dict.lessons.intro.title} sub={dict.lessons.intro.duration}>
          <Pressable onPress={() => { Speech.stop(); Speech.speak(dict.lessons.intro.phrases.map(p=>p[0]).join(". "), { language: "en-US", rate: 0.8 }); }}>
            <Text style={styles.videoBadge}>{t("common.play")} 🔊</Text>
          </Pressable>
          {dict.lessons.intro.phrases.map(([en, zh]) => <Phrase key={en} en={en} zh={zh} onPress={() => { Speech.stop(); Speech.speak(en, { language: "en-US", rate: 0.8 }); }} />)}
          <Button label={t("lesson.goPractice")} onPress={() => setScreen("practice")} />
        </Card>
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
            <View style={{ flex: 1 }}><GhostButton label={isListening ? "🔴 " + t("practice.listening") : "🎤 " + t("practice.voiceSpeak")} onPress={toggleListening} /></View>
          </Row>
          {currentChat.map((msg, i) => (
             <View key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#eef5f6' : '#fffdf8', borderColor: "rgba(61,52,38,0.08)", borderWidth: 1, padding: 14, borderRadius: 18, marginBottom: 12, maxWidth: '85%' }}>
                <Text style={msg.role === 'user' ? styles.label : styles.phraseEn}>{msg.text}</Text>
                {msg.zh && <Text style={{...styles.body, fontSize: 13, marginTop: 4}}>{msg.zh}</Text>}
             </View>
          ))}

          {currentChat.length > 0 && !feedback ? (
             <View style={{ marginTop: 10, alignItems: 'center' }}>
               <GhostButton label="📝 結束對話並取得語法指導" onPress={getFeedback} />
             </View>
          ) : null}

          {feedback ? (
             <View style={styles.replyBox}>
               <Text style={styles.replyLabel}>👨‍🏫 AI 語法與單字總結</Text>
               <Text style={styles.body}>{feedback.review}</Text>
               <Text style={{...styles.replyLabel, marginTop: 10}}>💡 {t("practice.vocabHeader")}</Text>
               {feedback.vocab && feedback.vocab.map(v => (
                  <Row key={v.word}>
                     <View style={styles.flex}>
                       <Text style={styles.phraseEn}>{v.word}</Text>
                       <Text style={styles.body}>{v.zh}</Text>
                     </View>
                     <Pressable onPress={() => handleSaveCard(v.word, v.zh)}>
                       <Text style={styles.link}>⭐ {t("practice.saveCard")}</Text>
                     </Pressable>
                  </Row>
               ))}
               <View style={{marginTop: 10}}>
                 <Button label="儲存這次的對話到記憶" onPress={saveCurrentChat} />
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
        <Card title={t("review.syncStatus")} sub={memoryMode === "firebase" ? t("review.sourceFirebase") : t("review.sourceLocal")}>
          <Text style={styles.body}>{memoryStatus}</Text>
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
                <Text style={styles.phraseEn}>{c.word}</Text>
                <Text style={styles.body}>{c.zh} · {t("cards.source", { context: c.context })}</Text>
              </View>
              <Pressable onPress={() => { Speech.stop(); Speech.speak(c.word, { language: "en-US", rate: 0.8 }); }}>
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
              <AdMobBannerCard />
              <Text style={styles.helper}>{t("plans.rewardHint")}</Text>
            </>
          ) : null}
          {adMessage ? <Text style={styles.success}>{adMessage}</Text> : null}
          <Text style={styles.helper}>{t("plans.admobDebug")}: {adMobInfo}</Text>
        </Card>
      </Section>
    );
  }

  function renderSettings() {
    return (
      <Section title={t("settings.title")} subtitle={t("settings.subtitle")}>
        <Card title="雲端帳號設定 (Cloud Account)">
          {authUser ? (
            <View>
              <Text style={styles.body}>已登入雲端帳號：{authUser.email}</Text>
              <GhostButton label="登出 (Logout)" onPress={handleLogout} />
            </View>
          ) : (
            <View>
              <Input label="信箱 (Email)" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <Input label="密碼 (Password)" value={password} onChangeText={setPassword} secureTextEntry />
              <Row>
                <View style={{ flex: 1 }}><Button label="登入 (Login)" onPress={handleLogin} /></View>
                <View style={{ flex: 1 }}><GhostButton label="註冊帳號 (Register)" onPress={handleRegister} /></View>
              </Row>
            </View>
          )}
        </Card>
        <Card title={t("settings.profile")} sub={t("settings.profileSub")}>
          <Input label={t("settings.name")} value={name} onChangeText={setName} placeholder={t("settings.name")} />
          <Input label={t("settings.goal")} value={goal} onChangeText={setGoal} placeholder={t("settings.goal")} />
          <Input label={t("settings.level")} value={level} onChangeText={setLevel} placeholder={t("settings.level")} />
          <Input label={t("settings.geminiKey")} value={geminiKey} onChangeText={setGeminiKey} placeholder="EXPO_PUBLIC_GEMINI_API_KEY" secure />
          <Text style={styles.helper}>{t("settings.helper")}</Text>
        </Card>
        <Card title={t("settings.memory")} sub={t("settings.memorySub")}>
          <Text style={styles.body}>{memoryMode === "firebase" ? t("settings.firebaseReady") : t("settings.firebaseMissing")}</Text>
          <Text style={styles.helper}>{t("settings.learnerId")}: {learnerId || "-"}</Text>
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
                <AdMobBannerCard slot="" />
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

function Section({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <LinearGradient colors={["#15344f", "#275c74"]} style={styles.hero}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSub}>{subtitle}</Text>
      </LinearGradient>
      {children}
    </View>
  );
}

function Card({ title, sub, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
      {children}
    </View>
  );
}

function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}

function Input({ label, value, onChangeText, placeholder, secure, multiline }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8f8577"
        secureTextEntry={secure}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={[styles.input, multiline && styles.area]}
      />
    </View>
  );
}

function Button({ label, onPress }) {
  return <Pressable style={styles.btn} onPress={onPress}><Text style={styles.btnText}>{label}</Text></Pressable>;
}

function GhostButton({ label, onPress }) {
  return <Pressable style={styles.ghost} onPress={onPress}><Text style={styles.ghostText}>{label}</Text></Pressable>;
}

function Stat({ title, value, text }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function ChipRow({ values, active, onSelect }) {
  return (
    <View style={styles.chips}>
      {values.map((value) => (
        <Pressable key={value} style={[styles.chip, active === value && styles.chipActive]} onPress={() => onSelect?.(value)}>
          <Text style={[styles.chipText, active === value && styles.chipTextActive]}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Phrase({ en, zh, onPress }) {
  return (
    <Pressable style={styles.phrase} onPress={onPress}>
      <Text style={styles.phraseEn}>{en}</Text>
      <Text style={styles.body}>{zh}</Text>
    </Pressable>
  );
}

function History({ title, meta, openLabel }) {
  return (
    <View style={styles.history}>
      <View style={styles.flex}>
        <Text style={styles.phraseEn}>{title}</Text>
        <Text style={styles.body}>{meta}</Text>
      </View>
      <Text style={styles.link}>{openLabel}</Text>
    </View>
  );
}

function Plan({ item, active, onPress }) {
  return (
    <Pressable style={[styles.plan, active && styles.planActive]} onPress={onPress}>
      <Text style={[styles.planName, active && styles.planNameActive]}>{item.name}</Text>
      <Text style={[styles.planPrice, active && styles.planPriceActive]}>{item.price}</Text>
      {item.features.map((feature) => <Text key={feature} style={[styles.body, active && styles.planBodyActive]}>- {feature}</Text>)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brand: { color: "#32453f", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 },
  sub: { color: "#68736e", fontSize: 12, marginTop: 4, maxWidth: 320 },
  pill: { backgroundColor: "rgba(255,255,255,0.7)", borderColor: "rgba(50,69,63,0.1)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillText: { color: "#32453f", fontSize: 12, fontWeight: "700" },
  nav: { flexGrow: 0, marginBottom: 16 },
  navContent: { gap: 10, paddingRight: 12 },
  navChip: { backgroundColor: "rgba(255,251,245,0.78)", borderColor: "rgba(49,69,63,0.08)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  navChipActive: { backgroundColor: "#214e63" },
  navText: { color: "#546560", fontSize: 13, fontWeight: "700" },
  navTextActive: { color: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 36 },
  section: { gap: 16 },
  hero: { borderRadius: 28, padding: 24 },
  heroTitle: { color: "#f8fbfd", fontSize: 30, fontWeight: "800", lineHeight: 36, marginBottom: 12 },
  heroSub: { color: "#d7e7ee", fontSize: 15, lineHeight: 23 },
  card: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 14 },
  cardTitle: { color: "#1f1d1a", fontSize: 22, fontWeight: "800" },
  cardSub: { color: "#726a60", fontSize: 13, lineHeight: 20 },
  row: { flexDirection: "row", gap: 10 },
  stat: { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(35,41,36,0.08)", borderWidth: 1, borderRadius: 22, flexGrow: 1, minWidth: 150, padding: 16 },
  statTitle: { color: "#5d6a67", fontSize: 12, fontWeight: "700", marginBottom: 10 },
  statValue: { color: "#1f1d1a", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  inputWrap: { gap: 8 },
  label: { color: "#3d3226", fontSize: 14, fontWeight: "700" },
  input: { backgroundColor: "#fffaf2", borderColor: "#d9c9b6", borderWidth: 1, borderRadius: 16, color: "#241b14", fontSize: 16, paddingHorizontal: 16, paddingVertical: 15 },
  area: { minHeight: 112, textAlignVertical: "top" },
  btn: { alignItems: "center", backgroundColor: "#1f5eff", borderRadius: 16, paddingVertical: 16 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ghost: { alignItems: "center", backgroundColor: "#fff", borderColor: "#d8cab8", borderWidth: 1, borderRadius: 16, flex: 1, paddingVertical: 16 },
  ghostText: { color: "#2b221c", fontSize: 15, fontWeight: "700" },
  body: { color: "#6f665a", fontSize: 14, lineHeight: 22 },
  helper: { color: "#6f665a", fontSize: 13, lineHeight: 20 },
  error: { color: "#b42318", fontSize: 13, fontWeight: "700" },
  success: { color: "#16794b", fontSize: 13, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { backgroundColor: "#eef5f6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  chipActive: { backgroundColor: "#214e63" },
  chipText: { color: "#214e63", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  phrase: { backgroundColor: "#fffdf8", borderColor: "rgba(61,52,38,0.08)", borderWidth: 1, borderRadius: 18, padding: 14 },
  phraseEn: { color: "#1f1d1a", fontSize: 15, fontWeight: "800", marginBottom: 6 },
  replyBox: { backgroundColor: "#edf4f6", borderRadius: 18, padding: 14, gap: 6 },
  replyLabel: { color: "#5d6a67", fontSize: 12, fontWeight: "800" },
  history: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomColor: "rgba(71,61,53,0.08)", borderBottomWidth: 1, paddingVertical: 12, gap: 10 },
  link: { color: "#8f4f1f", fontSize: 14, fontWeight: "700" },
  flex: { flex: 1 },
  plan: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 8 },
  planActive: { backgroundColor: "#214e63", borderColor: "#214e63" },
  planName: { color: "#1f1d1a", fontSize: 20, fontWeight: "800" },
  planNameActive: { color: "#fff" },
  planPrice: { color: "#8f4f1f", fontSize: 28, fontWeight: "800" },
  planPriceActive: { color: "#ffe2b8" },
  planBodyActive: { color: "#d9ecf3" },
  videoBadge: { alignSelf: "flex-start", backgroundColor: "#f2d2aa", color: "#9b5d25", borderRadius: 999, overflow: "hidden", paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, fontWeight: "800" },
  // 廣告插頁樣式
  adOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  adModal: { backgroundColor: "#fff", borderRadius: 28, padding: 28, width: "90%", maxWidth: 440, gap: 14, alignItems: "center" },
  adTitle: { fontSize: 22, fontWeight: "800", color: "#1f1d1a" },
  adSubtitle: { fontSize: 14, color: "#6f665a", textAlign: "center", lineHeight: 22 },
  adSlot: { width: "100%", minHeight: 120, borderRadius: 18, overflow: "hidden", marginVertical: 8 },
  adCountdownBox: { backgroundColor: "#eef5f6", borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24 },
  adCountdownText: { fontSize: 18, fontWeight: "800", color: "#214e63", textAlign: "center" },
});
