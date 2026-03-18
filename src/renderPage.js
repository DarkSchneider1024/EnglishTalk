import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const lessonCards = [
  ["職場閒聊", "單元 04 - 12 分鐘", "繼續學習"],
  ["禮貌點咖啡", "單元 05 - 8 分鐘", "已完成"],
  ["飯店入住會話", "單元 06 - 10 分鐘", "尚未解鎖"],
];

const topicPills = ["旅遊", "工作", "約會", "日常生活", "學校", "面試"];

export function renderPage(activePage) {
  return <PageRouter activePage={activePage} />;
}

function PageRouter({ activePage }) {
  const [hintEnabled, setHintEnabled] = useState(true);

  switch (activePage) {
    case "welcome":
      return (
        <Screen>
          <HeroCard
            eyebrow="AI 英文口說教練"
            title="用循序引導的口說練習，逐步建立每天開口說英文的信心。"
            description="歡迎與新手導覽頁，介紹課程架構、學習目標與試用轉換。"
          />
          <Grid>
            <InfoTile
              title="引導式課程"
              value="120+"
              caption="從初學到中階的系統化英文口說練習。"
            />
            <InfoTile
              title="即時回饋"
              value="立即"
              caption="練習時同步提供發音與文法提示。"
            />
          </Grid>
          <Panel>
            <SectionTitle title="新手開始流程" subtitle="第一次使用時的導覽步驟" />
            <StepRow number="01" title="選擇你的目標" copy="旅遊、工作、學校，或單純想更敢開口說英文。" />
            <StepRow number="02" title="完成快速程度測驗" copy="先判斷起始程度，再安排適合的課程路徑。" />
            <StepRow number="03" title="開始第一個口說任務" copy="用短對話熟悉練習方式、回饋與重播功能。" />
            <Row>
              <PrimaryButton label="開始免費試用" />
              <GhostButton label="先看功能預覽" />
            </Row>
          </Panel>
        </Screen>
      );
    case "login":
      return (
        <Screen>
          <HeroCard
            eyebrow="帳號登入"
            title="登入後繼續你的口說連續學習紀錄。"
            description="提供既有使用者登入、社群登入與忘記密碼入口。"
          />
          <AuthCard title="登入帳號" helper="回到你上次練習的位置。">
            <Field label="電子郵件" placeholder="請輸入電子郵件" />
            <Field label="密碼" placeholder="請輸入密碼" secure />
            <SplitText left="記住這台裝置" right="忘記密碼？" />
            <PrimaryButton label="登入" />
            <GhostButton label="使用 Google 繼續" />
          </AuthCard>
        </Screen>
      );
    case "signup":
      return (
        <Screen>
          <HeroCard
            eyebrow="建立帳號"
            title="建立個人資料並開啟 7 天免費試用。"
            description="新用戶註冊頁，包含基本資料與學習目標設定。"
          />
          <AuthCard title="建立帳號" helper="系統會依照你的目標調整學習內容。">
            <Field label="姓名" placeholder="我們該怎麼稱呼你？" />
            <Field label="電子郵件" placeholder="請輸入電子郵件" />
            <Field label="密碼" placeholder="請建立密碼" secure />
            <ChipRow values={["旅遊英文", "商務英文", "生活口說"]} />
            <PrimaryButton label="建立帳號" />
          </AuthCard>
        </Screen>
      );
    case "placement":
      return (
        <Screen>
          <HeroCard
            eyebrow="程度測驗"
            title="3 分鐘內找到最適合你的起點。"
            description="測驗頁包含目標選擇、自評與簡短口說評估。"
          />
          <Panel>
            <SectionTitle title="測驗流程" subtitle="此處為靜態示意畫面" />
            <QuestionCard
              prompt="你對日常英文對話的熟悉程度如何？"
              answers={["我需要從基礎開始", "簡單主題可以應付", "我能說，但還會犯一些錯"]}
            />
            <QuestionCard
              prompt="你現在最想加強哪一種情境？"
              answers={["旅遊", "工作會議", "英文簡報", "面試準備"]}
            />
            <PrimaryButton label="查看建議程度" />
          </Panel>
        </Screen>
      );
    case "home":
      return (
        <Screen>
          <HeroCard
            eyebrow="首頁儀表板"
            title="快速看到下一課、連續學習天數與推薦主題。"
            description="主首頁整合學習進度、推薦內容與口說入口。"
          />
          <Grid>
            <InfoTile title="連續學習" value="12 天" caption="今天再完成一次口說任務就能延續紀錄。" />
            <InfoTile title="本週目標" value="4 / 5" caption="再完成 1 次練習就能達成本週目標。" />
          </Grid>
          <Panel>
            <SectionTitle title="繼續學習" subtitle="系統推薦你下一個單元" />
            {lessonCards.map(([title, meta, status]) => (
              <CourseCard key={title} title={title} meta={meta} status={status} />
            ))}
          </Panel>
          <Panel>
            <SectionTitle title="主題捷徑" subtitle="快速開始一段短口說練習" />
            <ChipRow values={topicPills} />
          </Panel>
        </Screen>
      );
    case "path":
      return (
        <Screen>
          <HeroCard
            eyebrow="學習地圖"
            title="從基礎到流暢口說，按部就班往前走。"
            description="學習路徑頁呈現程度、單元狀態與解鎖順序。"
          />
          <Panel>
            <SectionTitle title="Level 1：基礎建立" subtitle="文法觀念與口說基本功" />
            <TimelineItem title="打招呼與自我介紹" meta="已完成" tone="done" />
            <TimelineItem title="描述你的日常生活" meta="學習中" tone="active" />
            <TimelineItem title="和朋友約時間" meta="下一課" tone="next" />
          </Panel>
          <Panel>
            <SectionTitle title="Level 2：生活情境" subtitle="完成 Level 1 後解鎖" />
            <TimelineItem title="職場小聊" meta="尚未解鎖" tone="locked" />
            <TimelineItem title="餐廳對話" meta="尚未解鎖" tone="locked" />
          </Panel>
        </Screen>
      );
    case "lesson":
      return (
        <Screen>
          <HeroCard
            eyebrow="課程詳情"
            title="把教學影片、關鍵句型與口說任務整合在同一頁。"
            description="課程詳情頁展示影片、重點句與逐步任務。"
          />
          <Panel>
            <VideoCard title="影片課程：禮貌地問路" time="06:42" />
            <SectionTitle title="今日重點句" subtitle="先看懂，再進入口說任務" />
            <PhraseRow phrase="Could you tell me how to get to the station?" meaning="中文意思：請問去車站怎麼走？" />
            <PhraseRow phrase="Is it within walking distance?" meaning="中文意思：走路可以到嗎？" />
            <PrimaryButton label="開始口說任務" />
          </Panel>
        </Screen>
      );
    case "practice":
      return (
        <Screen>
          <HeroCard
            eyebrow="口說練習"
            title="用角色扮演方式練習，並取得逐句回饋。"
            description="核心練習頁包含情境、對話、提示與即時修正。"
          />
          <Panel>
            <SectionTitle title="練習情境" subtitle="在咖啡店點餐" />
            <Bubble speaker="AI 店員" tone="ai" text="Hi there. What can I get started for you today?" />
            <Bubble speaker="你" tone="user" text="Can I get a latte and one sandwich, please?" />
            <FeedbackCard
              title="即時回饋"
              points={[
                "發音：latte 這個字的發音很清楚",
                "文法：整句結構正確",
                "建議：可以補上尺寸，聽起來會更自然",
              ]}
            />
            <ToggleRow label="開啟提示" value={hintEnabled} onValueChange={setHintEnabled} />
            <PrimaryButton label="點一下開始說" />
          </Panel>
        </Screen>
      );
    case "freetalk":
      return (
        <Screen>
          <HeroCard
            eyebrow="自由對話"
            title="不照課本也能和 AI 自由練習英文對話。"
            description="自由對話模式支援主題選擇、語速與口音設定。"
          />
          <Panel>
            <SectionTitle title="選擇主題" subtitle="快速進入你想練的情境" />
            <ChipRow values={["我的週末", "求職面試", "機場報到", "第一次約會", "日常作息"]} />
            <Grid>
              <InfoTile title="口音" value="美式 / 英式" caption="靜態切換示意" />
              <InfoTile title="語速" value="0.8x / 1x" caption="靜態切換示意" />
            </Grid>
            <Bubble
              speaker="AI 教練"
              tone="ai"
              text="Tell me about a recent trip you enjoyed. I will keep asking follow-up questions."
            />
            <PrimaryButton label="開始自由對話" />
          </Panel>
        </Screen>
      );
    case "summary":
      return (
        <Screen>
          <HeroCard
            eyebrow="課後總結"
            title="每次口說結束後，用分數與重點整理幫你複盤。"
            description="課後總結頁用來整理表現、修正與下一步建議。"
          />
          <Grid>
            <ScoreTile label="發音" score="84" />
            <ScoreTile label="文法" score="78" />
            <ScoreTile label="流暢度" score="81" />
            <ScoreTile label="自信度" score="88" />
          </Grid>
          <Panel>
            <SectionTitle title="本次重點" subtitle="下一次開口前先快速複習" />
            <PhraseRow phrase="I want a coffee" meaning="建議改成：I'd like a coffee, please." />
            <PhraseRow phrase="How much time it takes?" meaning="建議改成：How long does it take?" />
            <PrimaryButton label="查看錯誤整理" />
          </Panel>
        </Screen>
      );
    case "review":
      return (
        <Screen>
          <HeroCard
            eyebrow="複習中心"
            title="集中查看歷史對話、常犯錯誤與收藏句子。"
            description="複習頁依照學習紀錄與錯誤類型整理內容。"
          />
          <Panel>
            <SectionTitle title="近期練習紀錄" subtitle="回顧最近完成的口說任務" />
            <HistoryRow title="在咖啡店點餐" meta="今天 - 8 分鐘 - 4 次修正" />
            <HistoryRow title="聊聊你的興趣" meta="昨天 - 11 分鐘 - 7 次修正" />
            <HistoryRow title="飯店入住練習" meta="3 月 16 日 - 10 分鐘 - 5 次修正" />
          </Panel>
          <Panel>
            <SectionTitle title="已收藏句子" subtitle="之後可再次複習與跟讀" />
            <PhraseRow phrase="Could I have a window seat?" meaning="中文意思：我可以要靠窗的座位嗎？" />
            <PhraseRow phrase="I'm looking for a quiet place to work." meaning="中文意思：我想找個可以安靜工作的地方。" />
          </Panel>
        </Screen>
      );
    case "subscription":
      return (
        <Screen>
          <HeroCard
            eyebrow="訂閱方案"
            title="清楚比較試用、方案差異與升級價值。"
            description="訂閱頁展示免費版、進階版與高階版的功能。"
          />
          <PlanCard name="基本版" price="$0" features={["每日練習次數有限", "可使用入門課程", "回饋內容為精簡版"]} />
          <PlanCard
            name="進階版"
            price="$14.99"
            features={["不限次數口說練習", "完整學習路徑", "更詳細的錯誤修正"]}
            highlight
          />
          <PlanCard
            name="高階版"
            price="$24.99"
            features={["更多自由對話場景", "更深入的回饋分析", "優先客服支援"]}
          />
          <Panel>
            <SectionTitle title="試用資訊" subtitle="購買前的重要說明" />
            <Text style={styles.paragraph}>提供 7 天免費試用，之後改為按月扣款，可隨時在商店訂閱設定中取消。</Text>
            <PrimaryButton label="開始 7 天免費試用" />
          </Panel>
        </Screen>
      );
    case "profile":
      return (
        <Screen>
          <HeroCard
            eyebrow="個人設定"
            title="管理帳號資料、學習偏好與口說設定。"
            description="個人設定頁用來調整學習目標、口音與通知。"
          />
          <Panel>
            <SettingRow label="顯示名稱" value="Dark Schneider" />
            <SettingRow label="學習目標" value="建立日常英文口說自信" />
            <SettingRow label="偏好口音" value="美式英文" />
            <SettingRow label="語速" value="一般" />
            <SettingRow label="目前方案" value="進階版試用中" />
          </Panel>
          <Panel>
            <SectionTitle title="通知設定" subtitle="靜態切換示意" />
            <ToggleRow label="每日提醒" value />
            <ToggleRow label="每週進度報告" value />
            <ToggleRow label="優惠訊息" value={false} />
          </Panel>
        </Screen>
      );
    case "support":
      return (
        <Screen>
          <HeroCard
            eyebrow="客服支援"
            title="遇到問題時，快速找到常見解答與聯絡入口。"
            description="支援頁包含常見問題、帳務說明與問題回報。"
          />
          <Panel>
            <SectionTitle title="常見問題" subtitle="最常被問到的幾個主題" />
            <FaqRow question="免費試用是怎麼計算的？" />
            <FaqRow question="我要在哪裡取消訂閱？" />
            <FaqRow question="為什麼語音辨識沒有抓到我的回答？" />
            <FaqRow question="之後可以重新調整英文程度嗎？" />
          </Panel>
          <Panel>
            <SectionTitle title="聯絡客服" subtitle="靜態表單示意" />
            <Field label="問題主旨" placeholder="例如：帳單問題、登入問題、錯誤回報" />
            <Field label="問題描述" placeholder="請描述你遇到的情況" multiline />
            <PrimaryButton label="送出問題" />
          </Panel>
        </Screen>
      );
    default:
      return null;
  }
}

function Screen({ children }) {
  return <View style={styles.screen}>{children}</View>;
}

function HeroCard({ eyebrow, title, description }) {
  return (
    <LinearGradient colors={["#15344f", "#275c74"]} style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroDescription}>{description}</Text>
    </LinearGradient>
  );
}

function Panel({ children }) {
  return <View style={styles.panel}>{children}</View>;
}

function AuthCard({ title, helper, children }) {
  return (
    <Panel>
      <Text style={styles.authTitle}>{title}</Text>
      <Text style={styles.authHelper}>{helper}</Text>
      <View style={styles.stack}>{children}</View>
    </Panel>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <View style={styles.stackTight}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Field({ label, placeholder, secure, multiline }) {
  return (
    <View style={styles.stackTight}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        placeholder={placeholder}
        placeholderTextColor="#8f8577"
        secureTextEntry={secure}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function PrimaryButton({ label }) {
  return (
    <Pressable style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({ label }) {
  return (
    <Pressable style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function Grid({ children }) {
  return <View style={styles.grid}>{children}</View>;
}

function Row({ children }) {
  return <View style={styles.row}>{children}</View>;
}

function InfoTile({ title, value, caption }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoCaption}>{caption}</Text>
    </View>
  );
}

function ScoreTile({ label, score }) {
  return (
    <View style={styles.scoreTile}>
      <Text style={styles.scoreValue}>{score}</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
}

function StepRow({ number, title, copy }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{number}</Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepCopy}>{copy}</Text>
      </View>
    </View>
  );
}

function ChipRow({ values }) {
  return (
    <View style={styles.chipRow}>
      {values.map((value) => (
        <View key={value} style={styles.topicChip}>
          <Text style={styles.topicChipText}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function SplitText({ left, right }) {
  return (
    <View style={styles.splitText}>
      <Text style={styles.smallMuted}>{left}</Text>
      <Text style={styles.linkText}>{right}</Text>
    </View>
  );
}

function CourseCard({ title, meta, status }) {
  return (
    <View style={styles.courseCard}>
      <View>
        <Text style={styles.courseTitle}>{title}</Text>
        <Text style={styles.courseMeta}>{meta}</Text>
      </View>
      <View style={styles.courseStatus}>
        <Text style={styles.courseStatusText}>{status}</Text>
      </View>
    </View>
  );
}

function TimelineItem({ title, meta, tone }) {
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, styles[`timelineDot_${tone}`]]} />
      <View style={styles.timelineBody}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function VideoCard({ title, time }) {
  return (
    <LinearGradient colors={["#f2d2aa", "#d49d65"]} style={styles.videoCard}>
      <View style={styles.playButton}>
        <Text style={styles.playButtonText}>播放</Text>
      </View>
      <View>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.videoTime}>{time}</Text>
      </View>
    </LinearGradient>
  );
}

function PhraseRow({ phrase, meaning }) {
  return (
    <View style={styles.phraseRow}>
      <Text style={styles.phraseText}>{phrase}</Text>
      <Text style={styles.phraseMeaning}>{meaning}</Text>
    </View>
  );
}

function Bubble({ speaker, text, tone }) {
  return (
    <View style={[styles.bubble, tone === "user" ? styles.bubbleUser : styles.bubbleAi]}>
      <Text style={styles.bubbleSpeaker}>{speaker}</Text>
      <Text style={styles.bubbleText}>{text}</Text>
    </View>
  );
}

function FeedbackCard({ title, points }) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>{title}</Text>
      {points.map((point) => (
        <Text key={point} style={styles.feedbackPoint}>
          - {point}
        </Text>
      ))}
    </View>
  );
}

function QuestionCard({ prompt, answers }) {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionPrompt}>{prompt}</Text>
      {answers.map((answer) => (
        <View key={answer} style={styles.answerOption}>
          <Text style={styles.answerOptionText}>{answer}</Text>
        </View>
      ))}
    </View>
  );
}

function ToggleRow({ label, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function HistoryRow({ title, meta }) {
  return (
    <View style={styles.historyRow}>
      <View>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historyMeta}>{meta}</Text>
      </View>
      <Text style={styles.linkText}>查看</Text>
    </View>
  );
}

function PlanCard({ name, price, features, highlight }) {
  return (
    <View style={[styles.planCard, highlight && styles.planCardHighlight]}>
      <Text style={[styles.planName, highlight && styles.planNameHighlight]}>{name}</Text>
      <Text style={[styles.planPrice, highlight && styles.planPriceHighlight]}>{price}</Text>
      {features.map((feature) => (
        <Text key={feature} style={[styles.planFeature, highlight && styles.planFeatureHighlight]}>
          - {feature}
        </Text>
      ))}
    </View>
  );
}

function SettingRow({ label, value }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function FaqRow({ question }) {
  return (
    <View style={styles.faqRow}>
      <Text style={styles.faqText}>{question}</Text>
      <Text style={styles.faqArrow}>?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 16 },
  stack: { gap: 14 },
  stackTight: { gap: 8 },
  row: { flexDirection: "row", gap: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  heroCard: { borderRadius: 28, overflow: "hidden", padding: 24 },
  heroEyebrow: { color: "#b7d8ea", fontSize: 12, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 },
  heroTitle: { color: "#f8fbfd", fontSize: 34, fontWeight: "800", letterSpacing: -1.1, lineHeight: 38, marginBottom: 12 },
  heroDescription: { color: "#d7e7ee", fontSize: 15, lineHeight: 23, maxWidth: 420 },
  panel: {
    backgroundColor: "rgba(255, 250, 244, 0.92)",
    borderColor: "rgba(75, 70, 58, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  authTitle: { color: "#1f1d1a", fontSize: 28, fontWeight: "800", letterSpacing: -0.8 },
  authHelper: { color: "#726a60", fontSize: 14, lineHeight: 21 },
  sectionTitle: { color: "#1f1d1a", fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  sectionSubtitle: { color: "#726a60", fontSize: 13, lineHeight: 20 },
  fieldLabel: { color: "#3d3226", fontSize: 14, fontWeight: "700" },
  input: {
    backgroundColor: "#fffaf2",
    borderColor: "#d9c9b6",
    borderRadius: 16,
    borderWidth: 1,
    color: "#241b14",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  textArea: { minHeight: 120, paddingTop: 15, textAlignVertical: "top" },
  primaryButton: { alignItems: "center", backgroundColor: "#1f5eff", borderRadius: 16, flex: 1, paddingVertical: 16 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8cab8",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 16,
  },
  secondaryButtonText: { color: "#2b221c", fontSize: 15, fontWeight: "700" },
  infoTile: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(35, 41, 36, 0.08)",
    borderRadius: 22,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 150,
    padding: 16,
  },
  infoTitle: { color: "#5d6a67", fontSize: 12, fontWeight: "700", marginBottom: 10 },
  infoValue: { color: "#1f1d1a", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  infoCaption: { color: "#71695f", fontSize: 13, lineHeight: 19 },
  scoreTile: {
    backgroundColor: "#fffaf3",
    borderColor: "rgba(41, 36, 28, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 140,
    padding: 16,
  },
  scoreValue: { color: "#214e63", fontSize: 28, fontWeight: "800", marginBottom: 6 },
  scoreLabel: { color: "#6f665a", fontSize: 13, fontWeight: "700" },
  stepRow: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  stepBadge: { alignItems: "center", backgroundColor: "#214e63", borderRadius: 999, height: 34, justifyContent: "center", width: 34 },
  stepBadgeText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  stepBody: { flex: 1, gap: 4, paddingTop: 4 },
  stepTitle: { color: "#1f1d1a", fontSize: 16, fontWeight: "800" },
  stepCopy: { color: "#6f665a", fontSize: 14, lineHeight: 21 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  topicChip: { backgroundColor: "#eef5f6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  topicChipText: { color: "#214e63", fontSize: 13, fontWeight: "700" },
  splitText: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  smallMuted: { color: "#6d675f", fontSize: 13 },
  linkText: { color: "#8f4f1f", fontSize: 14, fontWeight: "700" },
  courseCard: {
    alignItems: "center",
    backgroundColor: "#fffcf8",
    borderColor: "rgba(71, 61, 53, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  courseTitle: { color: "#1f1d1a", fontSize: 16, fontWeight: "800" },
  courseMeta: { color: "#6f665a", fontSize: 13, marginTop: 4 },
  courseStatus: { backgroundColor: "#eef5f6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  courseStatusText: { color: "#214e63", fontSize: 12, fontWeight: "800" },
  timelineRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  timelineDot: { borderRadius: 999, height: 14, width: 14 },
  timelineDot_done: { backgroundColor: "#3ba57b" },
  timelineDot_active: { backgroundColor: "#1f5eff" },
  timelineDot_next: { backgroundColor: "#d49d65" },
  timelineDot_locked: { backgroundColor: "#d6d0c7" },
  timelineBody: { borderBottomColor: "rgba(81, 71, 58, 0.08)", borderBottomWidth: 1, flex: 1, paddingVertical: 12 },
  timelineTitle: { color: "#1f1d1a", fontSize: 16, fontWeight: "700" },
  timelineMeta: { color: "#776e62", fontSize: 13, marginTop: 4 },
  videoCard: { alignItems: "center", borderRadius: 22, flexDirection: "row", gap: 16, padding: 18 },
  playButton: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 999, height: 52, justifyContent: "center", width: 52 },
  playButtonText: { color: "#9b5d25", fontSize: 15, fontWeight: "800" },
  videoTitle: { color: "#37261a", fontSize: 17, fontWeight: "800", marginBottom: 4 },
  videoTime: { color: "#5d4836", fontSize: 13, fontWeight: "700" },
  phraseRow: { backgroundColor: "#fffdf8", borderColor: "rgba(61, 52, 38, 0.08)", borderRadius: 18, borderWidth: 1, padding: 14 },
  phraseText: { color: "#1f1d1a", fontSize: 15, fontWeight: "800", marginBottom: 6 },
  phraseMeaning: { color: "#6f665a", fontSize: 13, lineHeight: 19 },
  bubble: { borderRadius: 22, padding: 16 },
  bubbleAi: { backgroundColor: "#edf4f6" },
  bubbleUser: { backgroundColor: "#fff4e7" },
  bubbleSpeaker: { color: "#5d6a67", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  bubbleText: { color: "#1f1d1a", fontSize: 15, lineHeight: 22 },
  feedbackCard: { backgroundColor: "#f7fbff", borderColor: "rgba(31, 94, 255, 0.12)", borderRadius: 18, borderWidth: 1, padding: 16 },
  feedbackTitle: { color: "#1f5eff", fontSize: 15, fontWeight: "800", marginBottom: 8 },
  feedbackPoint: { color: "#4a607d", fontSize: 13, lineHeight: 21 },
  toggleRow: { alignItems: "center", borderBottomColor: "rgba(71, 61, 53, 0.08)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  questionCard: { backgroundColor: "#fffdf8", borderColor: "rgba(61, 52, 38, 0.08)", borderRadius: 20, borderWidth: 1, gap: 10, padding: 16 },
  questionPrompt: { color: "#1f1d1a", fontSize: 16, fontWeight: "800", lineHeight: 22 },
  answerOption: { backgroundColor: "#f2f7f7", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12 },
  answerOptionText: { color: "#305162", fontSize: 14, fontWeight: "700" },
  historyRow: { alignItems: "center", borderBottomColor: "rgba(71, 61, 53, 0.08)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  historyTitle: { color: "#1f1d1a", fontSize: 15, fontWeight: "800" },
  historyMeta: { color: "#6f665a", fontSize: 13, marginTop: 4 },
  planCard: { backgroundColor: "rgba(255, 250, 244, 0.92)", borderColor: "rgba(75, 70, 58, 0.08)", borderRadius: 24, borderWidth: 1, padding: 18 },
  planCardHighlight: { backgroundColor: "#214e63", borderColor: "#214e63" },
  planName: { color: "#1f1d1a", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  planNameHighlight: { color: "#ffffff" },
  planPrice: { color: "#8f4f1f", fontSize: 28, fontWeight: "800", marginBottom: 10 },
  planPriceHighlight: { color: "#ffe2b8" },
  planFeature: { color: "#62584c", fontSize: 14, lineHeight: 21 },
  planFeatureHighlight: { color: "#d9ecf3" },
  settingRow: { borderBottomColor: "rgba(71, 61, 53, 0.08)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  settingLabel: { color: "#1f1d1a", fontSize: 15, fontWeight: "700" },
  settingValue: { color: "#6d675f", fontSize: 14 },
  faqRow: { alignItems: "center", borderBottomColor: "rgba(71, 61, 53, 0.08)", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: 14 },
  faqText: { color: "#1f1d1a", flex: 1, fontSize: 15, fontWeight: "700", paddingRight: 12 },
  faqArrow: { color: "#8f4f1f", fontSize: 24 },
  paragraph: { color: "#6f665a", fontSize: 14, lineHeight: 22 },
});
