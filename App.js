import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  AdMobBannerCard,
  getAdMobDebugInfo,
  initializeMobileAds,
  showRewardedCreditAd,
} from "./src/ads/admob";

const ENV_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const navItems = ["Home", "Lesson", "Practice", "Free Talk", "Review", "Plans", "Settings"];
const topics = ["Travel English", "Work Meetings", "Coffee Shop", "Small Talk", "Daily Life"];
const scenarios = [
  { id: "coffee", title: "Order at a coffee shop", opening: "Hi there. What can I get started for you today?", hint: "Ask for the size and finish politely with please." },
  { id: "hotel", title: "Check in at a hotel", opening: "Welcome. May I have your name and passport, please?", hint: "State your reservation name and number of nights clearly." },
  { id: "meeting", title: "Introduce yourself in a meeting", opening: "Before we begin, could you briefly introduce yourself?", hint: "Mention your role, your team, and one thing you are working on." },
];
const lessons = [
  {
    id: "intro",
    title: "Introduce yourself clearly",
    duration: "8 min",
    video: "Video lesson: self-introductions",
    summary: "Learn how to say your name, role, and interests before entering the speaking drill.",
    phrases: [
      ["Hi, I'm Tina. I work in marketing.", "自我介紹時先講名字與工作。"],
      ["In my free time, I like hiking.", "補上一句興趣讓對話更自然。"],
    ],
  },
  {
    id: "cafe",
    title: "Ordering coffee politely",
    duration: "10 min",
    video: "Video lesson: cafe ordering basics",
    summary: "Practice polite ordering, size choices, and short follow-up questions in a cafe.",
    phrases: [
      ["Can I get a medium latte, please?", "用 can I get... 是常見且自然的點餐說法。"],
      ["That's all for today, thank you.", "結尾加 thank you 讓語氣更完整。"],
    ],
  },
];
const plans = [
  { id: "free", name: "Free", price: "$0", features: ["3 AI sessions per day", "Starter lessons and limited topics", "Google AdMob supported experience"] },
  { id: "basic", name: "Basic", price: "$7.99", features: ["Ad-free experience", "Full starter course access", "Lower entry monthly price"] },
  { id: "premium", name: "Premium", price: "$14.99", features: ["Unlimited AI conversations", "Full course path", "Full correction details"] },
  { id: "plus", name: "Plus", price: "$24.99", features: ["More topics", "Deeper speaking feedback", "Priority support"] },
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("Sharon");
  const [goal, setGoal] = useState("Build daily speaking confidence");
  const [level, setLevel] = useState("Beginner");
  const [lessonId, setLessonId] = useState("intro");
  const [scenarioId, setScenarioId] = useState("coffee");
  const [practiceInput, setPracticeInput] = useState("");
  const [freeTopic, setFreeTopic] = useState("Travel English");
  const [freeInput, setFreeInput] = useState("");
  const [geminiKey, setGeminiKey] = useState(ENV_KEY);
  const [hintEnabled, setHintEnabled] = useState(true);
  const [accent, setAccent] = useState("US");
  const [speed, setSpeed] = useState("1x");
  const [plan, setPlan] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [error, setError] = useState("");
  const [adMessage, setAdMessage] = useState("");
  const [freeCredits, setFreeCredits] = useState(3);
  const [practiceMessages, setPracticeMessages] = useState([{ role: "assistant", text: scenarios[0].opening }]);
  const [freeMessages, setFreeMessages] = useState([{ role: "assistant", text: "Hi, I am your English speaking coach. Write one English message and I will continue the conversation." }]);
  const [feedback, setFeedback] = useState({ pronunciation: 82, grammar: 79, fluency: 77, correction: "Can I get a medium latte and a sandwich, please?", advice: ["Add a size to sound more natural in cafe conversations."] });
  const [history, setHistory] = useState([
    { title: "Order at a coffee shop", meta: "Today • 8 min • 4 corrections" },
    { title: "Check in at a hotel", meta: "Yesterday • 10 min • 6 corrections" },
  ]);

  const lesson = useMemo(() => lessons.find((item) => item.id === lessonId) ?? lessons[0], [lessonId]);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);
  const adMobInfo = useMemo(() => getAdMobDebugInfo(), []);

  useEffect(() => {
    initializeMobileAds().catch((e) => setAdMessage(e.message));
  }, []);

  async function askGemini(mode, userText, context) {
    if (!geminiKey.trim()) {
      return {
        reply: mode === "practice" ? "Sure. A medium latte and a sandwich will be ready soon." : "That sounds good. Tell me more about it.",
        correction: userText,
        pronunciation: 80,
        grammar: 78,
        fluency: 77,
        advice: ["Add EXPO_PUBLIC_GEMINI_API_KEY to use live Gemini responses.", "Without a key the app falls back to local demo responses."],
      };
    }

    const prompt = [
      "You are an English speaking coach inside a mobile app.",
      `Mode: ${mode}`,
      `Context: ${context}`,
      `Learner input: ${userText}`,
      'Return JSON only: {"reply":"...","correction":"...","pronunciation":0,"grammar":0,"fluency":0,"advice":["...","..."]}',
    ].join("\n");

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error (${res.status})`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned an empty response.");
    return JSON.parse(text);
  }

  async function submit(mode) {
    const input = mode === "practice" ? practiceInput.trim() : freeInput.trim();
    if (!input || loading) return;
    if (mode === "free" && plan === "free" && freeCredits <= 0) {
      setError("No free credits left. Watch a rewarded ad or upgrade your plan.");
      setScreen("Plans");
      return;
    }

    setError("");
    setLoading(true);
    if (mode === "practice") setPracticeMessages((prev) => [...prev, { role: "user", text: input }]);
    else {
      setFreeMessages((prev) => [...prev, { role: "user", text: input }]);
      if (plan === "free") setFreeCredits((prev) => Math.max(prev - 1, 0));
    }

    try {
      const result = await askGemini(mode, input, mode === "practice" ? scenario.title : freeTopic);
      const next = { role: "assistant", text: result.reply };
      if (mode === "practice") {
        setPracticeMessages((prev) => [...prev, next]);
        setPracticeInput("");
        setHistory((prev) => [{ title: scenario.title, meta: "Just now • 1 session • updated" }, ...prev.slice(0, 4)]);
      } else {
        setFreeMessages((prev) => [...prev, next]);
        setFreeInput("");
      }
      setFeedback({
        pronunciation: Number(result.pronunciation) || 0,
        grammar: Number(result.grammar) || 0,
        fluency: Number(result.fluency) || 0,
        correction: result.correction || input,
        advice: Array.isArray(result.advice) ? result.advice : [],
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRewardAd() {
    setRewardLoading(true);
    setError("");
    setAdMessage("");
    try {
      const reward = await showRewardedCreditAd();
      setFreeCredits((prev) => prev + 1);
      setAdMessage(`Reward granted: +${reward.amount} ${reward.type}. Free credits updated.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setRewardLoading(false);
    }
  }

  function renderWelcome() {
    return (
      <Screen>
        <HeroCard title="EnglishTalk MVP" subtitle="Speaking practice, guided lessons, free talk, review, pricing, and AdMob-backed free plan." />
        <Panel>
          <Title title="Profile setup" sub="Basic learner info for the demo app" />
          <Field label="Name" value={name} onChangeText={setName} placeholder="Sharon" />
          <Field label="Goal" value={goal} onChangeText={setGoal} placeholder="Build daily speaking confidence" />
          <Field label="Level" value={level} onChangeText={setLevel} placeholder="Beginner" />
          <Button label="Enter app" onPress={() => setScreen("Home")} />
        </Panel>
      </Screen>
    );
  }

  function renderHome() {
    return (
      <Screen>
        <HeroCard title={`Hi ${name}. Keep your English active today.`} subtitle={`Goal: ${goal} • Level: ${level} • Plan: ${plan}`} />
        <Grid>
          <Stat title="Weekly goal" value="4 / 5" text="One more session to hit your target." />
          <Stat title="Streak" value="12 days" text="A short session today keeps the streak alive." />
        </Grid>
        <Panel>
          <Title title="Continue lesson" sub={lesson.duration} />
          <Text style={styles.headline}>{lesson.title}</Text>
          <Text style={styles.body}>{lesson.summary}</Text>
          <Row>
            <Button label="Open lesson" onPress={() => setScreen("Lesson")} />
            <GhostButton label="Start practice" onPress={() => setScreen("Practice")} />
          </Row>
        </Panel>
      </Screen>
    );
  }

  function renderLesson() {
    return (
      <Screen>
        <HeroCard title={lesson.video} subtitle="Preview the teaching content before entering the speaking mission." />
        <Panel>
          <Title title="Lesson switcher" sub="Demo lesson selector" />
          <ChipRow values={lessons.map((item) => item.title)} active={lesson.title} onSelect={(title) => setLessonId(lessons.find((item) => item.title === title)?.id ?? "intro")} />
        </Panel>
        <Panel>
          <Title title={lesson.title} sub={lesson.duration} />
          <VideoCard title={lesson.video} time={lesson.duration} />
          <Text style={styles.body}>{lesson.summary}</Text>
          {lesson.phrases.map(([en, zh]) => <Phrase key={en} en={en} zh={zh} />)}
          <Button label="Go to speaking drill" onPress={() => setScreen("Practice")} />
        </Panel>
      </Screen>
    );
  }

  function renderPractice() {
    return (
      <Screen>
        <HeroCard title={scenario.title} subtitle="Guided speaking drill with transcript and feedback." />
        <Panel>
          <Title title="Scenario" sub="Switch between scripted speaking tasks" />
          <ChipRow
            values={scenarios.map((item) => item.title)}
            active={scenario.title}
            onSelect={(title) => {
              const next = scenarios.find((item) => item.title === title) ?? scenarios[0];
              setScenarioId(next.id);
              setPracticeMessages([{ role: "assistant", text: next.opening }]);
            }}
          />
          <Toggle label="Hints enabled" value={hintEnabled} onValueChange={setHintEnabled} />
          {hintEnabled ? <Tip text={scenario.hint} /> : null}
        </Panel>
        <Panel>
          <Title title="Conversation" sub="Type in English to simulate the flow" />
          <Chat messages={practiceMessages} />
          <Field label="Your reply" value={practiceInput} onChangeText={setPracticeInput} placeholder="Can I get a medium latte and a sandwich, please?" multiline />
          <Button label={loading ? "AI replying..." : "Send to Gemini"} onPress={() => submit("practice")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Panel>
        <Panel>
          <Title title="Live feedback" sub="Current coaching snapshot" />
          <Grid>
            <Score label="Pronunciation" value={feedback.pronunciation} />
            <Score label="Grammar" value={feedback.grammar} />
            <Score label="Fluency" value={feedback.fluency} />
          </Grid>
          <Phrase en="Suggested correction" zh={feedback.correction} />
          {feedback.advice.map((item) => <Bullet key={item} text={item} />)}
        </Panel>
      </Screen>
    );
  }

  function renderFreeTalk() {
    return (
      <Screen>
        <HeroCard title="Gemini Free Talk" subtitle="Open conversation mode with topic chips and speaking preferences." />
        <Panel>
          <Title title="Session settings" sub="Topic, accent, and speed" />
          <ChipRow values={topics} active={freeTopic} onSelect={setFreeTopic} />
          <Row>
            <GhostButton label={`Accent: ${accent}`} onPress={() => setAccent((v) => (v === "US" ? "UK" : "US"))} />
            <GhostButton label={`Speed: ${speed}`} onPress={() => setSpeed((v) => (v === "1x" ? "0.8x" : "1x"))} />
          </Row>
          {plan === "free" ? <InfoBanner title="Free credits" text={`You have ${freeCredits} free conversation credit(s) left today.`} /> : null}
        </Panel>
        <Panel>
          <Title title="Chat" sub={`Topic: ${freeTopic}`} />
          <Chat messages={freeMessages} />
          <Field label="Enter English text" value={freeInput} onChangeText={setFreeInput} placeholder="I want to practice English for my next trip." multiline />
          <Button label={loading ? "AI replying..." : "Send to Gemini"} onPress={() => submit("free")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Panel>
      </Screen>
    );
  }

  function renderReview() {
    return (
      <Screen>
        <HeroCard title="Review Center" subtitle="Conversation history and saved correction snapshots." />
        <Panel>
          <Title title="Recent sessions" sub="Most recent conversation items" />
          {history.map((item) => <History key={`${item.title}-${item.meta}`} title={item.title} meta={item.meta} />)}
        </Panel>
        <Panel>
          <Title title="Latest correction" sub="Quick review before the next session" />
          <Phrase en="Suggested correction" zh={feedback.correction} />
          {feedback.advice.map((item) => <Bullet key={item} text={item} />)}
        </Panel>
      </Screen>
    );
  }

  function renderPlans() {
    return (
      <Screen>
        <HeroCard title="Plans and trial" subtitle="Free / Basic / Premium / Plus, including AdMob-based rewarded credit flow." />
        {plans.map((item) => (
          <Pressable key={item.id} style={[styles.plan, plan === item.id && styles.planActive]} onPress={() => setPlan(item.id)}>
            <Text style={[styles.planName, plan === item.id && styles.planNameActive]}>{item.name}</Text>
            <Text style={[styles.planPrice, plan === item.id && styles.planPriceActive]}>{item.price}</Text>
            {item.features.map((feature) => <Bullet key={feature} text={feature} light={plan === item.id} />)}
          </Pressable>
        ))}
        <Panel>
          <Title title="Free plan ad credits" sub="Rewarded ads add one more free-talk credit" />
          <InfoBanner title="Current status" text={`Selected plan: ${plan}. Daily free credits remaining: ${freeCredits}.`} />
          {plan === "free" ? (
            <>
              <Button label={rewardLoading ? "Loading rewarded ad..." : "Watch Ad to Get +1 Credit"} onPress={handleRewardAd} />
              <AdMobBannerCard />
              <Text style={styles.helper}>Rewarded ads are only available in native development builds or production builds, not in Expo Go or web preview.</Text>
              {adMessage ? <Text style={styles.success}>{adMessage}</Text> : null}
            </>
          ) : (
            <InfoBanner title="Ad-free paid plans" text="Basic and above should suppress all AdMob placements in production." />
          )}
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>AdMob debug</Text>
            <Text style={styles.debugText}>{adMobInfo}</Text>
          </View>
        </Panel>
      </Screen>
    );
  }

  function renderSettings() {
    return (
      <Screen>
        <HeroCard title="Settings and API Keys" subtitle="Demo settings for profile, Gemini, and AdMob environment configuration." />
        <Panel>
          <Title title="Profile" sub="Basic learner settings" />
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Goal" value={goal} onChangeText={setGoal} placeholder="Your learning goal" />
          <Field label="Level" value={level} onChangeText={setLevel} placeholder="Your level" />
          <Field label="Gemini API Key" value={geminiKey} onChangeText={setGeminiKey} placeholder="EXPO_PUBLIC_GEMINI_API_KEY" secure />
          <Text style={styles.helper}>Put secrets in `.env` and do not commit real AdMob app IDs or Gemini keys to git.</Text>
        </Panel>
      </Screen>
    );
  }

  const content = screen === "welcome" ? renderWelcome() : screen === "Home" ? renderHome() : screen === "Lesson" ? renderLesson() : screen === "Practice" ? renderPractice() : screen === "Free Talk" ? renderFreeTalk() : screen === "Review" ? renderReview() : screen === "Plans" ? renderPlans() : renderSettings();

  return (
    <LinearGradient colors={["#f7efe4", "#eee1ce", "#d5dddf"]} style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <View style={styles.top}>
            <View>
              <Text style={styles.brand}>EnglishTalk MVP</Text>
              <Text style={styles.sub}>Lesson flow, AI practice, pricing, and AdMob free-plan prototype.</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>7 screens</Text>
            </View>
          </View>
          {screen !== "welcome" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nav} contentContainerStyle={styles.navContent}>
              {navItems.map((item) => (
                <Pressable key={item} style={[styles.navChip, screen === item && styles.navChipActive]} onPress={() => setScreen(item)}>
                  <Text style={[styles.navText, screen === item && styles.navTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {content}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Screen({ children }) { return <View style={styles.screen}>{children}</View>; }
function Panel({ children }) { return <View style={styles.panel}>{children}</View>; }
function Row({ children }) { return <View style={styles.row}>{children}</View>; }
function Grid({ children }) { return <View style={styles.grid}>{children}</View>; }
function HeroCard({ title, subtitle }) { return <LinearGradient colors={["#15344f", "#275c74"]} style={styles.hero}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroSub}>{subtitle}</Text></LinearGradient>; }
function Title({ title, sub }) { return <View style={styles.g8}><Text style={styles.title}>{title}</Text><Text style={styles.subTitle}>{sub}</Text></View>; }
function Field({ label, value, onChangeText, placeholder, secure, multiline }) { return <View style={styles.g8}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#8f8577" secureTextEntry={secure} multiline={multiline} numberOfLines={multiline ? 4 : 1} style={[styles.input, multiline && styles.area]} /></View>; }
function Button({ label, onPress }) { return <Pressable style={styles.btn} onPress={onPress}><Text style={styles.btnText}>{label}</Text></Pressable>; }
function GhostButton({ label, onPress }) { return <Pressable style={styles.ghost} onPress={onPress}><Text style={styles.ghostText}>{label}</Text></Pressable>; }
function Stat({ title, value, text }) { return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardValue}>{value}</Text><Text style={styles.cardText}>{text}</Text></View>; }
function Phrase({ en, zh }) { return <View style={styles.phrase}><Text style={styles.phraseEn}>{en}</Text><Text style={styles.phraseZh}>{zh}</Text></View>; }
function Score({ label, value }) { return <View style={styles.score}><Text style={styles.scoreValue}>{value}</Text><Text style={styles.scoreLabel}>{label}</Text></View>; }
function Tip({ text }) { return <View style={styles.tip}><Text style={styles.tipTitle}>Hint</Text><Text style={styles.tipText}>{text}</Text></View>; }
function Bullet({ text, light }) { return <Text style={[styles.bullet, light && styles.bulletLight]}>- {text}</Text>; }
function Toggle({ label, value, onValueChange }) { return <View style={styles.toggle}><Text style={styles.label}>{label}</Text><Switch value={value} onValueChange={onValueChange} /></View>; }
function ChipRow({ values, active, onSelect }) { return <View style={styles.chips}>{values.map((value) => <Pressable key={value} style={[styles.topic, active === value && styles.topicActive]} onPress={() => onSelect?.(value)}><Text style={[styles.topicText, active === value && styles.topicTextActive]}>{value}</Text></Pressable>)}</View>; }
function VideoCard({ title, time }) { return <LinearGradient colors={["#f2d2aa", "#d49d65"]} style={styles.video}><View style={styles.play}><Text style={styles.playText}>Play</Text></View><View style={styles.flex}><Text style={styles.videoTitle}>{title}</Text><Text style={styles.videoTime}>{time}</Text></View></LinearGradient>; }
function Chat({ messages }) { return <View style={styles.g12}>{messages.map((item, i) => <View key={`${item.role}-${i}`} style={[styles.bubble, item.role === "user" ? styles.user : styles.ai]}><Text style={styles.bubbleRole}>{item.role === "user" ? "You" : "AI Coach"}</Text><Text style={styles.bubbleText}>{item.text}</Text></View>)}</View>; }
function History({ title, meta }) { return <View style={styles.history}><View style={styles.flex}><Text style={styles.historyTitle}>{title}</Text><Text style={styles.historyMeta}>{meta}</Text></View><Text style={styles.link}>Open</Text></View>; }
function InfoBanner({ title, text }) { return <View style={styles.infoBanner}><Text style={styles.infoBannerTitle}>{title}</Text><Text style={styles.infoBannerText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  root: { flex: 1 }, shell: { flex: 1, paddingHorizontal: 18, paddingTop: 12 }, top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, brand: { color: "#32453f", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 }, sub: { color: "#68736e", fontSize: 12, marginTop: 4, maxWidth: 320 }, pill: { backgroundColor: "rgba(255,255,255,0.7)", borderColor: "rgba(50,69,63,0.1)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, pillText: { color: "#32453f", fontSize: 12, fontWeight: "700" },
  nav: { flexGrow: 0, marginBottom: 16 }, navContent: { gap: 10, paddingRight: 12 }, navChip: { backgroundColor: "rgba(255,251,245,0.78)", borderColor: "rgba(49,69,63,0.08)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }, navChipActive: { backgroundColor: "#214e63" }, navText: { color: "#546560", fontSize: 13, fontWeight: "700" }, navTextActive: { color: "#fff" },
  scroll: { flex: 1 }, scrollContent: { paddingBottom: 36 }, screen: { gap: 16 }, panel: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 14 }, row: { flexDirection: "row", gap: 10 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, flex: { flex: 1 }, g8: { gap: 8 }, g12: { gap: 12 },
  hero: { borderRadius: 28, padding: 24 }, heroTitle: { color: "#f8fbfd", fontSize: 30, fontWeight: "800", lineHeight: 36, marginBottom: 12 }, heroSub: { color: "#d7e7ee", fontSize: 15, lineHeight: 23 }, title: { color: "#1f1d1a", fontSize: 22, fontWeight: "800" }, subTitle: { color: "#726a60", fontSize: 13, lineHeight: 20 }, headline: { color: "#1f1d1a", fontSize: 20, fontWeight: "800" }, body: { color: "#6f665a", fontSize: 14, lineHeight: 22 },
  label: { color: "#3d3226", fontSize: 14, fontWeight: "700" }, input: { backgroundColor: "#fffaf2", borderColor: "#d9c9b6", borderWidth: 1, borderRadius: 16, color: "#241b14", fontSize: 16, paddingHorizontal: 16, paddingVertical: 15 }, area: { minHeight: 112, textAlignVertical: "top" }, btn: { alignItems: "center", backgroundColor: "#1f5eff", borderRadius: 16, flex: 1, paddingVertical: 16 }, btnText: { color: "#fff", fontSize: 16, fontWeight: "800" }, ghost: { alignItems: "center", backgroundColor: "#fff", borderColor: "#d8cab8", borderWidth: 1, borderRadius: 16, flex: 1, paddingVertical: 16 }, ghostText: { color: "#2b221c", fontSize: 15, fontWeight: "700" },
  card: { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(35,41,36,0.08)", borderWidth: 1, borderRadius: 22, flexGrow: 1, minWidth: 150, padding: 16 }, cardTitle: { color: "#5d6a67", fontSize: 12, fontWeight: "700", marginBottom: 10 }, cardValue: { color: "#1f1d1a", fontSize: 24, fontWeight: "800", marginBottom: 8 }, cardText: { color: "#71695f", fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, topic: { backgroundColor: "#eef5f6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 }, topicActive: { backgroundColor: "#214e63" }, topicText: { color: "#214e63", fontSize: 13, fontWeight: "700" }, topicTextActive: { color: "#fff" },
  video: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 22, padding: 18 }, play: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, width: 52, height: 52 }, playText: { color: "#9b5d25", fontSize: 12, fontWeight: "800" }, videoTitle: { color: "#37261a", fontSize: 17, fontWeight: "800", marginBottom: 4 }, videoTime: { color: "#5d4836", fontSize: 13, fontWeight: "700" },
  phrase: { backgroundColor: "#fffdf8", borderColor: "rgba(61,52,38,0.08)", borderWidth: 1, borderRadius: 18, padding: 14 }, phraseEn: { color: "#1f1d1a", fontSize: 15, fontWeight: "800", marginBottom: 6 }, phraseZh: { color: "#6f665a", fontSize: 13, lineHeight: 19 },
  tip: { backgroundColor: "#f7fbff", borderColor: "rgba(31,94,255,0.12)", borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 }, tipTitle: { color: "#1f5eff", fontSize: 15, fontWeight: "800" }, tipText: { color: "#4a607d", fontSize: 13, lineHeight: 21 },
  bubble: { borderRadius: 22, padding: 16 }, ai: { backgroundColor: "#edf4f6" }, user: { backgroundColor: "#fff4e7" }, bubbleRole: { color: "#5d6a67", fontSize: 12, fontWeight: "800", marginBottom: 6 }, bubbleText: { color: "#1f1d1a", fontSize: 15, lineHeight: 22 },
  score: { backgroundColor: "#fffaf3", borderColor: "rgba(41,36,28,0.08)", borderWidth: 1, borderRadius: 20, flexGrow: 1, minWidth: 110, padding: 16 }, scoreValue: { color: "#214e63", fontSize: 28, fontWeight: "800", marginBottom: 6 }, scoreLabel: { color: "#6f665a", fontSize: 13, fontWeight: "700" },
  bullet: { color: "#4a607d", fontSize: 13, lineHeight: 21 }, bulletLight: { color: "#d9ecf3" }, toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "rgba(71,61,53,0.08)", borderBottomWidth: 1, paddingVertical: 14 },
  history: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "rgba(71,61,53,0.08)", borderBottomWidth: 1, paddingVertical: 12 }, historyTitle: { color: "#1f1d1a", fontSize: 15, fontWeight: "800" }, historyMeta: { color: "#6f665a", fontSize: 13, marginTop: 4 }, link: { color: "#8f4f1f", fontSize: 14, fontWeight: "700" },
  plan: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 8 }, planActive: { backgroundColor: "#214e63", borderColor: "#214e63" }, planName: { color: "#1f1d1a", fontSize: 20, fontWeight: "800" }, planNameActive: { color: "#fff" }, planPrice: { color: "#8f4f1f", fontSize: 28, fontWeight: "800" }, planPriceActive: { color: "#ffe2b8" },
  helper: { color: "#6f665a", fontSize: 13, lineHeight: 20 }, error: { color: "#b42318", fontSize: 13, fontWeight: "700" }, success: { color: "#16794b", fontSize: 13, fontWeight: "700" },
  infoBanner: { backgroundColor: "#eef5f6", borderRadius: 18, padding: 14, gap: 6 }, infoBannerTitle: { color: "#214e63", fontSize: 14, fontWeight: "800" }, infoBannerText: { color: "#46616c", fontSize: 13, lineHeight: 20 },
  debugBox: { borderColor: "rgba(75,70,58,0.1)", borderWidth: 1, borderRadius: 18, padding: 14, gap: 6 }, debugTitle: { color: "#1f1d1a", fontSize: 14, fontWeight: "800" }, debugText: { color: "#6f665a", fontSize: 12, lineHeight: 18 },
});
