import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarSignos } from "@/services/signos";
import type { SignoVital } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, FadeInRight, Layout } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const chartWidth = width - 64;

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

  const ultimaPA = items.find(s => s.presion_sistolica && s.presion_diastolica);
  const ultimoPulso = items.find(s => s.pulso != null);
  const ultimaGlucosa = items.find(s => s.glucosa != null);

  if (loading) {
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
          <View className="flex-row justify-between items-end">
            <View className="flex-1 mr-4">
              <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
                Monitorización
              </Text>
              <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
                Signos Vitales
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(patient)/vitales/nuevo")}
              className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
            >
              <MaterialCommunityIcons name="plus" size={32} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Latest Metrics Bento Grid */}
        <View className="flex-row gap-4 mb-8">
          {/* BP Card */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(800)}
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

          {/* Pulse Card */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)}
            className="flex-1 bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
          >
            <View className="w-10 h-10 rounded-xl bg-primary/5 items-center justify-center mb-4">
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#0058bc" />
            </View>
            <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-1">Pulso</Text>
            <Text className="text-on-surface font-headline text-2xl font-extrabold">
              {ultimoPulso?.pulso ?? "--"}
            </Text>
            <Text className="text-on-surface-variant text-[10px] opacity-60">LPM</Text>
          </Animated.View>
        </View>

        {/* Glucose Chart Section */}
        {glucosas.length >= 2 && (
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            className="bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10 mb-8 overflow-hidden"
          >
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-on-surface font-headline text-lg font-bold">Tendencia Glucosa</Text>
                <Text className="text-on-surface-variant text-xs opacity-60">Últimas 8 lecturas</Text>
              </View>
              <View className="bg-tertiary/10 px-3 py-1.5 rounded-full">
                <Text className="text-tertiary text-[10px] font-bold uppercase tracking-wider">
                  {ultimaGlucosa?.glucosa} mg/dL
                </Text>
              </View>
            </View>
            
            <LineChart
              data={{
                labels: [],
                datasets: [{ data: glucosas }],
              }}
              width={chartWidth}
              height={140}
              withHorizontalLines={false}
              withVerticalLines={false}
              withDots={true}
              withInnerLines={false}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 88, 188, ${opacity * 0.8})`,
                labelColor: () => "transparent",
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#0058bc"
                }
              }}
              bezier
              style={{ paddingRight: 0, paddingLeft: -20 }}
            />
          </Animated.View>
        )}

        {/* History List */}
        <View className="mb-6">
          <Text className="font-headline text-2xl text-on-surface font-bold mb-6 px-2">Historial</Text>
          
          {items.length === 0 ? (
            <View className="bg-surface-container-lowest p-12 rounded-[32px] border border-dashed border-outline-variant items-center justify-center">
              <MaterialCommunityIcons name="chart-line-variant" size={48} color="#94a3b8" />
              <Text className="text-on-surface-variant text-sm font-body text-center mt-4">
                No hay registros disponibles.{"\n"}Inicia tu monitoreo hoy.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {items.map((sg, idx) => (
                <Animated.View 
                  key={sg.id} 
                  entering={FadeInDown.delay(idx * 50).duration(500)}
                  layout={Layout.springify()}
                  className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="bg-surface-container px-3 py-1 rounded-full">
                      <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        {new Date(sg.registrado_en).toLocaleDateString("es-DO", { day: "numeric", month: "long" })}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-on-surface-variant opacity-60 font-body">
                      {new Date(sg.registrado_en).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>

                  <View className="flex-row gap-6">
                    {sg.presion_sistolica && (
                      <View>
                        <Text className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Presión</Text>
                        <Text className="text-base font-bold text-on-surface">{sg.presion_sistolica}/{sg.presion_diastolica}</Text>
                      </View>
                    )}
                    {sg.glucosa && (
                      <View>
                        <Text className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Glucosa</Text>
                        <Text className="text-base font-bold text-on-surface">{sg.glucosa}</Text>
                      </View>
                    )}
                    {sg.pulso && (
                      <View>
                        <Text className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">Pulso</Text>
                        <Text className="text-base font-bold text-on-surface">{sg.pulso}</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
