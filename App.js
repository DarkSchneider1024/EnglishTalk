import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function App() {
  return (
    <LinearGradient colors={["#f7efe4", "#efe3d0", "#dfd7c6"]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>ENGLISH TALK</Text>
            <Text style={styles.title}>Speak with confidence, every day.</Text>
            <Text style={styles.subtitle}>
              Practice real English conversations with AI coaching, instant feedback,
              and a guided learning path.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardCopy}>
              Continue your speaking streak and pick up where you left off.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#8f8577"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable>
                  <Text style={styles.textButton}>Forgot?</Text>
                </Pressable>
              </View>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                placeholder="Enter your password"
                placeholderTextColor="#8f8577"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>New here?</Text>
              <Pressable>
                <Text style={styles.footerLink}>Create an account</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 20,
  },
  hero: {
    paddingTop: 32,
    gap: 12,
  },
  eyebrow: {
    color: "#5f5445",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.2,
  },
  title: {
    color: "#241b14",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  subtitle: {
    color: "#5c5348",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  card: {
    backgroundColor: "rgba(255, 251, 245, 0.92)",
    borderColor: "rgba(85, 66, 44, 0.12)",
    borderRadius: 28,
    borderWidth: 1,
    gap: 16,
    padding: 22,
    shadowColor: "#876d48",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  cardTitle: {
    color: "#201812",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  cardCopy: {
    color: "#675d50",
    fontSize: 14,
    lineHeight: 21,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#3d3226",
    fontSize: 14,
    fontWeight: "700",
  },
  passwordRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  textButton: {
    color: "#8f4f1f",
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1f5eff",
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8cab8",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#2b221c",
    fontSize: 15,
    fontWeight: "700",
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    color: "#675d50",
    fontSize: 14,
    marginRight: 6,
  },
  footerLink: {
    color: "#8f4f1f",
    fontSize: 14,
    fontWeight: "800",
  },
});
