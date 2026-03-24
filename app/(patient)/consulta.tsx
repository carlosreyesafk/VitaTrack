import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { enviarConsultaRapida } from "@/services/consultas";

const schema = z.object({
  asunto: z.string().min(3, "Escribe un asunto breve"),
  mensaje: z.string().min(8, "Cuenta un poco más para que tu médico entienda el contexto"),
});

type Form = z.infer<typeof schema>;

export default function ConsultaRapidaScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { asunto: "", mensaje: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!uid) return;
    setBusy(true);
    const { error } = await enviarConsultaRapida({
      paciente_id: uid,
      asunto: values.asunto.trim(),
      mensaje: values.mensaje.trim(),
    });
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo enviar", error.message);
      return;
    }
    Alert.alert("Enviado", "Tu mensaje quedó registrado. Tu médico lo verá cuando entre a VitaTrack.");
    router.back();
  });

  return (
    <Screen scroll>
      <View className="pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Consulta rápida
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          No sustituye una visita ni una emergencia. Si tienes dolor fuerte, dificultad para respirar o algo que no puede
          esperar, busca ayuda médica de inmediato.
        </Text>
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-xs text-on-surface-variant">Asunto</Text>
        <Controller
          control={control}
          name="asunto"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ej. Dudas con la dosis de la noche"
                placeholderTextColor="#717786"
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

      <View className="mb-6">
        <Text className="mb-1 text-xs text-on-surface-variant">Mensaje</Text>
        <Controller
          control={control}
          name="mensaje"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <>
              <TextInput
                multiline
                numberOfLines={6}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Describe qué te preocupa y desde cuándo."
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

      <GradientButton title={busy ? "Enviando…" : "Enviar al médico"} disabled={busy} onPress={onSubmit} />
    </Screen>
  );
}
