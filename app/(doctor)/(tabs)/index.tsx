import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { listarPacientesVinculados, prioridadPaciente } from "@/services/doctor";
import type { Perfil } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function DoctorDashboardScreen() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Perfil[]>([]);
  const [prioridades, setPrioridades] = useState<Record<string, "baja" | "media" | "alta">>({});
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await listarPacientesVinculados();
    const lista = data ?? [];
    setPacientes(lista);
    const pri: Record<string, "baja" | "media" | "alta"> = {};
    for (const p of lista) {
      pri[p.id] = await prioridadPaciente(p.id);
    }
    setPrioridades(pri);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const colorPrioridad = (p: "baja" | "media" | "alta") =>
    p === "alta" ? "#ba1a1a" : p === "media" ? "#b45309" : "#006b27";

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
      <View className="pb-4 pt-4">
        <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
          VitaTrack · Médico
        </Text>
        <Text className="mt-1 text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Panel clínico
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Prioridad por colores: verde estable, ámbar para revisar, rojo atención cercana.
        </Text>
      </View>

      <Card className="mb-4">
        <Text className="text-4xl text-primary" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          {pacientes.length}
        </Text>
        <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          pacientes vinculados
        </Text>
      </Card>

      {pacientes.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Aún no tienes pacientes. Ve a la pestaña «Pacientes» y vincula con el correo que usaron al registrarse.
          </Text>
        </Card>
      ) : (
        pacientes.map((p) => {
          const pr = prioridades[p.id] ?? "baja";
          return (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/(doctor)/paciente/${p.id}`)}
              className="mb-3 rounded-2xl bg-white p-4 shadow-cloud"
              style={{
                shadowColor: "#1a1c1f",
                shadowOpacity: 0.04,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 12 },
                borderLeftWidth: 6,
                borderLeftColor: colorPrioridad(pr),
              }}
            >
              <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                {p.nombre_completo || "Paciente sin nombre"}
              </Text>
              <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
                Prioridad {pr === "alta" ? "alta" : pr === "media" ? "media" : "baja"}
              </Text>
              {p.condicion_medica ? (
                <Text className="mt-2 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                  {p.condicion_medica}
                </Text>
              ) : null}
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}
