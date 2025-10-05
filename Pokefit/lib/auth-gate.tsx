import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "./session";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (session && session.user) {
      // authenticated -> ensure we are on the app
      try {
        // use absolute path so the router can find the group root
        router.replace("/(tabs)/profile" as any);
      } catch (e) {
        // swallow router typing/runtime issues
      }
    } else {
      // not authenticated -> send to auth
      try {
        // navigate to the auth stack by absolute path
        router.replace("/auth" as any);
      } catch (e) {
        // swallow router typing/runtime issues
      }
    }
  }, [session, loading]);

  if (loading || session === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
