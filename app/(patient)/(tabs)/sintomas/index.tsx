import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { Plus } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarSintomas } from "@/services/sintomas";
import type { Sintoma } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function SintomasListScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<Sintoma[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await listarSintomas(uid, 40);
    setItems((data as Sintoma[]) ?? []);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Síntomas
        </Text>
        <Pressable
          onPress={() => router.push("/(patient)/(tabs)/sintomas/nuevo")}
          className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed"
        >
          <Plus color="#0058bc" size={26} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Cuando algo te moleste —aunque sea leve— regístralo aquí. Ayuda a tu médico a ver el panorama completo.
          </Text>
        </Card>
      ) : (
        items.map((s) => (
          <Card key={s.id} className="mb-3">
            <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
              {s.descripcion}
            </Text>
            <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Intensidad {s.intensidad}/10
            </Text>
            <Text className="mt-1 text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              {new Date(s.registrado_en).toLocaleString("es-DO")}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
