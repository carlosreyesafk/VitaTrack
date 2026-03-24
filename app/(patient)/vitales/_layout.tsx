import { Stack } from "expo-router";

export default function VitalesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#0058bc",
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f9f9fe" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Signos vitales" }} />
      <Stack.Screen name="nuevo" options={{ title: "Nueva lectura" }} />
    </Stack>
  );
}
