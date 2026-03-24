import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Alert, Text, TextInput, View } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { crearMedicamento } from "@/services/medicamentos";

const schema = z.object({
  nombre: z.string().min(2, "Indica el nombre"),
  dosis: z.string().min(1, "Indica la dosis"),
  frecuencia: z.string().min(1, "Indica la frecuencia"),
  horarios: z.string().min(1, "Ej. 08:00, 20:00"),
});

type Form = z.infer<typeof schema>;

export default function NuevoMedicamentoScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", dosis: "", frecuencia: "", horarios: "08:00, 20:00" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!uid) return;
    const horarios = values.horarios
      .split(/[,\s]+/)
      .map((h) => h.trim())
      .filter(Boolean);
    setBusy(true);
    const { error } = await crearMedicamento({
      paciente_id: uid,
      nombre: values.nombre.trim(),
      dosis: values.dosis.trim(),
      frecuencia: values.frecuencia.trim(),
      horarios,
    });
    setBusy(false);
    if (error) {
      Alert.alert("No se pudo guardar", error.message);
      return;
    }
    router.back();
  });

  return (
    <Screen scroll>
      <Text className="mb-4 text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
        Los horarios ayudan a calcular adherencia y recordatorios. Usa formato 24 horas separado por comas.
      </Text>

      {(["nombre", "dosis", "frecuencia", "horarios"] as const).map((field) => (
        <View key={field} className="mb-4">
          <Text className="mb-1 text-xs capitalize text-on-surface-variant">
            {field === "horarios" ? "Horarios (24h)" : field}
          </Text>
          <Controller
            control={control}
            name={field}
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
    </Screen>
  );
}
