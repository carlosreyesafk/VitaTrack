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
    <Screen scroll className="bg-surface">
      <View className="pb-6 pt-8 px-2">
        <Text className="text-xs uppercase tracking-widest text-on-surface-variant" style={{ fontFamily: "Inter_600SemiBold" }}>
          Comunicación
        </Text>
        <Text className="mt-2 text-4xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Consulta rápida
        </Text>
        <Text className="mt-3 text-base text-on-surface-variant leading-6" style={{ fontFamily: "Inter_400Regular" }}>
          Utiliza este espacio para dudas no urgentes. En caso de emergencia, busca ayuda médica inmediata.
        </Text>
      </View>

      <View className="px-1 gap-6 pb-10">
        <View>
          <Text className="mb-2 ml-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
            Asunto
          </Text>
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
                  placeholderTextColor="#94a3b8"
                  className="rounded-3xl bg-white border border-outline-variant/30 px-5 py-5 text-on-surface shadow-sm"
                  style={{ fontFamily: "Inter_400Regular" }}
                />
                {fieldState.error && (
                  <Text className="mt-1 ml-1 text-xs text-error">{fieldState.error.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View>
          <Text className="mb-2 ml-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
            Mensaje detallado
          </Text>
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
                  placeholder="Describe qué te preocupa y desde cuándo..."
                  placeholderTextColor="#94a3b8"
                  className="rounded-3xl bg-white border border-outline-variant/30 px-5 py-5 h-48 text-on-surface shadow-sm"
                  style={{ fontFamily: "Inter_400Regular", textAlignVertical: "top" }}
                />
                {fieldState.error && (
                  <Text className="mt-1 ml-1 text-xs text-error">{fieldState.error.message}</Text>
                )}
              </>
            )}
          />
        </View>

        <View className="mt-4">
          <GradientButton title={busy ? "Enviando…" : "Enviar al médico"} disabled={busy} onPress={onSubmit} />
        </View>
      </View>
    </Screen>
  );
}
