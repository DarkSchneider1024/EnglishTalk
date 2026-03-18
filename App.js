import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { pages } from "./src/pages";
import { renderPage } from "./src/renderPage";

export default function App() {
  const [activePage, setActivePage] = useState("welcome");

  return (
    <LinearGradient colors={["#f7efe4", "#eee1ce", "#d5dddf"]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.shell}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brand}>ENGLISH TALK</Text>
              <Text style={styles.subtitle}>Static wireframes for all core app pages</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pages.length} screens</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.nav}
            contentContainerStyle={styles.navContent}
          >
            {pages.map((page) => (
              <Pressable
                key={page.id}
                onPress={() => setActivePage(page.id)}
                style={[styles.chip, activePage === page.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, activePage === page.id && styles.chipTextActive]}>
                  {page.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.pageScroller}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageContent}
          >
            {renderPage(activePage)}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  shell: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brand: {
    color: "#32453f",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2.4,
  },
  subtitle: { color: "#68736e", fontSize: 12, marginTop: 4 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(50,69,63,0.1)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: { color: "#32453f", fontSize: 12, fontWeight: "700" },
  nav: { flexGrow: 0, marginBottom: 16 },
  navContent: { gap: 10, paddingRight: 12 },
  chip: {
    backgroundColor: "rgba(255, 251, 245, 0.78)",
    borderColor: "rgba(49, 69, 63, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: "#214e63" },
  chipText: { color: "#546560", fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#ffffff" },
  pageScroller: { flex: 1 },
  pageContent: { paddingBottom: 36 },
});
