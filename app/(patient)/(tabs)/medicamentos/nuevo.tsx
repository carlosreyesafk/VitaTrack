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
import { crearMedicamento } from "@/services/medicamentos";
import Animated, { FadeInDown } from "react-native-reanimated";

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
      Alert.alert("Error", error.message);
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
            Nuevo Tratamiento
          </Text>
          <Text className="mt-2 font-body text-on-surface-variant leading-relaxed">
            Los horarios ayudan a calcular adherencia y recordatorios. Usa formato 24 horas.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-surface-container-lowest p-8 rounded-[32px] shadow-cloud border border-outline-variant/10">
          <View className="gap-6">
            <FormField
              label="Nombre del medicamento"
              icon="pill"
              control={control}
              name="nombre"
              placeholder="Ej: Metformina"
            />
            <FormField
              label="Dosis"
              icon="numeric"
              control={control}
              name="dosis"
              placeholder="Ej: 500mg"
            />
            <FormField
              label="Frecuencia"
              icon="repeat"
              control={control}
              name="frecuencia"
              placeholder="Ej: Cada 12 horas"
            />
            <FormField
              label="Horarios (24h, sep. por comas)"
              icon="clock-outline"
              control={control}
              name="horarios"
              placeholder="08:00, 20:00"
            />

            <View className="pt-4">
              <GradientButton title={busy ? "Guardando…" : "Guardar tratamiento"} disabled={busy} onPress={onSubmit} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

function FormField({ label, icon, control, name, placeholder }: any) {
  return (
    <View>
      <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <View>
            <View className="relative">
              <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
                <MaterialCommunityIcons 
                  name={icon} 
                  size={20} 
                  color={fieldState.error ? "#ba1a1a" : "#717786"} 
                />
              </View>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-xl text-on-surface font-body"
                style={{ fontFamily: "Inter_400Regular" }}
              />
            </View>
            {fieldState.error && (
              <Text className="mt-1 ml-1 text-xs text-error font-body">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
