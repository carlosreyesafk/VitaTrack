import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { actualizarPerfilDoctor } from "@/services/perfil";
import { router } from "expo-router";

const schema = z.object({
  nombre_completo: z.string().min(3),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function DoctorPerfilScreen() {
  const perfil = useAuthStore((s) => s.perfil);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);
  const signOut = useAuthStore((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_completo: perfil?.nombre_completo ?? "",
      telefono: perfil?.telefono ?? "",
      especialidad: perfil?.especialidad ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    const { error } = await actualizarPerfilDoctor({
      nombre_completo: values.nombre_completo.trim(),
      telefono: values.telefono?.trim() || undefined,
      especialidad: values.especialidad?.trim() || undefined,
    });
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message);
      return;
    }
    await refreshPerfil();
    Alert.alert("Listo", "Tu perfil profesional quedó actualizado.");
  });

  const salir = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen scroll>
      <View className="pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Perfil médico
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Esto lo ven tus pacientes cuando compartes información básica.
        </Text>
      </View>

      {(
        [
          ["nombre_completo", "Nombre completo"],
          ["telefono", "Teléfono de consulta"],
          ["especialidad", "Especialidad o área"],
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

      <GradientButton title={busy ? "Guardando…" : "Guardar"} disabled={busy} onPress={onSubmit} />

      <View className="mt-8 rounded-2xl bg-error-container p-4">
        <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Cerrar sesión
        </Text>
        <View className="mt-3">
          <GradientButton title="Salir" onPress={salir} />
        </View>
      </View>
    </Screen>
  );
}
