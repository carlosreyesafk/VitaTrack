import { Stack } from "expo-router";

export default function PatientRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f9f9fe" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vitales" />
      <Stack.Screen name="consulta" options={{ presentation: "modal" }} />
    </Stack>
  );
}
