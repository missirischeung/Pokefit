import React from "react";
import { View, StyleSheet } from "react-native";
import Auth from "@/components/Auth";
import { ThemedView } from "@/components/themed-view";

export default function AuthScreen() {
  return (
    <ThemedView style={styles.container}>
      <Auth />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});
