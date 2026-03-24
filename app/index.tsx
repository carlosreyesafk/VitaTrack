import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { supabaseConfigured } from "@/lib/supabase";

export default function Index() {
  const { session, perfil, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0058bc" />
      </View>
    );
  }

  if (!supabaseConfigured) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!perfil?.rol) {
    return <Redirect href="/select-role" />;
  }

  if (perfil.rol === "paciente") {
    return <Redirect href="/(patient)/(tabs)" />;
  }

  return <Redirect href="/(doctor)/(tabs)" />;
}
