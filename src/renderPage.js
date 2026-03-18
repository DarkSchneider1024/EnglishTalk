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
  ["Small talk at work", "Unit 04 • 12 min", "Continue"],
  ["Ordering coffee politely", "Unit 05 • 8 min", "Completed"],
  ["Hotel check-in essentials", "Unit 06 • 10 min", "Locked"],
];

const topicPills = ["Travel", "Work", "Dating", "Daily Life", "Study", "Interviews"];

export function renderPage(activePage) {
  return <PageRouter activePage={activePage} />;
}

function PageRouter({ activePage }) {
  const [hintEnabled, setHintEnabled] = useState(true);

  switch (activePage) {
    case "welcome":
      return (
        <Screen>
          <HeroCard eyebrow="AI SPEAKING COACH" title="Build daily confidence through guided conversation practice." description="Landing and onboarding screen for course structure, learning goals, and trial conversion." />
          <Grid>
            <InfoTile title="Guided Courses" value="120+" caption="Structured lessons for beginner to intermediate learners." />
            <InfoTile title="Live Feedback" value="Instant" caption="Pronunciation and grammar hints during practice." />
          </Grid>
          <Panel>
            <SectionTitle title="Onboarding Steps" subtitle="First-time user journey" />
            <StepRow number="01" title="Choose your goal" copy="Travel, work, school, or confidence building." />
            <StepRow number="02" title="Take a quick level check" copy="Set a starting point before entering the course path." />
            <StepRow number="03" title="Start your first speaking mission" copy="A short conversation with coaching and replay." />
            <Row>
              <PrimaryButton label="Start Free Trial" />
              <GhostButton label="Watch Preview" />
            </Row>
          </Panel>
        </Screen>
      );
    case "login":
      return (
        <Screen>
          <HeroCard eyebrow="ACCOUNT ACCESS" title="Sign back in and continue your speaking streak." description="Existing-user login page with email and password fields, social entry, and recovery links." />
          <AuthCard title="Sign in" helper="Pick up where you left off.">
            <Field label="Email" placeholder="you@example.com" />
            <Field label="Password" placeholder="Enter your password" secure />
            <SplitText left="Remember this device" right="Forgot password?" />
            <PrimaryButton label="Sign in" />
            <GhostButton label="Continue with Google" />
          </AuthCard>
        </Screen>
      );
    case "signup":
      return (
        <Screen>
          <HeroCard eyebrow="CREATE ACCOUNT" title="Set up your profile and unlock a 7-day trial." description="Sign-up screen for new users, including basic profile fields and goal selection." />
          <AuthCard title="Create account" helper="Your AI coach will adapt to your learning goal.">
            <Field label="Full name" placeholder="How should we call you?" />
            <Field label="Email" placeholder="you@example.com" />
            <Field label="Password" placeholder="Create a password" secure />
            <ChipRow values={["Travel English", "Business English", "Daily Speaking"]} />
            <PrimaryButton label="Create account" />
          </AuthCard>
        </Screen>
      );
    case "placement":
      return (
        <Screen>
          <HeroCard eyebrow="LEVEL CHECK" title="Find the right starting point in under 3 minutes." description="Placement screen for goal selection, self-rating, and a short spoken assessment." />
          <Panel>
            <SectionTitle title="Assessment Flow" subtitle="Static mockup only" />
            <QuestionCard prompt="How comfortable are you with everyday English conversation?" answers={["I need basic support", "I can handle simple topics", "I speak with occasional mistakes"]} />
            <QuestionCard prompt="Which topic matters most right now?" answers={["Travel", "Work meetings", "Presentations", "Interview prep"]} />
            <PrimaryButton label="See my recommended level" />
          </Panel>
        </Screen>
      );
    case "home":
      return (
        <Screen>
          <HeroCard eyebrow="HOME DASHBOARD" title="Your next lesson, your current streak, and fresh conversation topics." description="Main dashboard showing progress, recommendations, and shortcuts into the speaking flow." />
          <Grid>
            <InfoTile title="Current Streak" value="12 days" caption="Keep it alive with one speaking mission today." />
            <InfoTile title="Weekly Goal" value="4 / 5" caption="One more session to finish this week." />
          </Grid>
          <Panel>
            <SectionTitle title="Continue Learning" subtitle="Recommended next units" />
            {lessonCards.map(([title, meta, status]) => (
              <CourseCard key={title} title={title} meta={meta} status={status} />
            ))}
          </Panel>
          <Panel>
            <SectionTitle title="Topic Shortcuts" subtitle="Jump into a quick conversation" />
            <ChipRow values={topicPills} />
          </Panel>
        </Screen>
      );
    case "path":
      return (
        <Screen>
          <HeroCard eyebrow="COURSE MAP" title="A structured path from foundations to fluent speaking patterns." description="Learning path page that visualizes levels, units, lesson states, and locked progression." />
          <Panel>
            <SectionTitle title="Level 1: Foundations" subtitle="Grammar + speaking basics" />
            <TimelineItem title="Greetings and introductions" meta="Completed" tone="done" />
            <TimelineItem title="Talking about your routine" meta="In progress" tone="active" />
            <TimelineItem title="Making plans with friends" meta="Next up" tone="next" />
          </Panel>
          <Panel>
            <SectionTitle title="Level 2: Real-life Scenarios" subtitle="Unlocked after Level 1" />
            <TimelineItem title="Workplace small talk" meta="Locked" tone="locked" />
            <TimelineItem title="Restaurant conversations" meta="Locked" tone="locked" />
          </Panel>
        </Screen>
      );
    case "lesson":
      return (
        <Screen>
          <HeroCard eyebrow="LESSON DETAIL" title="Blend teaching video, key phrases, and a speaking mission in one lesson page." description="Lesson detail layout with a featured video, key expressions, and a step-by-step progression." />
          <Panel>
            <VideoCard title="Video Lesson: Asking for directions politely" time="06:42" />
            <SectionTitle title="Today's phrases" subtitle="Pinned expressions for the lesson" />
            <PhraseRow phrase="Could you tell me how to get to the station?" meaning="Polite way to ask for directions." />
            <PhraseRow phrase="Is it within walking distance?" meaning="Useful follow-up question." />
            <PrimaryButton label="Start speaking mission" />
          </Panel>
        </Screen>
      );
    case "practice":
      return (
        <Screen>
          <HeroCard eyebrow="SPEAKING DRILL" title="A guided role-play screen with transcript, hints, and live corrections." description="Core speaking practice page for scenario-based training." />
          <Panel>
            <SectionTitle title="Scenario" subtitle="Coffee shop ordering practice" />
            <Bubble speaker="AI Barista" tone="ai" text="Hi there. What can I get started for you today?" />
            <Bubble speaker="You" tone="user" text="Can I get a latte and one sandwich, please?" />
            <FeedbackCard title="Instant feedback" points={["Pronunciation: latte was clear", "Grammar: sentence structure is correct", "Suggestion: add size for a more natural reply"]} />
            <ToggleRow label="Hints enabled" value={hintEnabled} onValueChange={setHintEnabled} />
            <PrimaryButton label="Tap to speak" />
          </Panel>
        </Screen>
      );
    case "freetalk":
      return (
        <Screen>
          <HeroCard eyebrow="FREE TALK" title="Open-ended AI conversation with topic presets and session controls." description="A looser talk mode for extended speaking practice outside structured lessons." />
          <Panel>
            <SectionTitle title="Choose a topic" subtitle="Fast entry points into free conversation" />
            <ChipRow values={["My weekend", "Job interview", "Airport check-in", "First date", "Daily routine"]} />
            <Grid>
              <InfoTile title="Accent" value="US / UK" caption="Static selector card" />
              <InfoTile title="Speed" value="0.8x / 1x" caption="Static selector card" />
            </Grid>
            <Bubble speaker="AI Coach" tone="ai" text="Tell me about a recent trip you enjoyed. I will keep asking follow-up questions." />
            <PrimaryButton label="Start free talk" />
          </Panel>
        </Screen>
      );
    case "summary":
      return (
        <Screen>
          <HeroCard eyebrow="SESSION SUMMARY" title="Wrap each speaking session with scores, corrections, and next actions." description="End-of-session page summarizing the speaking result." />
          <Grid>
            <ScoreTile label="Pronunciation" score="84" />
            <ScoreTile label="Grammar" score="78" />
            <ScoreTile label="Fluency" score="81" />
            <ScoreTile label="Confidence" score="88" />
          </Grid>
          <Panel>
            <SectionTitle title="Key takeaways" subtitle="Review before moving on" />
            <PhraseRow phrase="I want a coffee" meaning="Try: I'd like a coffee, please." />
            <PhraseRow phrase="How much time it takes?" meaning="Try: How long does it take?" />
            <PrimaryButton label="Review mistakes" />
          </Panel>
        </Screen>
      );
    case "review":
      return (
        <Screen>
          <HeroCard eyebrow="REVIEW CENTER" title="Browse conversation history, saved phrases, and mistakes to revisit." description="A review archive screen driven by course history and speaking errors." />
          <Panel>
            <SectionTitle title="Recent sessions" subtitle="Conversation history" />
            <HistoryRow title="Ordering at a cafe" meta="Today • 8 min • 4 corrections" />
            <HistoryRow title="Talking about your hobbies" meta="Yesterday • 11 min • 7 corrections" />
            <HistoryRow title="Hotel check-in practice" meta="Mar 16 • 10 min • 5 corrections" />
          </Panel>
          <Panel>
            <SectionTitle title="Saved phrases" subtitle="For spaced review later" />
            <PhraseRow phrase="Could I have a window seat?" meaning="Useful phrase for travel role-play." />
            <PhraseRow phrase="I'm looking for a quiet place to work." meaning="Useful phrase for cafes and coworking spaces." />
          </Panel>
        </Screen>
      );
    case "subscription":
      return (
        <Screen>
          <HeroCard eyebrow="PLANS" title="Present trial messaging, plan comparison, and upgrade entry points." description="Subscription page for Basic, Premium, and Plus style offerings." />
          <PlanCard name="Basic" price="$0" features={["Limited daily practice", "Starter lessons", "Preview feedback"]} />
          <PlanCard name="Premium" price="$14.99" features={["Unlimited speaking drills", "Structured course path", "Detailed corrections"]} highlight />
          <PlanCard name="Plus" price="$24.99" features={["Expanded free talk", "Advanced feedback depth", "Priority support"]} />
          <Panel>
            <SectionTitle title="Trial details" subtitle="Static purchase information" />
            <Text style={styles.paragraph}>7-day free trial, then monthly billing. Cancel anytime from the app store settings page.</Text>
            <PrimaryButton label="Start 7-day trial" />
          </Panel>
        </Screen>
      );
    case "profile":
      return (
        <Screen>
          <HeroCard eyebrow="PROFILE & SETTINGS" title="House account details, app preferences, and speaking options." description="Profile screen for user settings and subscription visibility." />
          <Panel>
            <SettingRow label="Display name" value="Dark Schneider" />
            <SettingRow label="Learning goal" value="Daily speaking confidence" />
            <SettingRow label="Accent preference" value="American English" />
            <SettingRow label="Speech speed" value="Normal" />
            <SettingRow label="Current plan" value="Premium Trial" />
          </Panel>
          <Panel>
            <SectionTitle title="Notifications" subtitle="Static toggles" />
            <ToggleRow label="Daily reminder" value />
            <ToggleRow label="Weekly progress report" value />
            <ToggleRow label="Promo messages" value={false} />
          </Panel>
        </Screen>
      );
    case "support":
      return (
        <Screen>
          <HeroCard eyebrow="HELP CENTER" title="Support, FAQs, and issue-report entry points." description="Support screen for user help, billing issues, and customer contact." />
          <Panel>
            <SectionTitle title="Common questions" subtitle="Top support topics" />
            <FaqRow question="How does the free trial work?" />
            <FaqRow question="Where can I cancel my subscription?" />
            <FaqRow question="Why is speech recognition not catching my answer?" />
            <FaqRow question="Can I change my speaking level later?" />
          </Panel>
          <Panel>
            <SectionTitle title="Contact support" subtitle="Static form layout" />
            <Field label="Subject" placeholder="Billing issue, login issue, bug report..." />
            <Field label="Message" placeholder="Describe your issue" multiline />
            <PrimaryButton label="Send request" />
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
        <Text style={styles.playButtonText}>▶</Text>
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
          • {point}
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
      <Text style={styles.linkText}>Open</Text>
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
          • {feature}
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
      <Text style={styles.faqArrow}>›</Text>
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
  heroEyebrow: { color: "#b7d8ea", fontSize: 12, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
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
  infoTitle: { color: "#5d6a67", fontSize: 12, fontWeight: "700", marginBottom: 10, textTransform: "uppercase" },
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
  playButtonText: { color: "#9b5d25", fontSize: 18, fontWeight: "800", marginLeft: 2 },
  videoTitle: { color: "#37261a", fontSize: 17, fontWeight: "800", marginBottom: 4 },
  videoTime: { color: "#5d4836", fontSize: 13, fontWeight: "700" },
  phraseRow: { backgroundColor: "#fffdf8", borderColor: "rgba(61, 52, 38, 0.08)", borderRadius: 18, borderWidth: 1, padding: 14 },
  phraseText: { color: "#1f1d1a", fontSize: 15, fontWeight: "800", marginBottom: 6 },
  phraseMeaning: { color: "#6f665a", fontSize: 13, lineHeight: 19 },
  bubble: { borderRadius: 22, padding: 16 },
  bubbleAi: { backgroundColor: "#edf4f6" },
  bubbleUser: { backgroundColor: "#fff4e7" },
  bubbleSpeaker: { color: "#5d6a67", fontSize: 12, fontWeight: "800", marginBottom: 6, textTransform: "uppercase" },
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
