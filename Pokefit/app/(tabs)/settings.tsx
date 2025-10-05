// app/(tabs)/settings.tsx
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
import supabase from "../../lib/supabase"; // default export; change if yours is named
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
  const [coins, setCoins] = useState<number>(0);
  const [steps, setStepsState] = useState<number>(0);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    await ensureSeed();
    const u = await getUser();
    const s = await getSteps();
    const col = await getCollection();
    setName(u?.name ?? "Ash Ketchum");
    setCoins(u?.coins ?? 1200);
    setStepsState(s);
    setCollectionCount(col.length);
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
          await load();
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
            await resetAll();     // wipes user, steps, collection
            await ensureSeed();   // seeds demo defaults again
            await load();         // refresh UI
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
          await load();
        },
      },
    ]);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
      return;
    }
    // optional: clear local demo data too
    await resetAll();
    Alert.alert("Logged out", "You have been signed out.", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/"); // send to your login/landing route
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile card */}
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
            <Pressable style={styles.primaryBtn} onPress={handleSaveName} disabled={loading}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>

        {/* Data */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Data</Text>

          <Pressable style={styles.neutralBtn} onPress={handleClearStepsOnly} disabled={loading}>
            <Text style={styles.neutralBtnText}>Clear Steps Only</Text>
          </Pressable>

          <Pressable style={styles.warnBtn} onPress={handleClearCollection} disabled={loading}>
            <Text style={styles.warnBtnText}>Clear Collection</Text>
          </Pressable>

          <Pressable style={styles.dangerBtn} onPress={handleResetAll} disabled={loading}>
            <Text style={styles.dangerBtnText}>Reset All (Name, Steps, Collection)</Text>
          </Pressable>
        </View>

        {/* <Pressable style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </Pressable> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f4f4f4" },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  label: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },

  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  metaRow: { marginTop: 12, gap: 4 },
  meta: { fontSize: 12, color: "#6b7280" },
  metaStrong: { color: "#111827", fontWeight: "800" },

  primaryBtn: {
    backgroundColor: "#3B4CCA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  neutralBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  neutralBtnText: { color: "#111827", fontWeight: "800" },

  warnBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  warnBtnText: { color: "#111827", fontWeight: "800" },

  dangerBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerBtnText: { color: "#fff", fontWeight: "800" },

  logoutBtn: {
    backgroundColor: "#3B4CCA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  logoutBtnText: { color: "#fff", fontWeight: "800" },

  note: { marginTop: 8, fontSize: 12, color: "#6b7280" },
});
