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
  nombre: z.string().min(3, "Escribe tu nombre completo"),
  email: z.string().email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const [busy, setBusy] = useState(false);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  const { control, handleSubmit } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!supabaseConfigured) {
      Alert.alert(
        "Configuración",
        "Agrega EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY."
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
    <Screen scroll>
      <View className="pt-8">
        <Text className="font-headline text-3xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Crear cuenta
        </Text>
        <Text className="mt-2 font-body text-base text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Vamos a personalizar tu experiencia en VitaTrack.
        </Text>
      </View>

      <View className="mt-10 gap-4">
        <View>
          <Text className="mb-1 text-xs text-on-surface-variant">Nombre y apellido</Text>
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <>
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Ej. Ana Gómez de la Rosa"
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
                  placeholder="Mínimo 6 caracteres"
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

        <GradientButton title={busy ? "Creando…" : "Registrarme"} disabled={busy} onPress={onSubmit} />

        <View className="flex-row justify-center gap-1">
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            ¿Ya tienes cuenta?
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-primary" style={{ fontFamily: "Inter_600SemiBold" }}>
                Entrar
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
