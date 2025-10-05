import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Button,
  TextInput,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Session } from "@supabase/supabase-js";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;

      Alert.alert("✅ Profile updated", "Your profile has been successfully saved!");
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Your Account</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={session?.user?.email}
          editable={false}
          placeholder="Email"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username || ""}
          onChangeText={setUsername}
          placeholder="Trainer name"
        />

        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          value={website || ""}
          onChangeText={setWebsite}
          placeholder="Website or profile link"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#0cc0df",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fef6f9",
    borderWidth: 1,
    borderColor: "#f4a6b8",
    marginBottom: 14,
    fontSize: 15,
  },
  inputDisabled: {
    backgroundColor: "#f2f2f2",
    color: "#999",
  },
  primaryBtn: {
    backgroundColor: "#0cc0df",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: "#0cc0df",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  signOutBtn: {
    backgroundColor: "#ff914d",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 16,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

