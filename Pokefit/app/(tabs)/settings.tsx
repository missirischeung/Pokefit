import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import supabase from "../../lib/supabase";
import {
  ensureSeed,
  getUser,
  updateUser,
  getSteps,
  setSteps,
  getCollection,
  clearCollection,
  resetAll,
} from "../../lib/storage";

export default function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    await ensureSeed();
    const u = await getUser();
    setName(u?.name ?? "Ash Ketchum");
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Invalid name", "Please enter a non-empty name.");
      return;
    }
    const u = await updateUser({ name: trimmed });
    setName(u.name);
    Alert.alert("Saved", "Your profile name has been updated.");
  };

  const handleClearCollection = () => {
    Alert.alert("Clear collection?", "This will remove all saved cards.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearCollection();
          Alert.alert("Collection cleared", "All cards have been removed.");
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert(
      "Reset all data?",
      "This will reset your name, steps, and collection to fresh defaults.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetAll();
            await ensureSeed();
            await load();
            Alert.alert("Reset complete", "All data has been reset.");
          },
        },
      ]
    );
  };

  const handleClearStepsOnly = () => {
    Alert.alert("Clear steps?", "This will set your all-time steps to 0.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await setSteps(0);
          Alert.alert("Steps cleared", "Your steps have been reset to 0.");
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>⚙️ Settings</Text>

        {/* --- Profile Section --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <Text style={styles.label}>Display name</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Pressable
              style={[styles.btn, styles.primaryBtn]}
              onPress={handleSaveName}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>

        {/* --- Data Section --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data</Text>

          <Pressable
            style={[styles.btn, styles.neutralBtn]}
            onPress={handleClearStepsOnly}
            disabled={loading}
          >
            <Text style={styles.neutralBtnText}>Clear Steps Only</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.orangeBtn]}
            onPress={handleClearCollection}
            disabled={loading}
          >
            <Text style={styles.orangeBtnText}>Clear Collection</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.resetBtn]}
            onPress={handleResetAll}
            disabled={loading}
          >
            <Text style={styles.resetBtnText}>Reset All (Name, Steps, Collection)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },

  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },

  // --- Card Section ---
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#ffd9e1", // soft pink outline
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // --- Section Header ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "black", // aqua accent
    marginBottom: 14,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fef6f9",
    borderWidth: 1,
    borderColor: "#f4a6b8",
    fontSize: 15,
    color: "#333",
  },

  // --- Buttons ---
  btn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: "#ff914d", // orange
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  neutralBtn: {
    backgroundColor: "#e5e7eb",
  },
  neutralBtnText: {
    color: "#111827",
    fontWeight: "800",
  },

  orangeBtn: {
    backgroundColor: "#ff914d",
  },
  orangeBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  resetBtn: {
    backgroundColor: "#0cc0df",
  },
  resetBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
});
