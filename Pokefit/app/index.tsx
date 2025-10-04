import { Redirect } from "expo-router";

export default function Index() {
  // send web users to your main tabs (or to /login if you prefer)
  return <Redirect href="/(tabs)/profile" />;
}