import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, Pressable, Text, View, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarAlertas, marcarAlertaLeida } from "@/services/alertas";
import type { Alerta } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function PacienteAlertasScreen() {
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await listarAlertas(uid);
    setItems((data as Alerta[]) ?? []);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const marcar = async (a: Alerta) => {
    const { error } = await marcarAlertaLeida(a.id);
    if (error) Alert.alert("Error", error.message);
    else cargar();
  };

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
      <View className="pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Alertas inteligentes
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Generadas en el teléfono con reglas simples. Si algo te preocupa, no esperes: busca ayuda médica.
        </Text>
      </View>

      {items.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Por ahora no hay alertas. Sigue registrando medicamentos y signos para que podamos avisarte a tiempo.
          </Text>
        </Card>
      ) : (
        items.map((a) => (
          <Card
            key={a.id}
            className={`mb-3 ${a.severidad === "urgente" ? "border-l-4 border-l-error" : "border-l-4 border-l-primary"}`}
          >
            <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
              {a.severidad === "urgente"
                ? "URGENTE"
                : a.severidad === "advertencia"
                  ? "PRECAUCIÓN"
                  : "INFORMACIÓN"}
            </Text>
            <Text className="mt-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
              {a.titulo}
            </Text>
            <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              {a.mensaje}
            </Text>
            {!a.leida && (
              <Pressable onPress={() => marcar(a)} className="mt-3 self-start rounded-xl bg-surface-high px-3 py-2">
                <Text style={{ fontFamily: "Inter_600SemiBold" }}>Marcar como leída</Text>
              </Pressable>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}
