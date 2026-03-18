import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

const ENV_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const navItems = ["首頁", "課程", "練習", "自由對話", "複習", "方案", "設定"];
const topics = ["旅遊英文", "職場會議", "餐廳點餐", "機場通關", "日常聊天"];
const scenarios = [
  { id: "coffee", title: "咖啡店點餐", opening: "Hi there. What can I get started for you today?", hint: "先說飲料，再補尺寸與餐點。" },
  { id: "hotel", title: "飯店入住", opening: "Welcome. May I have your name and passport, please?", hint: "先說你有訂房，再問入住需求。" },
  { id: "meeting", title: "會議自介", opening: "Before we begin, could you briefly introduce yourself?", hint: "姓名、職稱、今天目的。" },
];
const lessons = [
  {
    id: "intro",
    title: "自我介紹與破冰",
    duration: "8 分鐘",
    video: "影片課程：3 句完成自我介紹",
    summary: "影片教學維持靜態課程，不串 AI。先理解句型，再進入口說練習。",
    phrases: [
      ["Hi, I'm Tina. I work in marketing.", "嗨，我是 Tina。我在行銷部門工作。"],
      ["In my free time, I like hiking.", "我空閒時喜歡健行。"],
    ],
  },
  {
    id: "cafe",
    title: "在咖啡店點餐",
    duration: "10 分鐘",
    video: "影片課程：禮貌點餐的 4 個句型",
    summary: "學會飲料、尺寸、加點與收尾。",
    phrases: [
      ["Can I get a medium latte, please?", "我可以點一杯中杯拿鐵嗎？"],
      ["That's all for today, thank you.", "今天這樣就可以了，謝謝。"],
    ],
  },
];
const plans = [
  { id: "basic", name: "Basic", price: "$0", features: ["每日 3 次 AI 練習", "基礎課程預覽", "簡易回饋"] },
  { id: "premium", name: "Premium", price: "$14.99", features: ["不限次數 AI 對話", "完整課程", "完整文法建議"] },
  { id: "plus", name: "Plus", price: "$24.99", features: ["更多主題", "更深入回饋", "優先客服"] },
];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [name, setName] = useState("Sharon");
  const [goal, setGoal] = useState("旅遊與日常口說");
  const [level, setLevel] = useState("新手");
  const [lessonId, setLessonId] = useState("intro");
  const [scenarioId, setScenarioId] = useState("coffee");
  const [practiceInput, setPracticeInput] = useState("");
  const [freeTopic, setFreeTopic] = useState("旅遊英文");
  const [freeInput, setFreeInput] = useState("");
  const [geminiKey, setGeminiKey] = useState(ENV_KEY);
  const [hintEnabled, setHintEnabled] = useState(true);
  const [accent, setAccent] = useState("美式");
  const [speed, setSpeed] = useState("1x");
  const [plan, setPlan] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [practiceMessages, setPracticeMessages] = useState([{ role: "assistant", text: scenarios[0].opening }]);
  const [freeMessages, setFreeMessages] = useState([{ role: "assistant", text: "嗨，我是你的英文口說教練。直接輸入英文句子，我會接話並給中文回饋。" }]);
  const [feedback, setFeedback] = useState({
    pronunciation: 82,
    grammar: 79,
    fluency: 77,
    correction: "Can I get a medium latte and a sandwich, please?",
    advice: ["句子已清楚，但可以補上尺寸與禮貌結尾。"],
  });
  const [history, setHistory] = useState([
    { title: "咖啡店點餐", meta: "今天 - 8 分鐘 - 4 則回饋" },
    { title: "飯店入住", meta: "昨天 - 10 分鐘 - 6 則回饋" },
  ]);

  const lesson = useMemo(() => lessons.find((item) => item.id === lessonId) ?? lessons[0], [lessonId]);
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0], [scenarioId]);

  async function askGemini(mode, userText, context) {
    if (!geminiKey.trim()) {
      return {
        reply: mode === "practice" ? "示範回覆：Sure. A medium latte and a sandwich will be ready soon." : "示範回覆：That sounds great. Tell me more about it.",
        correction: userText,
        pronunciation: 80,
        grammar: 78,
        fluency: 77,
        advice: ["目前未輸入 Gemini API Key，所以這是本機示範結果。", "到設定頁輸入 Key 或用 EXPO_PUBLIC_GEMINI_API_KEY 載入後，就會改用 Gemini。"],
      };
    }
    const prompt = [
      "你是一個給繁體中文使用者學英文口說的 AI 教練。",
      `模式：${mode}`,
      `情境：${context}`,
      `使用者輸入：${userText}`,
      '請只輸出 JSON：{"reply":"...","correction":"...","pronunciation":0,"grammar":0,"fluency":0,"advice":["...","..."]}',
    ].join("\n");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey.trim())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) throw new Error(`Gemini API 失敗 (${res.status})`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini 沒有回傳內容");
    return JSON.parse(text);
  }

  async function submit(mode) {
    const input = mode === "practice" ? practiceInput.trim() : freeInput.trim();
    if (!input || loading) return;
    setError("");
    setLoading(true);
    if (mode === "practice") setPracticeMessages((prev) => [...prev, { role: "user", text: input }]);
    else setFreeMessages((prev) => [...prev, { role: "user", text: input }]);
    try {
      const result = await askGemini(mode, input, mode === "practice" ? scenario.title : freeTopic);
      const next = { role: "assistant", text: result.reply };
      if (mode === "practice") {
        setPracticeMessages((prev) => [...prev, next]);
        setPracticeInput("");
        setHistory((prev) => [{ title: scenario.title, meta: "剛剛 - 已更新回饋" }, ...prev.slice(0, 4)]);
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

  function renderWelcome() {
    return (
      <Screen>
        <HeroCard title="英文口說學習 App MVP" subtitle="依功能清單實作的可操作原型，包含課程、影片、情境練習、Gemini 自由對話、複習、方案與設定。" />
        <Panel>
          <Title title="開始設定" sub="先用中文完成個人化設定" />
          <Field label="名字" value={name} onChangeText={setName} placeholder="例如：Sharon" />
          <Field label="學習目標" value={goal} onChangeText={setGoal} placeholder="例如：旅遊與日常口說" />
          <Field label="目前程度" value={level} onChangeText={setLevel} placeholder="例如：新手" />
          <Button label="進入學習首頁" onPress={() => setScreen("首頁")} />
        </Panel>
      </Screen>
    );
  }

  function renderHome() {
    return (
      <Screen>
        <HeroCard title={`嗨，${name}。今天繼續把英文說出口。`} subtitle={`目標：${goal} ｜ 程度：${level} ｜ 方案：${plan}`} />
        <Grid>
          <Stat title="本週進度" value="4 / 5" text="再完成一次練習就達標。" />
          <Stat title="連續學習" value="12 天" text="今天繼續練，就能延續 streak。" />
        </Grid>
        <Panel>
          <Title title="下一個推薦課程" sub={lesson.duration} />
          <Text style={styles.headline}>{lesson.title}</Text>
          <Text style={styles.body}>{lesson.summary}</Text>
          <Row>
            <Button label="前往課程" onPress={() => setScreen("課程")} />
            <GhostButton label="開始練習" onPress={() => setScreen("練習")} />
          </Row>
        </Panel>
      </Screen>
    );
  }

  function renderLesson() {
    return (
      <Screen>
        <HeroCard title={lesson.video} subtitle="影片教學頁不使用 AI，維持靜態內容與句型說明。" />
        <Panel>
          <Title title="課程列表" sub="切換單元" />
          <ChipRow values={lessons.map((item) => item.title)} active={lesson.title} onSelect={(title) => setLessonId(lessons.find((item) => item.title === title)?.id ?? "intro")} />
        </Panel>
        <Panel>
          <Title title={lesson.title} sub={lesson.duration} />
          <VideoCard title={lesson.video} time={lesson.duration} />
          <Text style={styles.body}>{lesson.summary}</Text>
          {lesson.phrases.map(([en, zh]) => <Phrase key={en} en={en} zh={zh} />)}
          <Button label="用這個主題開始練習" onPress={() => setScreen("練習")} />
        </Panel>
      </Screen>
    );
  }

  function renderPractice() {
    return (
      <Screen>
        <HeroCard title={scenario.title} subtitle="情境口說練習，先用文字模擬 STT/TTS 流程。" />
        <Panel>
          <Title title="情境切換" sub="切換後會重置對話" />
          <ChipRow values={scenarios.map((item) => item.title)} active={scenario.title} onSelect={(title) => {
            const next = scenarios.find((item) => item.title === title) ?? scenarios[0];
            setScenarioId(next.id);
            setPracticeMessages([{ role: "assistant", text: next.opening }]);
          }} />
          <Toggle label="開啟提示" value={hintEnabled} onValueChange={setHintEnabled} />
          {hintEnabled ? <Tip text={scenario.hint} /> : null}
        </Panel>
        <Panel>
          <Title title="對話內容" sub="輸入你的英文回答" />
          <Chat messages={practiceMessages} />
          <Field label="你的英文回答" value={practiceInput} onChangeText={setPracticeInput} placeholder="例如：Can I get a medium latte and a sandwich, please?" multiline />
          <Button label={loading ? "AI 回覆中..." : "送出並取得回饋"} onPress={() => submit("practice")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Panel>
        <Panel>
          <Title title="即時回饋" sub="用中文說明這次表現" />
          <Grid>
            <Score label="發音" value={feedback.pronunciation} />
            <Score label="文法" value={feedback.grammar} />
            <Score label="流暢度" value={feedback.fluency} />
          </Grid>
          <Phrase en="建議修正" zh={feedback.correction} />
          {feedback.advice.map((item) => <Bullet key={item} text={item} />)}
        </Panel>
      </Screen>
    );
  }

  function renderFreeTalk() {
    return (
      <Screen>
        <HeroCard title="Gemini 自由對話" subtitle="開放式聊天練習與延伸表達。" />
        <Panel>
          <Title title="聊天設定" sub="切換主題、口音與語速" />
          <ChipRow values={topics} active={freeTopic} onSelect={setFreeTopic} />
          <Row>
            <GhostButton label={`口音：${accent}`} onPress={() => setAccent((v) => (v === "美式" ? "英式" : "美式"))} />
            <GhostButton label={`語速：${speed}`} onPress={() => setSpeed((v) => (v === "1x" ? "0.8x" : "1x"))} />
          </Row>
        </Panel>
        <Panel>
          <Title title="聊天區" sub={`主題：${freeTopic}`} />
          <Chat messages={freeMessages} />
          <Field label="輸入英文內容" value={freeInput} onChangeText={setFreeInput} placeholder="例如：I want to practice English for my next trip." multiline />
          <Button label={loading ? "AI 回覆中..." : "送出到 Gemini"} onPress={() => submit("free")} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Panel>
      </Screen>
    );
  }

  function renderReview() {
    return (
      <Screen>
        <HeroCard title="複習中心" subtitle="整理歷史練習、回饋與修正句。" />
        <Panel>
          <Title title="最近紀錄" sub="目前先以前端狀態保存" />
          {history.map((item) => <History key={`${item.title}-${item.meta}`} title={item.title} meta={item.meta} />)}
        </Panel>
        <Panel>
          <Title title="最新修正句" sub="最近一次 AI 回饋摘要" />
          <Phrase en="修正後句子" zh={feedback.correction} />
          {feedback.advice.map((item) => <Bullet key={item} text={item} />)}
        </Panel>
      </Screen>
    );
  }

  function renderPlans() {
    return (
      <Screen>
        <HeroCard title="方案與試用" subtitle="對應 Basic / Premium / Plus 與 7 天試用。" />
        {plans.map((item) => (
          <Pressable key={item.id} style={[styles.plan, plan === item.id && styles.planActive]} onPress={() => setPlan(item.id)}>
            <Text style={[styles.planName, plan === item.id && styles.planNameActive]}>{item.name}</Text>
            <Text style={[styles.planPrice, plan === item.id && styles.planPriceActive]}>{item.price}</Text>
            {item.features.map((feature) => <Bullet key={feature} text={feature} light={plan === item.id} />)}
          </Pressable>
        ))}
      </Screen>
    );
  }

  function renderSettings() {
    return (
      <Screen>
        <HeroCard title="設定與 Gemini API Key" subtitle="我沒有把你提供的真實 key 寫死在前端原始碼裡；這裡支援手動輸入，或從 EXPO_PUBLIC_GEMINI_API_KEY 載入。" />
        <Panel>
          <Title title="個人設定" sub="可直接修改前端狀態" />
          <Field label="名字" value={name} onChangeText={setName} placeholder="你的名字" />
          <Field label="學習目標" value={goal} onChangeText={setGoal} placeholder="你的學習目標" />
          <Field label="程度" value={level} onChangeText={setLevel} placeholder="你的程度" />
          <Field label="Gemini API Key" value={geminiKey} onChangeText={setGeminiKey} placeholder="貼上你自己的 Gemini API Key" secure />
          <Text style={styles.helper}>建議把 key 放在本機 `.env`，變數名稱使用 `EXPO_PUBLIC_GEMINI_API_KEY`，不要把真實 key 提交到 Git。</Text>
        </Panel>
      </Screen>
    );
  }

  const content = screen === "welcome" ? renderWelcome()
    : screen === "首頁" ? renderHome()
    : screen === "課程" ? renderLesson()
    : screen === "練習" ? renderPractice()
    : screen === "自由對話" ? renderFreeTalk()
    : screen === "複習" ? renderReview()
    : screen === "方案" ? renderPlans()
    : renderSettings();

  return (
    <LinearGradient colors={["#f7efe4", "#eee1ce", "#d5dddf"]} style={styles.root}>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <View style={styles.top}>
            <View>
              <Text style={styles.brand}>英文口說教練 MVP</Text>
              <Text style={styles.sub}>結構化課程、影片教學、情境練習、Gemini 自由對話</Text>
            </View>
            <View style={styles.pill}><Text style={styles.pillText}>7 個模組</Text></View>
          </View>
          {screen !== "welcome" ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nav} contentContainerStyle={styles.navContent}>
            {navItems.map((item) => <Pressable key={item} style={[styles.navChip, screen === item && styles.navChipActive]} onPress={() => setScreen(item)}><Text style={[styles.navText, screen === item && styles.navTextActive]}>{item}</Text></Pressable>)}
          </ScrollView> : null}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
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
function Tip({ text }) { return <View style={styles.tip}><Text style={styles.tipTitle}>提示</Text><Text style={styles.tipText}>{text}</Text></View>; }
function Bullet({ text, light }) { return <Text style={[styles.bullet, light && styles.bulletLight]}>- {text}</Text>; }
function Toggle({ label, value, onValueChange }) { return <View style={styles.toggle}><Text style={styles.label}>{label}</Text><Switch value={value} onValueChange={onValueChange} /></View>; }
function ChipRow({ values, active, onSelect }) { return <View style={styles.chips}>{values.map((value) => <Pressable key={value} style={[styles.topic, active === value && styles.topicActive]} onPress={() => onSelect?.(value)}><Text style={[styles.topicText, active === value && styles.topicTextActive]}>{value}</Text></Pressable>)}</View>; }
function VideoCard({ title, time }) { return <LinearGradient colors={["#f2d2aa", "#d49d65"]} style={styles.video}><View style={styles.play}><Text style={styles.playText}>播放</Text></View><View style={styles.flex}><Text style={styles.videoTitle}>{title}</Text><Text style={styles.videoTime}>{time}</Text></View></LinearGradient>; }
function Chat({ messages }) { return <View style={styles.g12}>{messages.map((item, i) => <View key={`${item.role}-${i}`} style={[styles.bubble, item.role === "user" ? styles.user : styles.ai]}><Text style={styles.bubbleRole}>{item.role === "user" ? "你" : "AI 教練"}</Text><Text style={styles.bubbleText}>{item.text}</Text></View>)}</View>; }
function History({ title, meta }) { return <View style={styles.history}><View style={styles.flex}><Text style={styles.historyTitle}>{title}</Text><Text style={styles.historyMeta}>{meta}</Text></View><Text style={styles.link}>查看</Text></View>; }

const styles = StyleSheet.create({
  root: { flex: 1 }, shell: { flex: 1, paddingHorizontal: 18, paddingTop: 12 }, top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, brand: { color: "#32453f", fontSize: 13, fontWeight: "800", letterSpacing: 1.2 }, sub: { color: "#68736e", fontSize: 12, marginTop: 4, maxWidth: 320 }, pill: { backgroundColor: "rgba(255,255,255,0.7)", borderColor: "rgba(50,69,63,0.1)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, pillText: { color: "#32453f", fontSize: 12, fontWeight: "700" },
  nav: { flexGrow: 0, marginBottom: 16 }, navContent: { gap: 10, paddingRight: 12 }, navChip: { backgroundColor: "rgba(255,251,245,0.78)", borderColor: "rgba(49,69,63,0.08)", borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }, navChipActive: { backgroundColor: "#214e63" }, navText: { color: "#546560", fontSize: 13, fontWeight: "700" }, navTextActive: { color: "#fff" },
  scroll: { flex: 1 }, scrollContent: { paddingBottom: 36 }, screen: { gap: 16 }, panel: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 14 }, row: { flexDirection: "row", gap: 10 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, flex: { flex: 1 }, g8: { gap: 8 }, g12: { gap: 12 },
  hero: { borderRadius: 28, padding: 24 }, heroTitle: { color: "#f8fbfd", fontSize: 30, fontWeight: "800", lineHeight: 36, marginBottom: 12 }, heroSub: { color: "#d7e7ee", fontSize: 15, lineHeight: 23 }, title: { color: "#1f1d1a", fontSize: 22, fontWeight: "800" }, subTitle: { color: "#726a60", fontSize: 13, lineHeight: 20 }, headline: { color: "#1f1d1a", fontSize: 20, fontWeight: "800" }, body: { color: "#6f665a", fontSize: 14, lineHeight: 22 },
  label: { color: "#3d3226", fontSize: 14, fontWeight: "700" }, input: { backgroundColor: "#fffaf2", borderColor: "#d9c9b6", borderWidth: 1, borderRadius: 16, color: "#241b14", fontSize: 16, paddingHorizontal: 16, paddingVertical: 15 }, area: { minHeight: 112, textAlignVertical: "top" }, btn: { alignItems: "center", backgroundColor: "#1f5eff", borderRadius: 16, flex: 1, paddingVertical: 16 }, btnText: { color: "#fff", fontSize: 16, fontWeight: "800" }, ghost: { alignItems: "center", backgroundColor: "#fff", borderColor: "#d8cab8", borderWidth: 1, borderRadius: 16, flex: 1, paddingVertical: 16 }, ghostText: { color: "#2b221c", fontSize: 15, fontWeight: "700" },
  card: { backgroundColor: "rgba(255,255,255,0.72)", borderColor: "rgba(35,41,36,0.08)", borderWidth: 1, borderRadius: 22, flexGrow: 1, minWidth: 150, padding: 16 }, cardTitle: { color: "#5d6a67", fontSize: 12, fontWeight: "700", marginBottom: 10 }, cardValue: { color: "#1f1d1a", fontSize: 24, fontWeight: "800", marginBottom: 8 }, cardText: { color: "#71695f", fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, topic: { backgroundColor: "#eef5f6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 }, topicActive: { backgroundColor: "#214e63" }, topicText: { color: "#214e63", fontSize: 13, fontWeight: "700" }, topicTextActive: { color: "#fff" },
  video: { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 22, padding: 18 }, play: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, width: 52, height: 52 }, playText: { color: "#9b5d25", fontSize: 15, fontWeight: "800" }, videoTitle: { color: "#37261a", fontSize: 17, fontWeight: "800", marginBottom: 4 }, videoTime: { color: "#5d4836", fontSize: 13, fontWeight: "700" },
  phrase: { backgroundColor: "#fffdf8", borderColor: "rgba(61,52,38,0.08)", borderWidth: 1, borderRadius: 18, padding: 14 }, phraseEn: { color: "#1f1d1a", fontSize: 15, fontWeight: "800", marginBottom: 6 }, phraseZh: { color: "#6f665a", fontSize: 13, lineHeight: 19 },
  tip: { backgroundColor: "#f7fbff", borderColor: "rgba(31,94,255,0.12)", borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 }, tipTitle: { color: "#1f5eff", fontSize: 15, fontWeight: "800" }, tipText: { color: "#4a607d", fontSize: 13, lineHeight: 21 },
  bubble: { borderRadius: 22, padding: 16 }, ai: { backgroundColor: "#edf4f6" }, user: { backgroundColor: "#fff4e7" }, bubbleRole: { color: "#5d6a67", fontSize: 12, fontWeight: "800", marginBottom: 6 }, bubbleText: { color: "#1f1d1a", fontSize: 15, lineHeight: 22 },
  score: { backgroundColor: "#fffaf3", borderColor: "rgba(41,36,28,0.08)", borderWidth: 1, borderRadius: 20, flexGrow: 1, minWidth: 110, padding: 16 }, scoreValue: { color: "#214e63", fontSize: 28, fontWeight: "800", marginBottom: 6 }, scoreLabel: { color: "#6f665a", fontSize: 13, fontWeight: "700" },
  bullet: { color: "#4a607d", fontSize: 13, lineHeight: 21 }, bulletLight: { color: "#d9ecf3" }, toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "rgba(71,61,53,0.08)", borderBottomWidth: 1, paddingVertical: 14 },
  history: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomColor: "rgba(71,61,53,0.08)", borderBottomWidth: 1, paddingVertical: 12 }, historyTitle: { color: "#1f1d1a", fontSize: 15, fontWeight: "800" }, historyMeta: { color: "#6f665a", fontSize: 13, marginTop: 4 }, link: { color: "#8f4f1f", fontSize: 14, fontWeight: "700" },
  plan: { backgroundColor: "rgba(255,250,244,0.92)", borderColor: "rgba(75,70,58,0.08)", borderWidth: 1, borderRadius: 24, padding: 18, gap: 8 }, planActive: { backgroundColor: "#214e63", borderColor: "#214e63" }, planName: { color: "#1f1d1a", fontSize: 20, fontWeight: "800" }, planNameActive: { color: "#fff" }, planPrice: { color: "#8f4f1f", fontSize: 28, fontWeight: "800" }, planPriceActive: { color: "#ffe2b8" },
  helper: { color: "#6f665a", fontSize: 13, lineHeight: 20 }, error: { color: "#b42318", fontSize: 13, fontWeight: "700" },
});
