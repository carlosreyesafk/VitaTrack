import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, Dimensions } from "react-native";
import { HeartPulse, Pill, Plus } from "lucide-react-native";

import { LineChart } from "react-native-chart-kit";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarSignos } from "@/services/signos";
import type { SignoVital } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

const w = Dimensions.get("window").width - 40;

export default function VitalesIndexScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<SignoVital[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await listarSignos(uid, 20);
    setItems((data as SignoVital[]) ?? []);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const glucosas = items
    .filter((s) => s.glucosa != null)
    .slice(0, 8)
    .reverse()
    .map((s) => Number(s.glucosa));

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
    <Screen scroll className="bg-surface">
      <View className="pb-6 pt-8 px-2 flex-row justify-between items-end">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-widest text-on-surface-variant" style={{ fontFamily: "Inter_600SemiBold" }}>
            Seguimiento
          </Text>
          <Text className="mt-2 text-4xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
            Vitales
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(patient)/vitales/nuevo")}
          className="bg-primary px-5 py-3 rounded-2xl shadow-elevated active:opacity-90"
          style={{ shadowColor: "#2563eb", shadowOpacity: 0.2 }}
        >
          <Text className="text-white text-sm" style={{ fontFamily: "Inter_600SemiBold" }}>+ Nuevo</Text>
        </Pressable>
      </View>

      {glucosas.length >= 2 && (
        <Card className="mb-4">
          <Text className="mb-2 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
            Tendencia de glucosa (últimas lecturas)
          </Text>
          <LineChart
            data={{
              labels: glucosas.map((_, i) => `${i + 1}`),
              datasets: [{ data: glucosas.length ? glucosas : [0] }],
            }}
            width={w}
            height={200}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 88, 188, ${opacity})`,
              labelColor: () => "#414755",
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </Card>
      )}

      {items.length === 0 ? (
        <View className="mt-12 items-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-surface-low mb-6">
            <HeartPulse color="#94a3b8" size={40} />
          </View>
          <Text className="text-lg text-on-surface text-center" style={{ fontFamily: "Inter_600SemiBold" }}>
            Sin registros aún
          </Text>
          <Text className="mt-2 text-sm text-on-surface-variant text-center leading-5" style={{ fontFamily: "Inter_400Regular" }}>
            Toma tus medidas de presión, glucosa o pulso y regístralas para ver tu progreso.
          </Text>
        </View>
      ) : (
        <View className="px-1 pb-8">
          {items.map((sg) => (
            <Card key={sg.id} className="mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  className="text-[10px] uppercase tracking-widest text-on-surface-variant"
                  style={{ fontFamily: "Inter_600SemiBold" }}
                >
                  {new Date(sg.registrado_en).toLocaleDateString("es-DO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <Text className="text-[10px] text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                  {new Date(sg.registrado_en).toLocaleTimeString("es-DO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-4">
                {sg.presion_sistolica && sg.presion_diastolica && (
                  <View className="flex-1 min-w-[45%]">
                    <Text
                      className="text-[10px] uppercase text-on-surface-variant mb-1"
                      style={{ fontFamily: "Inter_500Medium" }}
                    >
                      Presión
                    </Text>
                    <Text className="text-xl text-on-surface" style={{ fontFamily: "Manrope_700Bold" }}>
                      {sg.presion_sistolica}/{sg.presion_diastolica}
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">mmHg</Text>
                  </View>
                )}
                {sg.glucosa != null && (
                  <View className="flex-1 min-w-[45%]">
                    <Text
                      className="text-[10px] uppercase text-on-surface-variant mb-1"
                      style={{ fontFamily: "Inter_500Medium" }}
                    >
                      Glucosa
                    </Text>
                    <Text className="text-xl text-on-surface" style={{ fontFamily: "Manrope_700Bold" }}>
                      {sg.glucosa}
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">mg/dL</Text>
                  </View>
                )}
                {sg.pulso != null && (
                  <View className="flex-1 min-w-[45%]">
                    <Text
                      className="text-[10px] uppercase text-on-surface-variant mb-1"
                      style={{ fontFamily: "Inter_500Medium" }}
                    >
                      Pulso
                    </Text>
                    <Text className="text-xl text-on-surface" style={{ fontFamily: "Manrope_700Bold" }}>
                      {sg.pulso}
                    </Text>
                    <Text className="text-[10px] text-on-surface-variant">lpm</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
