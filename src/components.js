import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";

export function Section({ title, subtitle, children }) {
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

export function Card({ title, sub, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
      {children}
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Input({ label, value, onChangeText, placeholder, secure, multiline }) {
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

export function Button({ label, onPress, style }) {
  return (
    <Pressable style={[styles.btn, style]} onPress={onPress}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, style }) {
  return (
    <Pressable style={[styles.ghost, style]} onPress={onPress}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

export function Stat({ title, value, text }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

export function ChipRow({ values, active, onSelect, completedItems = [] }) {
  return (
    <View style={styles.chips}>
      {values.map((value, idx) => {
        const isCompleted = completedItems.includes(value) || (typeof values[0] === 'string' && completedItems.some(i => i.includes(value.toLowerCase())));
        return (
          <Pressable key={idx} style={[styles.chip, active === value && styles.chipActive]} onPress={() => onSelect?.(value)}>
            <Text style={[styles.chipText, active === value && styles.chipTextActive]}>
              {value} {isCompleted ? "✅" : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Phrase({ en, zh, onPress, showZh = true }) {
  return (
    <Pressable style={styles.phrase} onPress={onPress}>
      <Text style={styles.phraseEn}>{en}</Text>
      {showZh && <Text style={styles.body}>{zh}</Text>}
    </Pressable>
  );
}

export function History({ title, meta, openLabel }) {
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

export function Plan({ item, active, onPress }) {
  return (
    <Pressable style={[styles.plan, active && styles.planActive]} onPress={onPress}>
      <Text style={[styles.planName, active && styles.planNameActive]}>{item.name}</Text>
      <Text style={[styles.planPrice, active && styles.planPriceActive]}>{item.price}</Text>
      {item.features.map((feature) => (
        <Text key={feature} style={[styles.body, active && styles.planBodyActive]}>- {feature}</Text>
      ))}
    </Pressable>
  );
}
