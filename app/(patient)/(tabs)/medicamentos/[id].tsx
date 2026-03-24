import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text, TextInput, View, ActivityIndicator } from "react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { supabase } from "@/lib/supabase";
import { actualizarMedicamento } from "@/services/medicamentos";
import type { Medicamento } from "@/types";

const schema = z.object({
  nombre: z.string().min(2),
  dosis: z.string().min(1),
  frecuencia: z.string().min(1),
  horarios: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export default function EditarMedicamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const { control, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", dosis: "", frecuencia: "", horarios: "" },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("medicamentos").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        Alert.alert("No encontrado", "Vuelve atrás e intenta de nuevo.");
        router.back();
        return;
      }
      const m = data as Medicamento;
      const hrs = Array.isArray(m.horarios) ? m.horarios.join(", ") : String(m.horarios ?? "");
      reset({
        nombre: m.nombre,
        dosis: m.dosis,
        frecuencia: m.frecuencia,
        horarios: hrs,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const horarios = values.horarios
      .split(/[,\s]+/)
      .map((h) => h.trim())
      .filter(Boolean);
    setBusy(true);
    const { error } = await actualizarMedicamento(id, {
      nombre: values.nombre.trim(),
      dosis: values.dosis.trim(),
      frecuencia: values.frecuencia.trim(),
      horarios,
    });
    setBusy(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.back();
  });

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
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
      <GradientButton title={busy ? "Guardando…" : "Actualizar"} disabled={busy} onPress={onSubmit} />
    </Screen>
  );
}
