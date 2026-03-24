import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { listarPacientesVinculados, prioridadPaciente } from "@/services/doctor";
import type { Perfil } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

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

  const getPriorityInfo = (p: "baja" | "media" | "alta") => {
    switch (p) {
      case "alta": return { color: "#ba1a1a", bg: "#ba1a1a15", label: "Alta" };
      case "media": return { color: "#a44605", bg: "#a4460515", label: "Media" };
      default: return { color: "#006b27", bg: "#006b2715", label: "Estable" };
    }
  };

  if (loading) {
    return (
      <Screen withMesh>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" size="large" />
        </View>
      </Screen>
    );
  }

  const pacientesAlta = Object.values(prioridades).filter(p => p === "alta").length;

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Gestión Médica
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            Panel Clínico
          </Text>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Supervise la salud y adherencia de sus pacientes en tiempo real.
          </Text>
        </View>

        {/* Bento Stats Grid */}
        <View className="flex-row gap-4 mb-10">
          <Animated.View 
            entering={FadeInDown.delay(100).duration(800)}
            className="flex-1 bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
          >
            <View className="w-10 h-10 rounded-xl bg-primary/5 items-center justify-center mb-4">
              <MaterialCommunityIcons name="account-group" size={20} color="#0058bc" />
            </View>
            <Text className="text-on-surface font-headline text-3xl font-extrabold leading-none mb-1">
              {pacientes.length}
            </Text>
            <Text className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest opacity-60">Pacientes</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)}
            className="flex-1 bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
          >
            <View className="w-10 h-10 rounded-xl bg-error/5 items-center justify-center mb-4">
              <MaterialCommunityIcons name="alert-circle" size={20} color="#ba1a1a" />
            </View>
            <Text className="text-on-surface font-headline text-3xl font-extrabold leading-none mb-1">
              {pacientesAlta}
            </Text>
            <Text className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest opacity-60">Prioridad Alta</Text>
          </Animated.View>
        </View>

        {/* Patients List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-6 px-2">
            <Text className="font-headline text-2xl text-on-surface font-bold">Mis Pacientes</Text>
            <Pressable 
              onPress={() => router.push("/(doctor)/(tabs)/pacientes")}
              className="bg-primary/5 px-4 py-2 rounded-full"
            >
              <Text className="text-primary text-xs font-bold">Ver todos</Text>
            </Pressable>
          </View>
          
          {pacientes.length === 0 ? (
            <Animated.View entering={FadeInDown} className="bg-surface-container-lowest p-12 rounded-[32px] border border-dashed border-outline-variant items-center justify-center">
              <MaterialCommunityIcons name="account-search-outline" size={48} color="#94a3b8" />
              <Text className="text-on-surface-variant text-sm font-body text-center mt-4">
                No tiene pacientes vinculados.{"\n"}Agregue uno para comenzar el seguimiento.
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-4">
              {pacientes.map((p, idx) => {
                const pr = prioridades[p.id] ?? "baja";
                const priInfo = getPriorityInfo(pr);
                return (
                  <Animated.View 
                    key={p.id} 
                    entering={FadeInDown.delay(idx * 80).duration(600)}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      onPress={() => router.push(`/(doctor)/paciente/${p.id}` as any)}
                      className="bg-surface-container-lowest rounded-[28px] p-5 shadow-cloud border border-outline-variant/10"
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-4">
                          <Text className="text-on-surface font-headline text-lg font-bold leading-tight">
                            {p.nombre_completo || "Sin nombre"}
                          </Text>
                          <Text className="text-on-surface-variant text-xs font-body opacity-60 mt-1">
                            {p.condicion_medica || "Sin condición especificada"}
                          </Text>
                        </View>
                        <View 
                          className="px-3 py-1 rounded-full items-center justify-center"
                          style={{ backgroundColor: priInfo.bg }}
                        >
                          <Text 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: priInfo.color }}
                          >
                            {priInfo.label}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2 mt-2">
                        <MaterialCommunityIcons name="chevron-right" size={16} color="#0058bc" />
                        <Text className="text-primary text-[11px] font-bold">Ver expediente clínico</Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
