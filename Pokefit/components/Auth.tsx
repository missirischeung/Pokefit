import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
} from "react-native";
import { supabase } from "../lib/supabase";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* 🧩 Logo */}
        <Image
          source={{
            uri: "https://i.imgur.com/0Yz9u8O.png", // replace with your own logo URL
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in or create an account</Text>

        {/* Email */}
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <TextInput
            placeholder="email@address.com"
            placeholderTextColor="#A1A1AA"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.verticallySpaced}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A1A1AA"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Sign In */}
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.buttonDisabled]}
            onPress={signInWithEmail}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Loading..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View style={styles.verticallySpaced}>
          <TouchableOpacity
            style={[styles.secondaryBtn, loading && styles.buttonDisabled]}
            onPress={signUpWithEmail}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#0cc0df", // aqua
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: { marginTop: 20 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#f4a6b8",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fffafc",
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: "#0cc0df",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#0cc0df",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#ff914d",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#ff914d",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonDisabled: { opacity: 0.6 },
});
