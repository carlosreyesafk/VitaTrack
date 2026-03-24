import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { AlertTriangle, HeartPulse, MessageCircle, Pill } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarMedicamentos, adherenciaUltimosDias } from "@/services/medicamentos";
import { listarSintomas } from "@/services/sintomas";
import { listarSignos } from "@/services/signos";
import { listarAlertas, generarYGuardarAlertasLocales } from "@/services/alertas";
import { horaProximaDesdeHorarios } from "@/lib/format";
import type { Alerta, Medicamento, SignoVital, Sintoma } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function PatientHomeScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);

  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [adherencia, setAdherencia] = useState(0);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const cargar = useCallback(async () => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await generarYGuardarAlertasLocales(uid);
    const [medRes, adh, sintRes, signosRes, alertRes] = await Promise.all([
      listarMedicamentos(uid),
      adherenciaUltimosDias(uid, 14),
      listarSintomas(uid, 5),
      listarSignos(uid, 3),
      listarAlertas(uid),
    ]);
    setMeds(medRes.data ?? []);
    setAdherencia(adh.pct);
    setSintomas((sintRes.data as Sintoma[]) ?? []);
    setSignos((signosRes.data as SignoVital[]) ?? []);
    setAlertas(((alertRes.data as Alerta[]) ?? []).filter((a) => !a.leida).slice(0, 5));
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const hoy = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
  const proximaHora = (() => {
    const horas = meds.flatMap((med) => med.horarios ?? []);
    return horaProximaDesdeHorarios(horas);
  })();

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
          {hoy}
        </Text>
        <Text className="mt-1 text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Tu panel de salud
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Resumen pensado para el día a día, sin complicaciones.
        </Text>
      </View>

      <View className="mb-4 flex-row gap-3">
        <Pressable
          onPress={() => router.push("/(patient)/vitales")}
          className="flex-1 rounded-2xl bg-surface-low p-4 active:opacity-90"
        >
          <HeartPulse color="#0058bc" size={22} />
          <Text className="mt-2 text-sm text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
            Signos vitales
          </Text>
          <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Presión, glucosa, pulso…
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(patient)/consulta")}
          className="flex-1 rounded-2xl bg-surface-low p-4 active:opacity-90"
        >
          <MessageCircle color="#0058bc" size={22} />
          <Text className="mt-2 text-sm text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
            Consulta rápida
          </Text>
          <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Escribe a tu médico
          </Text>
        </Pressable>
      </View>

      <Card className="mb-4">
        <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
          Medicamentos de hoy
        </Text>
        <Text className="mt-3 text-4xl text-primary" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          {meds.length}
        </Text>
        <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          activos en tu lista
        </Text>
        <View className="mt-4 border-t border-outline-variant/10 pt-4">
          <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Próxima toma sugerida
          </Text>
          <Text className="text-lg text-on-surface" style={{ fontFamily: "Manrope_700Bold" }}>
            {proximaHora ?? "Configura horarios en Medicamentos"}
          </Text>
        </View>
      </Card>

      <Card className="mb-4 border-l-4 border-l-tertiary">
        <Text className="text-xs uppercase text-on-surface-variant" style={{ fontFamily: "Inter_500Medium" }}>
          Adherencia (14 días)
        </Text>
        <Text className="mt-2 text-4xl text-tertiary" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          {adherencia}%
        </Text>
        <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Entre más registres, más fiel es este número a tu rutina real.
        </Text>
      </Card>

      <View className="mb-4">
        <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Síntomas recientes
        </Text>
        {sintomas.length === 0 ? (
          <Card>
            <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Aún no registras síntomas. Cuéntanos cómo te sientes cuando puedas.
            </Text>
          </Card>
        ) : (
          sintomas.map((si) => (
            <Card key={si.id} className="mb-3">
              <Text className="text-on-surface" style={{ fontFamily: "Inter_500Medium" }}>
                {si.descripcion}
              </Text>
              <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                Intensidad {si.intensidad}/10 · {new Date(si.registrado_en).toLocaleString("es-DO")}
              </Text>
            </Card>
          ))
        )}
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Signos vitales recientes
        </Text>
        {signos.length === 0 ? (
          <Card>
            <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Registra presión, glucosa o pulso para ver tendencias aquí.
            </Text>
          </Card>
        ) : (
          signos.map((sg) => (
            <Card key={sg.id} className="mb-3">
              <Text className="text-on-surface" style={{ fontFamily: "Inter_500Medium" }}>
                {sg.presion_sistolica && sg.presion_diastolica
                  ? `PA ${sg.presion_sistolica}/${sg.presion_diastolica} mmHg`
                  : "Lectura parcial"}
                {sg.glucosa != null ? ` · Glucosa ${sg.glucosa} mg/dL` : ""}
                {sg.pulso != null ? ` · Pulso ${sg.pulso} lpm` : ""}
              </Text>
              <Text className="text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                {new Date(sg.registrado_en).toLocaleString("es-DO")}
              </Text>
            </Card>
          ))
        )}
      </View>

      <View className="mb-8">
        <Text className="mb-2 text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Alertas activas
        </Text>
        {alertas.length === 0 ? (
          <Card>
            <View className="flex-row items-center gap-2">
              <Pill color="#006b27" size={20} />
              <Text className="flex-1 text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                No tienes alertas pendientes. Sigue así y revisa tu lista de medicamentos.
              </Text>
            </View>
          </Card>
        ) : (
          alertas.map((a) => (
            <Card key={a.id} className="mb-3 border-l-4 border-l-error">
              <View className="flex-row items-start gap-2">
                <AlertTriangle color="#ba1a1a" size={20} />
                <View className="flex-1">
                  <Text className="text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
                    {a.titulo}
                  </Text>
                  <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
                    {a.mensaje}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
