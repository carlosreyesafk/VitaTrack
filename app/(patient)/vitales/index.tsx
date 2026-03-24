import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, Dimensions } from "react-native";
import { Plus } from "lucide-react-native";
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
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Signos vitales
        </Text>
        <Pressable
          onPress={() => router.push("/(patient)/vitales/nuevo")}
          className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed"
        >
          <Plus color="#0058bc" size={26} />
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
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Registra presión, glucosa, temperatura o pulso cuando te lo indique tu médico o si notas algo raro en casa.
          </Text>
        </Card>
      ) : (
        items.map((s) => (
          <Card key={s.id} className="mb-3">
            <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
              {new Date(s.registrado_en).toLocaleString("es-DO")}
            </Text>
            <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              {s.presion_sistolica && s.presion_diastolica
                ? `Presión ${s.presion_sistolica}/${s.presion_diastolica} mmHg`
                : ""}
              {s.glucosa != null ? ` · Glucosa ${s.glucosa} mg/dL` : ""}
              {s.temperatura != null ? ` · Temp. ${s.temperatura} °C` : ""}
              {s.pulso != null ? ` · Pulso ${s.pulso} lpm` : ""}
            </Text>
            {s.notas ? (
              <Text className="mt-2 text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                Nota: {s.notas}
              </Text>
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
