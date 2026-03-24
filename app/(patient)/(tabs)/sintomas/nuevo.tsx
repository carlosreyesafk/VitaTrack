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
import { generarYGuardarAlertasLocales } from "@/services/alertas";
import { registrarSintoma } from "@/services/sintomas";
import Animated, { FadeInDown } from "react-native-reanimated";

const schema = z.object({
  descripcion: z.string().min(3, "Describe el síntoma con un poco más de detalle"),
  intensidad: z.coerce.number().min(1).max(10),
});

type Form = z.infer<typeof schema>;

const SUGGESTIONS = [
  "Dolor de cabeza",
  "Mareos",
  "Náuseas",
  "Fatiga",
  "Palpitaciones",
  "Fiebre",
  "Dolor muscular"
];

export default function NuevoSintomaScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [busy, setBusy] = useState(false);
  const { control, handleSubmit, setValue, watch } = useForm<Form>({
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
      Alert.alert("Error", error.message ?? "");
      return;
    }
    router.back();
  });

  const selectedIntensity = watch("intensidad");

  return (
    <Screen withMesh scroll className="px-0">
      <Animated.View entering={FadeInDown.duration(800)} className="px-8 pt-6 pb-12">
        {/* Header */}
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6">
            <MaterialCommunityIcons name="arrow-left" size={28} color="#0058bc" />
          </Pressable>
          <Text className="font-headline text-3xl text-on-surface font-extrabold tracking-tighter">
            Registro de Síntomas
          </Text>
          <Text className="mt-2 font-body text-on-surface-variant leading-relaxed">
            Describe tu estado actual para un mejor control clínico.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-surface-container-lowest p-8 rounded-[32px] shadow-cloud border border-outline-variant/10">
          <View className="gap-8">
            {/* Description Field */}
            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4 ml-1">
                ¿Qué sientes hoy?
              </Text>
              
              <Controller
                control={control}
                name="descripcion"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View>
                    <TextInput
                      multiline
                      numberOfLines={4}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Describe el síntoma..."
                      placeholderTextColor="#94a3b8"
                      className="w-full bg-surface-container rounded-2xl p-4 text-on-surface font-body min-h-[120px]"
                      style={{ fontFamily: "Inter_400Regular", textAlignVertical: "top" }}
                    />
                    {fieldState.error && (
                      <Text className="mt-2 ml-1 text-xs text-error font-body">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {/* Suggestions Chips */}
              <View className="flex-row flex-wrap gap-2 mt-4">
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setValue("descripcion", s)}
                    className="px-4 py-2 bg-primary/5 rounded-full border border-primary/10"
                  >
                    <Text className="text-primary text-xs font-semibold">{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Intensity Field */}
            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4 ml-1">
                Intensidad: <Text className="text-primary">{selectedIntensity}/10</Text>
              </Text>
              
              <View className="flex-row justify-between mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Pressable
                    key={num}
                    onPress={() => setValue("intensidad", num)}
                    className={`w-7 h-7 rounded-full items-center justify-center ${
                      selectedIntensity === num ? "bg-primary" : "bg-surface-container"
                    }`}
                  >
                    <Text 
                      className={`text-[10px] font-bold ${
                        selectedIntensity === num ? "text-white" : "text-on-surface-variant"
                      }`}
                    >
                      {num}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View className="flex-row justify-between px-1">
                <Text className="text-[10px] text-on-surface-variant uppercase font-bold opacity-40 tracking-tighter">Leve</Text>
                <Text className="text-[10px] text-on-surface-variant uppercase font-bold opacity-40 tracking-tighter">Moderado</Text>
                <Text className="text-[10px] text-on-surface-variant uppercase font-bold opacity-40 tracking-tighter">Severo</Text>
              </View>
            </View>

            <View className="pt-4">
              <GradientButton title={busy ? "Registrando…" : "Guardar síntoma"} disabled={busy} onPress={onSubmit} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}
