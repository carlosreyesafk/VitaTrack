import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Alert, Text, TextInput, View, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const schema = z.object({
  nombre: z.string().min(3, "Escribe tu nombre completo"),
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!supabaseConfigured) {
      Alert.alert(
        "Configuración",
        "Agrega EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      options: {
        data: { nombre_completo: values.nombre.trim() },
      },
    });
    setBusy(false);
    if (error) {
      Alert.alert("Registro", error.message);
      return;
    }
    if (!data.session) {
      Alert.alert(
        "Revisa tu correo",
        "Si tu proyecto requiere confirmación, abre el enlace que te enviamos y vuelve a entrar."
      );
      router.replace("/(auth)/login");
      return;
    }
    await supabase.from("perfiles").update({ nombre_completo: values.nombre.trim() }).eq("id", data.user!.id);
    await refreshPerfil(data.user!.id);
    router.replace("/select-role");
  });

  return (
    <Screen scroll withMesh className="px-0">
      <Animated.View 
        entering={FadeInDown.duration(800)}
        className="flex-1 px-8 pt-8 pb-12"
      >
        {/* Header Section */}
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6">
            <MaterialCommunityIcons name="arrow-left" size={28} color="#0058bc" />
          </Pressable>
          <Text className="font-headline text-3xl text-on-surface font-extrabold tracking-tighter">
            Comienza tu viaje
          </Text>
          <Text className="mt-2 font-body text-base text-on-surface-variant leading-relaxed">
            Únete a la nueva era del seguimiento de salud personalizado con VitaTrack.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-surface-container-lowest p-8 rounded-3xl shadow-cloud border border-outline-variant/10">
          <View className="gap-6">
            {/* Name Field */}
            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                Nombre completo
              </Text>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
                        <MaterialCommunityIcons 
                          name="account-outline" 
                          size={20} 
                          color={fieldState.error ? "#ba1a1a" : "#717786"} 
                        />
                      </View>
                      <TextInput
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="Ej: Julian Carter"
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

            {/* Email Field */}
            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                Correo electrónico
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
                        <MaterialCommunityIcons 
                          name="email-outline" 
                          size={20} 
                          color={fieldState.error ? "#ba1a1a" : "#717786"} 
                        />
                      </View>
                      <TextInput
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="tu@correo.com"
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

            {/* Password Field */}
            <View>
              <Text className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                Contraseña
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <View>
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
                        <MaterialCommunityIcons 
                          name="lock-outline" 
                          size={20} 
                          color={fieldState.error ? "#ba1a1a" : "#717786"} 
                        />
                      </View>
                      <TextInput
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        className="w-full h-14 pl-12 pr-12 bg-surface-container rounded-xl text-on-surface font-body"
                        style={{ fontFamily: "Inter_400Regular" }}
                      />
                      <Pressable 
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-4"
                      >
                        <MaterialCommunityIcons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color="#717786" 
                        />
                      </Pressable>
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

            <View className="pt-2">
              <GradientButton 
                title={busy ? "Creando…" : "Crear cuenta"} 
                disabled={busy} 
                onPress={onSubmit} 
              />
            </View>
          </View>
        </View>

        {/* Footer Link */}
        <View className="mt-10 items-center">
          <View className="flex-row gap-2">
            <Text className="font-body text-on-surface-variant">¿Ya tienes cuenta?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="font-body font-bold text-primary">Iniciar sesión</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Security Badge */}
        <View className="mt-12 items-center opacity-40">
          <Text className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            Protección de datos de grado médico
          </Text>
          <View className="flex-row gap-6 items-center">
            <View className="bg-on-surface-variant/10 px-3 py-1 rounded">
              <Text className="text-[10px] font-bold">HIPAA COMPLIANT</Text>
            </View>
            <View className="bg-on-surface-variant/10 px-3 py-1 rounded">
              <Text className="text-[10px] font-bold">256-BIT AES</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}
