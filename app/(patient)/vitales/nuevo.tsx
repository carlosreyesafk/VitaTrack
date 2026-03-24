import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Alert, Text, TextInput, View, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { registrarSigno } from "@/services/signos";
import { generarYGuardarAlertasLocales } from "@/services/alertas";
import Animated, { FadeInDown } from "react-native-reanimated";

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
      Alert.alert("Error", error.message ?? "");
      return;
    }
    router.back();
  });

  return (
    <Screen withMesh scroll className="px-0">
      <Animated.View entering={FadeInDown.duration(800)} className="px-8 pt-6 pb-12">
        {/* Header */}
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6">
            <MaterialCommunityIcons name="arrow-left" size={28} color="#0058bc" />
          </Pressable>
          <Text className="font-headline text-3xl text-on-surface font-extrabold tracking-tighter">
            Nueva Registro
          </Text>
          <Text className="mt-2 font-body text-on-surface-variant leading-relaxed">
            Completa solo los campos necesarios. Deja en blanco los que no hayas medido.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-surface-container-lowest p-8 rounded-[32px] shadow-cloud border border-outline-variant/10">
          <View className="gap-6">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <VitalField
                  label="Sistólica"
                  icon="gauge"
                  control={control}
                  name="presion_sistolica"
                  placeholder="120"
                />
              </View>
              <View className="flex-1">
                <VitalField
                  label="Diastólica"
                  icon="gauge-low"
                  control={control}
                  name="presion_diastolica"
                  placeholder="80"
                />
              </View>
            </View>

            <VitalField
              label="Glucosa (mg/dL)"
              icon="water-outline"
              control={control}
              name="glucosa"
              placeholder="95"
            />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <VitalField
                  label="Pulso (LPM)"
                  icon="heart-pulse"
                  control={control}
                  name="pulso"
                  placeholder="72"
                />
              </View>
              <View className="flex-1">
                <VitalField
                  label="Temp (°C)"
                  icon="thermometer"
                  control={control}
                  name="temperatura"
                  placeholder="36.5"
                />
              </View>
            </View>

            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                Notas (opcional)
              </Text>
              <Controller
                control={control}
                name="notas"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    multiline
                    numberOfLines={3}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Alguna observación relevante..."
                    placeholderTextColor="#94a3b8"
                    className="w-full bg-surface-container rounded-2xl p-4 text-on-surface font-body min-h-[100px]"
                    style={{ fontFamily: "Inter_400Regular", textAlignVertical: "top" }}
                  />
                )}
              />
            </View>

            <View className="pt-4">
              <GradientButton title={busy ? "Registrando…" : "Guardar medición"} disabled={busy} onPress={onSubmit} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

function VitalField({ label, icon, control, name, placeholder }: any) {
  return (
    <View>
      <Text className="font-label text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="relative">
            <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
              <MaterialCommunityIcons name={icon} size={18} color="#717786" />
            </View>
            <TextInput
              keyboardType="numeric"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-xl text-on-surface font-body"
              style={{ fontFamily: "Inter_400Regular" }}
            />
          </View>
        )}
      />
    </View>
  );
}
