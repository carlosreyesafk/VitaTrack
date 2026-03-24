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
    <Screen scroll>
      <Text className="mb-4 text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
        Puedes llenar solo lo que te hayan pedido. Si no tienes un valor a mano, déjalo en blanco.
      </Text>

      {fields.map((f) => (
        <View key={f.name} className="mb-4">
          <Text className="mb-1 text-xs text-on-surface-variant">{f.label}</Text>
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
                className="rounded-2xl bg-white px-4 py-4 text-on-surface"
                style={{ fontFamily: "Inter_400Regular" }}
              />
            )}
          />
        </View>
      ))}

      <GradientButton title={busy ? "Guardando…" : "Guardar lectura"} disabled={busy} onPress={onSubmit} />
    </Screen>
  );
}
