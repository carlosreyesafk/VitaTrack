import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Alert, Text, TextInput, View, Pressable } from "react-native";
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
    <Screen scroll>
      <View className="pt-8">
        <Text className="font-headline text-3xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          VitaTrack
        </Text>
        <Text className="mt-2 font-body text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Tu salud crónica, con seguimiento claro y cercano.
        </Text>
      </View>

      <View className="mt-10 gap-4">
        <Text className="font-body text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Iniciar sesión
        </Text>

        <View>
          <Text className="mb-1 text-xs text-on-surface-variant">Correo electrónico</Text>
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
                  placeholderTextColor="#717786"
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

        <View>
          <Text className="mb-1 text-xs text-on-surface-variant">Contraseña</Text>
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
                  placeholderTextColor="#717786"
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

        <GradientButton title={busy ? "Entrando…" : "Entrar"} disabled={busy} onPress={onSubmit} />

        <View className="flex-row justify-center gap-1">
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
