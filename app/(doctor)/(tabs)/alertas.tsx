import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { alertasParaDoctor } from "@/services/alertas";
import type { Alerta } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function DoctorAlertasScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await alertasParaDoctor();
    setItems((data as Alerta[]) ?? []);
    setLoading(false);
  }, []);

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

  const urgentes = items.filter((a) => a.severidad === "urgente");

  return (
    <Screen scroll>
      <View className="pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Centro de alertas
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Pacientes urgentes arriba; después, alertas recientes de toda tu lista.
        </Text>
      </View>

      {urgentes.length > 0 && (
        <View className="mb-4">
          <Text className="mb-2 text-lg text-error" style={{ fontFamily: "Inter_600SemiBold" }}>
            Urgentes
          </Text>
          {urgentes.map((a) => (
            <Pressable key={a.id} onPress={() => router.push(`/(doctor)/paciente/${a.paciente_id}`)}>
              <Card className="mb-3 border-l-4 border-l-error">
                <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                  {a.titulo}
                </Text>
                <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                  {a.mensaje}
                </Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
        Recientes
      </Text>
      {items.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Cuando tus pacientes generen alertas, las verás aquí ordenadas por fecha.
          </Text>
        </Card>
      ) : (
        items.map((a) => (
          <Pressable key={a.id} onPress={() => router.push(`/(doctor)/paciente/${a.paciente_id}`)}>
            <Card className="mb-3">
              <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                {new Date(a.created_at).toLocaleString("es-DO")}
              </Text>
              <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                {a.titulo}
              </Text>
              <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                {a.mensaje}
              </Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
