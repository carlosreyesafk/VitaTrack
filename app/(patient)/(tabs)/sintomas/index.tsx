import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { listarSintomas } from "@/services/sintomas";
import type { Sintoma } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

export default function SintomasListScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<Sintoma[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const cargar = useCallback(async (isInitial = false) => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    if (isInitial) setLoading(true);
    const { data } = await listarSintomas(uid, 40);
    setItems((data as Sintoma[]) ?? []);
    setLoading(false);
    setHasLoaded(true);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar(!hasLoaded);
    }, [cargar, hasLoaded])
  );

  if (loading) {
    return (
      <Screen withMesh>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" size="large" />
        </View>
      </Screen>
    );
  }

  const getIntensityColor = (level: number) => {
    if (level <= 3) return "#006b27";
    if (level <= 6) return "#a44605";
    return "#ba1a1a";
  };

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Evolución
          </Text>
          <View className="flex-row justify-between items-end">
            <View className="flex-1 mr-4">
              <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
                Mis Síntomas
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(patient)/(tabs)/sintomas/nuevo" as any)}
              className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
            >
              <MaterialCommunityIcons name="plus" size={32} color="white" />
            </Pressable>
          </View>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Registra cómo te sientes para que tu médico pueda realizar un seguimiento preciso de tu recuperación.
          </Text>
        </View>

        {/* Symptoms List */}
        {items.length === 0 ? (
          <Animated.View entering={FadeInDown} className="bg-surface-container-lowest p-8 rounded-[32px] border border-dashed border-outline-variant items-center">
            <View className="w-16 h-16 rounded-full bg-surface-container items-center justify-center mb-4">
              <MaterialCommunityIcons name="clipboard-pulse-outline" size={32} color="#717786" />
            </View>
            <Text className="text-on-surface font-headline font-bold text-lg mb-2 text-center">Todo parece estar en calma</Text>
            <Text className="text-on-surface-variant text-center font-body mb-6">
              Aún no tienes síntomas registrados. Cuéntanos cuando sientas algo fuera de lo común.
            </Text>
            <Pressable 
              onPress={() => router.push("/(patient)/(tabs)/sintomas/nuevo" as any)}
              className="bg-primary/10 px-6 py-3 rounded-2xl"
            >
              <Text className="text-primary font-bold">Registrar ahora</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View className="gap-4">
            {items.map((s, idx) => (
              <Animated.View 
                key={s.id} 
                entering={FadeInDown.delay(idx * 80).duration(600)}
                layout={Layout.springify()}
                className="bg-surface-container-lowest rounded-[28px] p-5 shadow-cloud border border-outline-variant/10"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-4">
                    <Text className="text-on-surface font-headline text-lg font-bold leading-tight">
                      {s.descripcion}
                    </Text>
                  </View>
                  <View 
                    className="px-3 py-1 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${getIntensityColor(s.intensidad)}15` }}
                  >
                    <Text 
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: getIntensityColor(s.intensidad) }}
                    >
                      Nivel {s.intensidad}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 mt-2">
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="#717786" />
                  <Text className="text-on-surface-variant text-[11px] font-body opacity-60">
                    {new Date(s.registrado_en).toLocaleString("es-DO", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
