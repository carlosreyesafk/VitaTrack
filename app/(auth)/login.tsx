import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Alert, Text, TextInput, View, Pressable } from "react-native";
import { HeartPulse } from "lucide-react-native";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type Form = z.infer<typeof schema>;

export default function LoginScreen() {
  const [busy, setBusy] = useState(false);
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
    <Screen scroll className="bg-surface">
      <View className="pt-12 items-center">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
          <HeartPulse color="#2563eb" size={40} />
        </View>
        <Text
          className="font-headline text-4xl text-on-surface tracking-tight"
          style={{ fontFamily: "Manrope_800ExtraBold" }}
        >
          VitaTrack
        </Text>
        <Text
          className="mt-3 font-body text-base text-on-surface-variant text-center px-4"
          style={{ fontFamily: "Inter_400Regular" }}
        >
          Tu salud crónica, con seguimiento{"\n"}claro y cercano.
        </Text>
      </View>

      <View className="mt-12 gap-6 px-2">
        <Text className="font-body text-xl text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Iniciar sesión
        </Text>

        <View className="gap-5">
          <View>
            <Text className="mb-2 ml-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
              Correo electrónico
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="tu@correo.com"
                    placeholderTextColor="#94a3b8"
                    className="rounded-3xl bg-white border border-outline-variant/30 px-5 py-5 text-on-surface shadow-sm"
                    style={{ fontFamily: "Inter_400Regular" }}
                  />
                  {fieldState.error && (
                    <Text className="mt-1 ml-1 text-xs text-error">{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View>
            <Text className="mb-2 ml-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
              Contraseña
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <>
                  <TextInput
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    className="rounded-3xl bg-white border border-outline-variant/30 px-5 py-5 text-on-surface shadow-sm"
                    style={{ fontFamily: "Inter_400Regular" }}
                  />
                  {fieldState.error && (
                    <Text className="mt-1 ml-1 text-xs text-error">{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </View>
        </View>

        <View className="mt-4">
          <GradientButton title={busy ? "Entrando…" : "Entrar"} disabled={busy} onPress={onSubmit} />
        </View>

        <View className="flex-row justify-center gap-2 pt-2">
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            ¿No tienes cuenta?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-primary" style={{ fontFamily: "Inter_600SemiBold" }}>
                Regístrate
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
