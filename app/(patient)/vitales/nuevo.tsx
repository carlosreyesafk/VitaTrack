import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { registrarSigno } from "@/services/signos";
import { generarYGuardarAlertasLocales } from "@/services/alertas";

const schema = z.object({
  presion_sistolica: z.string().optional(),
  presion_diastolica: z.string().optional(),
  glucosa: z.string().optional(),
  temperatura: z.string().optional(),
  pulso: z.string().optional(),
  notas: z.string().optional(),
});

type Form = z.infer<typeof schema>;

function numOrNull(s?: string) {
  if (!s?.trim()) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export default function NuevoSignoScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!uid) return;
    setBusy(true);
    const { error } = await registrarSigno({
      paciente_id: uid,
      presion_sistolica: numOrNull(values.presion_sistolica) as number | null,
      presion_diastolica: numOrNull(values.presion_diastolica) as number | null,
      glucosa: numOrNull(values.glucosa),
      temperatura: numOrNull(values.temperatura),
      pulso: numOrNull(values.pulso) as number | null,
      notas: values.notas?.trim() || null,
    });
    if (!error) await generarYGuardarAlertasLocales(uid);
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message ?? "");
      return;
    }
    router.back();
  });

  const fields: { name: keyof Form; label: string; keyboard?: "decimal-pad" | "number-pad" }[] = [
    { name: "presion_sistolica", label: "Presión sistólica (mmHg)", keyboard: "number-pad" },
    { name: "presion_diastolica", label: "Presión diastólica (mmHg)", keyboard: "number-pad" },
    { name: "glucosa", label: "Glucosa (mg/dL)", keyboard: "decimal-pad" },
    { name: "temperatura", label: "Temperatura (°C)", keyboard: "decimal-pad" },
    { name: "pulso", label: "Pulso (lpm)", keyboard: "number-pad" },
    { name: "notas", label: "Notas (opcional)" },
  ];

  return (
    <Screen scroll className="bg-surface">
      <View className="pb-6 pt-8 px-2">
        <Text className="text-xs uppercase tracking-widest text-on-surface-variant" style={{ fontFamily: "Inter_600SemiBold" }}>
          Registro
        </Text>
        <Text className="mt-2 text-4xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Nueva lectura
        </Text>
        <Text className="mt-2 text-base text-on-surface-variant leading-6" style={{ fontFamily: "Inter_400Regular" }}>
          Completa solo los campos necesarios. Deja en blanco los que no hayas medido.
        </Text>
      </View>

      <View className="px-1 gap-6 pb-10">
        {fields.map((f) => (
          <View key={f.name}>
            <Text className="mb-2 ml-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
              {f.label}
            </Text>
            <Controller
              control={control}
              name={f.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType={f.keyboard}
                  multiline={f.name === "notas"}
                  placeholder={f.name === "notas" ? "Alguna observación..." : "0"}
                  placeholderTextColor="#94a3b8"
                  className={`rounded-3xl bg-white border border-outline-variant/30 px-5 text-on-surface shadow-sm ${
                    f.name === "notas" ? "py-5 h-32 text-top" : "py-5"
                  }`}
                  style={{ fontFamily: "Inter_400Regular" }}
                />
              )}
            />
          </View>
        ))}

        <View className="mt-4">
          <GradientButton title={busy ? "Guardando…" : "Guardar lectura"} disabled={busy} onPress={onSubmit} />
        </View>
      </View>
    </Screen>
  );
}
