import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { generarYGuardarAlertasLocales } from "@/services/alertas";
import { registrarSintoma } from "@/services/sintomas";

const schema = z.object({
  descripcion: z.string().min(3, "Describe el síntoma con un poco más de detalle"),
  intensidad: z.coerce.number().min(1).max(10),
});

type Form = z.infer<typeof schema>;

export default function NuevoSintomaScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { descripcion: "", intensidad: 5 },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!uid) return;
    setBusy(true);
    const { error } = await registrarSintoma({
      paciente_id: uid,
      descripcion: values.descripcion.trim(),
      intensidad: values.intensidad,
    });
    if (!error) {
      await generarYGuardarAlertasLocales(uid, values.descripcion.trim());
    }
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message ?? "");
      return;
    }
    router.back();
  });

  return (
    <Screen scroll>
      <Text className="mb-4 text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
        Sé honesto con la intensidad: 1 es apenas molesto, 10 es lo peor que recuerdas haber sentido.
      </Text>

      <View className="mb-4">
        <Text className="mb-1 text-xs text-on-surface-variant">¿Qué sientes?</Text>
        <Controller
          control={control}
          name="descripcion"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <TextInput
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ej. Mareo al levantarme, dura unos minutos"
                placeholderTextColor="#717786"
                className="rounded-2xl bg-white px-4 py-4 text-on-surface"
                style={{ fontFamily: "Inter_400Regular", textAlignVertical: "top" }}
              />
              {fieldState.error && (
                <Text className="mt-1 text-xs text-error">{fieldState.error.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View className="mb-6">
        <Text className="mb-1 text-xs text-on-surface-variant">Intensidad (1–10)</Text>
        <Controller
          control={control}
          name="intensidad"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <TextInput
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={(t) => onChange(Number(t.replace(/[^0-9]/g, "")))}
                value={String(value)}
                className="rounded-2xl bg-white px-4 py-4 text-on-surface"
                style={{ fontFamily: "Inter_400Regular" }}
              />
              {fieldState.error && (
                <Text className="mt-1 text-xs text-error">Usa un número entre 1 y 10</Text>
              )}
            </>
          )}
        />
      </View>

      <GradientButton title={busy ? "Guardando…" : "Guardar síntoma"} disabled={busy} onPress={onSubmit} />
    </Screen>
  );
}
