import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { actualizarPerfilPaciente } from "@/services/perfil";
import { router } from "expo-router";

const schema = z.object({
  nombre_completo: z.string().min(3),
  telefono: z.string().optional(),
  condicion_medica: z.string().optional(),
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function PacientePerfilScreen() {
  const perfil = useAuthStore((s) => s.perfil);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);
  const signOut = useAuthStore((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_completo: perfil?.nombre_completo ?? "",
      telefono: perfil?.telefono ?? "",
      condicion_medica: perfil?.condicion_medica ?? "",
      contacto_emergencia_nombre: perfil?.contacto_emergencia_nombre ?? "",
      contacto_emergencia_telefono: perfil?.contacto_emergencia_telefono ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    const { error } = await actualizarPerfilPaciente({
      nombre_completo: values.nombre_completo.trim(),
      telefono: values.telefono?.trim() || null,
      condicion_medica: values.condicion_medica?.trim() || null,
      contacto_emergencia_nombre: values.contacto_emergencia_nombre?.trim() || null,
      contacto_emergencia_telefono: values.contacto_emergencia_telefono?.trim() || null,
    });
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message);
      return;
    }
    await refreshPerfil();
    Alert.alert("Listo", "Tus datos se actualizaron.");
  });

  const salir = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen scroll>
      <View className="pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Tu perfil
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Estos datos ayudan a tu médico y a quien te cuida en casa.
        </Text>
      </View>

      {(
        [
          ["nombre_completo", "Nombre completo"],
          ["telefono", "Teléfono"],
          ["condicion_medica", "Condición médica principal"],
          ["contacto_emergencia_nombre", "Contacto de emergencia (nombre)"],
          ["contacto_emergencia_telefono", "Contacto de emergencia (teléfono)"],
        ] as const
      ).map(([name, label]) => (
        <View key={name} className="mb-4">
          <Text className="mb-1 text-xs text-on-surface-variant">{label}</Text>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <>
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline={name === "condicion_medica"}
                  className="rounded-2xl bg-white px-4 py-4 text-on-surface"
                  style={{ fontFamily: "Inter_400Regular" }}
                />
                {fieldState.error && (
                  <Text className="mt-1 text-xs text-error">{fieldState.error.message}</Text>
                )}
              </>
            )}
          />
        </View>
      ))}

      <GradientButton title={busy ? "Guardando…" : "Guardar cambios"} disabled={busy} onPress={onSubmit} />

      <View className="mt-8 rounded-2xl bg-error-container p-4">
        <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Cerrar sesión
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Saldrás de VitaTrack en este dispositivo.
        </Text>
        <View className="mt-3">
          <GradientButton title="Salir" onPress={salir} />
        </View>
      </View>
    </Screen>
  );
}
