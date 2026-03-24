import { Stack } from "expo-router";

export default function DoctorRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f9f9fe" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="paciente/[id]"
        options={{
          headerShown: true,
          title: "Seguimiento del paciente",
          headerTintColor: "#0058bc",
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
