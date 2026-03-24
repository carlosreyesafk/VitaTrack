import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Text, TextInput, View, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { actualizarPerfilDoctor } from "@/services/perfil";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

const schema = z.object({
  nombre_completo: z.string().min(3, "El nombre es demasiado corto"),
  telefono: z.string().optional(),
  especialidad: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function DoctorPerfilScreen() {
  const perfil = useAuthStore((s) => s.perfil);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);
  const signOut = useAuthStore((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre_completo: perfil?.nombre_completo ?? "",
      telefono: perfil?.telefono ?? "",
      especialidad: perfil?.especialidad ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    const { error } = await actualizarPerfilDoctor({
      nombre_completo: values.nombre_completo.trim(),
      telefono: values.telefono?.trim() || undefined,
      especialidad: values.especialidad?.trim() || undefined,
    });
    setBusy(false);
    if (error) {
      Alert.alert("Error de Actualización", error.message);
      return;
    }
    await refreshPerfil();
    Alert.alert("Éxito", "Su perfil profesional ha sido actualizado correctamente.");
  });

  const salir = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Configuración Profesional
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            Perfil Médico
          </Text>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Esta información es visible para sus pacientes vinculados.
          </Text>
        </View>

        {/* Profile Form Card */}
        <Animated.View 
          entering={FadeInDown.duration(800)}
          className="bg-surface-container-lowest p-8 rounded-[32px] shadow-cloud border border-outline-variant/10 mb-10"
        >
          <Text className="font-headline text-xl text-on-surface font-bold mb-6">Información General</Text>
          
          {(
            [
              ["nombre_completo", "Nombre Completo", "account-outline"],
              ["telefono", "Teléfono de Consulta", "phone-outline"],
              ["especialidad", "Especialidad Médica", "stethoscope"],
            ] as const
          ).map(([name, label, icon], idx) => (
            <View key={name} className="mb-6">
              <Text className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                {label}
              </Text>
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
                        <MaterialCommunityIcons name={icon} size={20} color="#717786" />
                      </View>
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder={label}
                        placeholderTextColor="#94a3b8"
                        className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-2xl text-on-surface font-body"
                        style={{ fontFamily: "Inter_400Regular" }}
                      />
                    </View>
                    {fieldState.error && (
                      <Text className="mt-1 ml-1 text-[10px] text-error font-medium uppercase tracking-tighter">
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          ))}

          <View className="mt-2">
            <GradientButton 
              title={busy ? "Sincronizando..." : "Actualizar Perfil"} 
              disabled={busy} 
              onPress={onSubmit} 
            />
          </View>
        </Animated.View>

        {/* Session Card */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          className="bg-error/5 p-8 rounded-[32px] border border-error/10 items-center"
        >
          <MaterialCommunityIcons name="logout-variant" size={32} color="#ba1a1a" className="mb-4" />
          <Text className="text-on-surface font-headline text-lg font-bold mb-2">Finalizar Sesión</Text>
          <Text className="text-on-surface-variant text-xs font-body text-center mb-6 opacity-60">
            Se cerrará el acceso a su panel clínico en este dispositivo.
          </Text>
          <Pressable 
            onPress={salir}
            className="w-full h-12 bg-white rounded-2xl items-center justify-center border border-error/20"
          >
            <Text className="text-error font-bold text-sm tracking-wide">Cerrar Sesión</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Screen>
  );
}
