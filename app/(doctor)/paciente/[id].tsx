import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Text, View, ActivityIndicator, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { obtenerPerfilPorId } from "@/services/perfil";
import { adherenciaUltimosDias } from "@/services/medicamentos";
import { listarSintomas } from "@/services/sintomas";
import { listarSignos } from "@/services/signos";
import type { Perfil, SignoVital, Sintoma } from "@/types";

const w = Dimensions.get("window").width - 40;

export default function DoctorPacienteDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [adh, setAdh] = useState(0);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const { data: p } = await obtenerPerfilPorId(id);
    setPerfil((p as Perfil) ?? null);
    const a = await adherenciaUltimosDias(id, 30);
    setAdh(a.pct);
    const { data: s } = await listarSintomas(id, 15);
    const { data: sv } = await listarSignos(id, 20);
    setSintomas((s as Sintoma[]) ?? []);
    setSignos((sv as SignoVital[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const glucosas = signos
    .filter((s) => s.glucosa != null)
    .slice(0, 10)
    .reverse()
    .map((s) => Number(s.glucosa));

  if (loading || !perfil) {
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
          {perfil.nombre_completo}
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Seguimiento · adherencia, síntomas y signos vitales
        </Text>
      </View>

      <Card className="mb-4">
        <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
          Adherencia estimada (30 días)
        </Text>
        <Text className="mt-2 text-4xl text-tertiary" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          {adh}%
        </Text>
        <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Basada en registros de tomas frente a horarios configurados.
        </Text>
      </Card>

      {glucosas.length >= 2 && (
        <Card className="mb-4">
          <Text className="mb-2 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
            Evolución de glucosa
          </Text>
          <LineChart
            data={{
              labels: glucosas.map((_, i) => `${i + 1}`),
              datasets: [{ data: glucosas }],
            }}
            width={w}
            height={200}
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 107, 39, ${opacity})`,
              labelColor: () => "#414755",
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </Card>
      )}

      <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
        Historial de síntomas
      </Text>
      {sintomas.length === 0 ? (
        <Card className="mb-4">
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Sin síntomas registrados recientemente.
          </Text>
        </Card>
      ) : (
        sintomas.map((s) => (
          <Card key={s.id} className="mb-3">
            <Text className="text-on-surface" style={{ fontFamily: "Inter_500Medium" }}>
              {s.descripcion}
            </Text>
            <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Intensidad {s.intensidad}/10 · {new Date(s.registrado_en).toLocaleString("es-DO")}
            </Text>
          </Card>
        ))
      )}

      <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
        Signos vitales recientes
      </Text>
      {signos.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Sin lecturas recientes.
          </Text>
        </Card>
      ) : (
        signos.slice(0, 8).map((sg) => (
          <Card key={sg.id} className="mb-3">
            <Text className="text-sm text-on-surface" style={{ fontFamily: "Inter_400Regular" }}>
              {new Date(sg.registrado_en).toLocaleString("es-DO")} · PA {sg.presion_sistolica ?? "—"}/
              {sg.presion_diastolica ?? "—"} · Glu {sg.glucosa ?? "—"} · Temp {sg.temperatura ?? "—"} · Pulso{" "}
              {sg.pulso ?? "—"}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
