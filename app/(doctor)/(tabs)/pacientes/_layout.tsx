import { Stack } from "expo-router";

export default function PacientesDoctorStackLayout() {
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
      <Stack.Screen name="index" options={{ title: "Pacientes" }} />
    </Stack>
  );
}
