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
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type Form = z.infer<typeof schema>;

export default function LoginScreen() {
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!supabaseConfigured) {
      Alert.alert(
        "Configuración",
        "Agrega EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu entorno."
      );
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
    setBusy(false);
    if (error) {
      Alert.alert("No pudimos entrar", error.message);
      return;
    }
    await refreshPerfil();
    router.replace("/");
  });

  return (
    <Screen scroll withMesh className="px-0">
      <Animated.View 
        entering={FadeInDown.duration(800)}
        className="flex-1 px-8 pt-12 pb-12"
      >
        {/* Header Section */}
        <View className="items-center mb-10">
          <LinearGradient
            colors={["#0058bc", "#0070eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg mb-6"
          >
            <MaterialCommunityIcons name="heart-pulse" size={40} color="white" />
          </LinearGradient>
          <Text className="font-headline text-3xl text-on-surface font-extrabold tracking-tighter">
            Bienvenido de nuevo
          </Text>
          <Text className="mt-2 font-body text-base text-on-surface-variant text-center px-4 leading-relaxed">
            Ingresa tus credenciales para acceder a tu panel de salud.
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-surface-container-lowest p-8 rounded-3xl shadow-cloud border border-outline-variant/10">
          <View className="gap-6">
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
                title={busy ? "Entrando…" : "Iniciar sesión"} 
                disabled={busy} 
                onPress={onSubmit} 
              />
            </View>
          </View>
        </View>

        {/* Footer Links */}
        <View className="mt-10 items-center">
          <View className="flex-row gap-2 mb-4">
            <Text className="font-body text-on-surface-variant">¿No tienes cuenta?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="font-body font-bold text-primary">Regístrate</Text>
              </Pressable>
            </Link>
          </View>
          <Pressable onPress={() => Alert.alert("Próximamente", "La recuperación de contraseña estará disponible pronto.")}>
            <Text className="font-body text-sm text-on-surface-variant opacity-60">
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        {/* Trust Indicators */}
        <View className="mt-16 flex-row justify-center gap-8 opacity-20 grayscale">
          <MaterialCommunityIcons name="shield-check-outline" size={24} color="#1a1c1f" />
          <MaterialCommunityIcons name="lock-check-outline" size={24} color="#1a1c1f" />
          <MaterialCommunityIcons name="medical-bag" size={24} color="#1a1c1f" />
        </View>
      </Animated.View>
    </Screen>
  );
}
