import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { Stethoscope, UserRound } from "lucide-react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { actualizarRol } from "@/services/perfil";
import { useAuthStore } from "@/store/authStore";
import type { RolUsuario } from "@/types";

export default function SelectRoleScreen() {
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [busy, setBusy] = useState(false);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  const continuar = async () => {
    if (!rol) {
      Alert.alert("Elige un perfil", "Selecciona si eres paciente o profesional de salud.");
      return;
    }
    setBusy(true);
    const { error } = await actualizarRol(rol);
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message);
      return;
    }
    await refreshPerfil();
    router.replace("/");
  };

  return (
    <Screen scroll>
      <View className="pt-8">
        <Text className="text-3xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          ¿Cómo vas a usar VitaTrack?
        </Text>
        <Text className="mt-2 text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Esto nos ayuda a mostrarte las pantallas correctas. Puedes pedirle a tu médico que te vincule después.
        </Text>
      </View>

      <View className="mt-10 gap-4">
        <Pressable
          onPress={() => setRol("paciente")}
          className={`rounded-2xl p-5 ${rol === "paciente" ? "bg-primary-fixed" : "bg-surface-low"}`}
        >
          <View className="flex-row items-center gap-3">
            <UserRound color="#0058bc" size={28} />
            <View className="flex-1">
              <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                Paciente
              </Text>
              <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                Medicamentos, síntomas, signos vitales y alertas para el día a día.
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setRol("doctor")}
          className={`rounded-2xl p-5 ${rol === "doctor" ? "bg-primary-fixed" : "bg-surface-low"}`}
        >
          <View className="flex-row items-center gap-3">
            <Stethoscope color="#0058bc" size={28} />
            <View className="flex-1">
              <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                Doctor o doctora
              </Text>
              <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                Panel clínico para ver adherencia, síntomas y alertas de tus pacientes.
              </Text>
            </View>
          </View>
        </Pressable>

        <GradientButton title={busy ? "Guardando…" : "Continuar"} disabled={busy} onPress={continuar} />
      </View>
    </Screen>
  );
}
