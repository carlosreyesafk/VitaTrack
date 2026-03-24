import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarMedicamentos, adherenciaUltimosDias } from "@/services/medicamentos";
import { listarSintomas } from "@/services/sintomas";
import { listarSignos } from "@/services/signos";
import { listarAlertas, generarYGuardarAlertasLocales } from "@/services/alertas";
import { horaProximaDesdeHorarios } from "@/lib/format";
import type { Alerta, Medicamento, SignoVital, Sintoma } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function PatientHomeScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);

  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [adherencia, setAdherencia] = useState(0);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [signos, setSignos] = useState<SignoVital[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const cargar = useCallback(async (isInitial = false) => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    if (isInitial) setLoading(true);
    generarYGuardarAlertasLocales(uid).catch(console.error);

    try {
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
    } catch (error) {
      console.error("Error al cargar datos del Home:", error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar(!hasLoaded);
    }, [cargar, hasLoaded])
  );

  const hoy = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
  const proximaHora = (() => {
    const horas = meds.flatMap((med) => med.horarios ?? []);
    return horaProximaDesdeHorarios(horas);
  })();

  if (loading) {
    return (
      <Screen withMesh>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" size="large" />
        </View>
      </Screen>
    );
  }

  const ultimaPA = signos.find(s => s.presion_sistolica && s.presion_diastolica);
  const ultimoPulso = signos.find(s => s.pulso != null);

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(800)} className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Hoy es {hoy}
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            Hola de nuevo
          </Text>
        </Animated.View>

        {/* Bento Grid: Core Metrics */}
        <View className="flex-row gap-4 mb-6">
          {/* Adherence Card (Large) */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(800)}
            className="flex-1 bg-primary rounded-[32px] p-6 shadow-lg shadow-primary/20 overflow-hidden"
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "transparent"]}
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16"
            />
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white/80 font-label text-[10px] uppercase tracking-widest">Adherencia</Text>
              <MaterialCommunityIcons name="trending-up" size={16} color="white" />
            </View>
            <Text className="text-white font-headline text-5xl font-extrabold mb-2">{adherencia}%</Text>
            <Text className="text-white/70 text-xs font-body leading-relaxed">
              {adherencia > 80 ? "¡Vas excelente! Sigue así." : "A seguir mejorando hoy."}
            </Text>
          </Animated.View>

          {/* Quick Stats Column */}
          <View className="flex-1 gap-4">
            {/* Heart Rate Card */}
            <Animated.View 
              entering={FadeInRight.delay(200).duration(800)}
              className="bg-surface-container-lowest rounded-3xl p-5 shadow-cloud border border-outline-variant/10"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Pulso</Text>
                <MaterialCommunityIcons name="heart-pulse" size={18} color="#0058bc" />
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-on-surface font-headline text-2xl font-bold">{ultimoPulso?.pulso ?? "--"}</Text>
                <Text className="text-on-surface-variant text-[10px]">LPM</Text>
              </View>
            </Animated.View>

            {/* Blood Pressure Card */}
            <Animated.View 
              entering={FadeInRight.delay(300).duration(800)}
              className="bg-surface-container-lowest rounded-3xl p-5 shadow-cloud border border-outline-variant/10"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Presión</Text>
                <MaterialCommunityIcons name="gauge" size={18} color="#006b27" />
              </View>
              <Text className="text-on-surface font-headline text-lg font-bold">
                {ultimaPA ? `${ultimaPA.presion_sistolica}/${ultimaPA.presion_diastolica}` : "--/--"}
              </Text>
              <Text className="text-on-surface-variant text-[10px] mt-0.5">mmHg</Text>
            </Animated.View>
          </View>
        </View>

        {/* Medications Bento Item */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(800)}
          className="bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10 mb-8"
        >
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-row gap-4 items-center">
              <View className="w-12 h-12 rounded-2xl bg-primary/5 items-center justify-center">
                <MaterialCommunityIcons name="pill" size={24} color="#0058bc" />
              </View>
              <View>
                <Text className="text-on-surface font-headline text-xl font-bold">Medicamentos</Text>
                <Text className="text-on-surface-variant text-sm font-body">{meds.length} activos hoy</Text>
              </View>
            </View>
            <View className="bg-primary/10 px-3 py-1.5 rounded-full">
              <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">Hoy</Text>
            </View>
          </View>

          <View className="bg-surface-container rounded-2xl p-5 flex-row justify-between items-center">
            <View>
              <Text className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                Próxima toma sugerida
              </Text>
              <Text className="text-on-surface font-headline text-2xl font-extrabold">
                {proximaHora ?? "--:--"}
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push("/(patient)/(tabs)/medicamentos" as any)}
              className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-primary/20"
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Recent Activity Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-6 px-2">
            <Text className="font-headline text-2xl text-on-surface font-bold">Actividad reciente</Text>
            <Pressable>
              <Text className="text-primary font-body text-sm font-bold">Ver todo</Text>
            </Pressable>
          </View>

          {/* Activity Cards (Symptoms/Alerts) */}
          <View className="gap-4">
            {alertas.length > 0 && (
              <Animated.View 
                entering={FadeInDown.delay(500).duration(800)}
                className="bg-error/5 border border-error/10 p-5 rounded-3xl flex-row gap-4 items-start"
              >
                <View className="w-10 h-10 rounded-xl bg-error/10 items-center justify-center">
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#ba1a1a" />
                </View>
                <View className="flex-1">
                  <Text className="text-on-surface font-headline font-bold mb-1">Alerta activa</Text>
                  <Text className="text-on-surface-variant text-sm leading-relaxed">
                    {alertas[0].titulo}: {alertas[0].mensaje}
                  </Text>
                </View>
              </Animated.View>
            )}

            {sintomas.length > 0 ? (
              <Animated.View 
                entering={FadeInDown.delay(600).duration(800)}
                className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/10 flex-row gap-4 items-center"
              >
                <View className="w-10 h-10 rounded-xl bg-tertiary/10 items-center justify-center">
                  <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#006b27" />
                </View>
                <View className="flex-1">
                  <Text className="text-on-surface font-headline font-bold mb-0.5">{sintomas[0].descripcion}</Text>
                  <Text className="text-on-surface-variant text-xs opacity-60">
                    Intensidad {sintomas[0].intensidad}/10 · {new Date(sintomas[0].registrado_en).toLocaleDateString()}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#717786" />
              </Animated.View>
            ) : (
              <View className="bg-surface-container-lowest p-8 rounded-3xl border border-dashed border-outline-variant items-center justify-center">
                <Text className="text-on-surface-variant text-sm font-body text-center">
                  No hay síntomas registrados hoy.{"\n"}Cuéntanos cómo te sientes.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Access Section */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(800)}
          className="mt-4 flex-row gap-4"
        >
          <Pressable 
            onPress={() => router.push("/(patient)/log-sintomas" as any)}
            className="flex-1 bg-surface-container-high h-16 rounded-3xl items-center justify-center flex-row gap-2 border border-outline-variant/10 shadow-sm"
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#0058bc" />
            <Text className="text-on-surface font-headline font-bold">Registrar</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.push("/(patient)/consulta")}
            className="flex-1 bg-surface-container-high h-16 rounded-3xl items-center justify-center flex-row gap-2 border border-outline-variant/10 shadow-sm"
          >
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#0058bc" />
            <Text className="text-on-surface font-headline font-bold">Consulta</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Screen>
  );
}
