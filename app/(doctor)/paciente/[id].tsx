import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, ActivityIndicator, Dimensions, Pressable, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Screen } from "@/components/ui/Screen";
import { GradientButton } from "@/components/ui/GradientButton";
import { obtenerPerfilPorId } from "@/services/perfil";
import { adherenciaUltimosDias } from "@/services/medicamentos";
import { listarSintomas } from "@/services/sintomas";
import { listarSignos } from "@/services/signos";
import type { Perfil, SignoVital, Sintoma } from "@/types";
import Animated, { FadeInDown, FadeInRight, Layout } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const chartWidth = width - 64;

export default function DoctorPacienteDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  const ultimaPA = signos.find(s => s.presion_sistolica && s.presion_diastolica);

  if (loading || !perfil) {
    return (
      <Screen withMesh>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Pressable onPress={() => router.back()} className="mb-6">
            <MaterialCommunityIcons name="arrow-left" size={28} color="#0058bc" />
          </Pressable>
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Expediente Clínico
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            {perfil.nombre_completo || "Paciente"}
          </Text>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Resumen detallado de salud, adherencia y signos vitales.
          </Text>
        </View>

        {/* Health Summary Bento Grid */}
        <View className="flex-row gap-4 mb-8">
          {/* Adherence Card */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(800)}
            className="flex-1 bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
          >
            <View className="w-10 h-10 rounded-xl bg-tertiary/5 items-center justify-center mb-4">
              <MaterialCommunityIcons name="calendar-check" size={20} color="#006b27" />
            </View>
            <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-1">Adherencia</Text>
            <View className="flex-row items-baseline">
              <Text className="text-tertiary font-headline text-3xl font-extrabold">{adh}</Text>
              <Text className="text-tertiary font-headline text-lg font-bold">%</Text>
            </View>
            <Text className="text-on-surface-variant text-[10px] opacity-60 mt-1">Últimos 30 días</Text>
          </Animated.View>

          {/* Latest BP Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)}
            className="flex-1 bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
          >
            <View className="w-10 h-10 rounded-xl bg-error/5 items-center justify-center mb-4">
              <MaterialCommunityIcons name="gauge" size={20} color="#ba1a1a" />
            </View>
            <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-1">Presión</Text>
            <Text className="text-on-surface font-headline text-2xl font-extrabold">
              {ultimaPA ? `${ultimaPA.presion_sistolica}/${ultimaPA.presion_diastolica}` : "--/--"}
            </Text>
            <Text className="text-on-surface-variant text-[10px] opacity-60">mmHg</Text>
          </Animated.View>
        </View>

        {/* Glucose chart for doctor */}
        {glucosas.length >= 2 && (
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            className="bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10 mb-10 overflow-hidden"
          >
            <Text className="text-on-surface font-headline text-lg font-bold mb-6 px-1">Control de Glucosa</Text>
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: glucosas }],
              }}
              width={chartWidth}
              height={140}
              withHorizontalLines={false}
              withVerticalLines={false}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 107, 39, ${opacity * 0.8})`,
                labelColor: () => "transparent",
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#006b27"
                }
              }}
              bezier
              style={{ paddingRight: 0, paddingLeft: -20 }}
            />
          </Animated.View>
        )}

        {/* Symptoms Timeline */}
        <View className="mb-10">
          <Text className="font-headline text-2xl text-on-surface font-bold mb-6 px-2">Historial de Síntomas</Text>
          {sintomas.length === 0 ? (
            <View className="bg-surface-container p-8 rounded-[32px] border border-dashed border-outline-variant items-center">
              <Text className="text-on-surface-variant text-sm font-body">Sin reportes recientes.</Text>
            </View>
          ) : (
            <View className="gap-4">
              {sintomas.map((s, idx) => (
                <Animated.View 
                  key={s.id} 
                  entering={FadeInDown.delay(idx * 80).duration(600)}
                  className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/5 shadow-sm"
                >
                  <Text className="text-on-surface font-headline text-base font-bold mb-1">{s.descripcion}</Text>
                  <View className="flex-row justify-between items-center mt-2">
                    <View className="bg-error/5 px-2 py-0.5 rounded-full">
                      <Text className="text-error text-[10px] font-bold uppercase tracking-wider">Intensidad {s.intensidad}</Text>
                    </View>
                    <Text className="text-[10px] text-on-surface-variant opacity-60 font-body">
                      {new Date(s.registrado_en).toLocaleDateString("es-DO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {/* Action Button */}
        <View className="mt-4">
          <GradientButton 
            title="Generar Nueva Consulta" 
            onPress={() => router.push(`/(doctor)/paciente/consulta/${id}` as any)} 
          />
        </View>
      </View>
    </Screen>
  );
}
