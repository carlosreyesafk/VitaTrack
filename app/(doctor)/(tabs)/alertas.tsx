import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, Text, View, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { alertasParaDoctor } from "@/services/alertas";
import type { Alerta } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, FadeInRight, Layout } from "react-native-reanimated";

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
      <Screen withMesh>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" size="large" />
        </View>
      </Screen>
    );
  }

  const urgentes = items.filter((a) => a.severidad === "urgente");
  const recientes = items.filter((a) => a.severidad !== "urgente");

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Seguridad Clínica
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            Centro de Alertas
          </Text>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Seguimiento prioritario de incidencias en la adherencia y estado del paciente.
          </Text>
        </View>

        {/* Urgent Alerts Section */}
        {urgentes.length > 0 && (
          <View className="mb-10">
            <View className="flex-row items-center gap-2 mb-6 px-1">
              <MaterialCommunityIcons name="alert-decagram" size={24} color="#ba1a1a" />
              <Text className="font-headline text-2xl text-error font-bold italic">Intervención Urgente</Text>
            </View>
            
            <View className="gap-4">
              {urgentes.map((a, idx) => (
                <Animated.View 
                  key={a.id} 
                  entering={FadeInDown.delay(idx * 100).duration(800)}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() => router.push(`/(doctor)/paciente/${a.paciente_id}` as any)}
                    className="bg-error/5 rounded-[32px] p-6 border border-error/20 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-4">
                        <Text className="text-error font-headline text-lg font-bold leading-tight mb-1">
                          {a.titulo}
                        </Text>
                        <Text className="text-error/80 text-xs font-body leading-relaxed">
                          {a.mensaje}
                        </Text>
                      </View>
                      <View className="w-10 h-10 rounded-full bg-error items-center justify-center">
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="white" />
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-2">
                      <MaterialCommunityIcons name="account-alert-outline" size={14} color="#ba1a1a" />
                      <Text className="text-error text-[10px] font-bold uppercase tracking-widest">Revisar Paciente Ahora</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Alerts Section */}
        <View>
          <Text className="font-headline text-2xl text-on-surface font-bold mb-6 px-2">Recientes</Text>
          
          {items.length === 0 ? (
            <Animated.View entering={FadeInDown} className="bg-surface-container-lowest p-12 rounded-[32px] border border-dashed border-outline-variant items-center justify-center">
              <MaterialCommunityIcons name="bell-outline" size={48} color="#94a3b8" />
              <Text className="text-on-surface-variant text-sm font-body text-center mt-4">
                No hay alertas activas en su red clínica.
              </Text>
            </Animated.View>
          ) : (
            <View className="gap-4">
              {recientes.map((a, idx) => (
                <Animated.View 
                  key={a.id} 
                  entering={FadeInDown.delay(idx * 50).duration(600)}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() => router.push(`/(doctor)/paciente/${a.paciente_id}` as any)}
                    className="bg-surface-container-lowest rounded-[28px] p-5 shadow-sm border border-outline-variant/10"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-4">
                        <Text className="text-on-surface font-headline text-base font-bold leading-tight">
                          {a.titulo}
                        </Text>
                        <Text className="text-on-surface-variant text-xs font-body opacity-60 mt-1">
                          {a.mensaje}
                        </Text>
                      </View>
                      <Text className="text-[10px] text-on-surface-variant opacity-40 font-body">
                        {new Date(a.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
