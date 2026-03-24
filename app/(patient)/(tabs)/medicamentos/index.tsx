import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, Pressable, Text, View, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { eliminarMedicamento, listarMedicamentos, registrarToma } from "@/services/medicamentos";
import type { Medicamento } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

export default function MedicamentosListScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const cargar = useCallback(async (isInitial = false) => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    if (isInitial) setLoading(true);
    const { data } = await listarMedicamentos(uid);
    setItems(data ?? []);
    setLoading(false);
    setHasLoaded(true);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar(!hasLoaded);
    }, [cargar, hasLoaded])
  );

  const marcarTomado = async (m: Medicamento) => {
    if (!uid) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const hora = new Date().toTimeString().slice(0, 5);
    const { error } = await registrarToma(m.id, hoy, hora);
    if (error) {
      Alert.alert("No se pudo registrar", error.message);
      return;
    }
    Alert.alert("Listo", "Toma registrada exitosamente.");
    cargar();
  };

  const borrar = (m: Medicamento) => {
    Alert.alert("¿Archivar medicamento?", `Se quitará «${m.nombre}» de tu lista activa.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Archivar",
        style: "destructive",
        onPress: async () => {
          const { error } = await eliminarMedicamento(m.id);
          if (error) Alert.alert("Error", error.message);
          else cargar();
        },
      },
    ]);
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

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Tratamientos
          </Text>
          <View className="flex-row justify-between items-end">
            <View className="flex-1 mr-4">
              <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
                Mis Medicinas
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(patient)/(tabs)/medicamentos/nuevo" as any)}
              className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
            >
              <MaterialCommunityIcons name="plus" size={32} color="white" />
            </Pressable>
          </View>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Gestiona tus tratamientos y mantén un control riguroso de tus tomas diarias.
          </Text>
        </View>

        {/* Medications List */}
        {items.length === 0 ? (
          <Animated.View entering={FadeInDown} className="bg-surface-container-lowest p-8 rounded-[32px] border border-dashed border-outline-variant items-center">
            <View className="w-16 h-16 rounded-full bg-surface-container items-center justify-center mb-4">
              <MaterialCommunityIcons name="pill" size={32} color="#717786" />
            </View>
            <Text className="text-on-surface font-headline font-bold text-lg mb-2 text-center">Sin medicamentos activos</Text>
            <Text className="text-on-surface-variant text-center font-body mb-6">
              Agrega tu primer tratamiento para comenzar el seguimiento.
            </Text>
            <GradientButton 
              title="Agregar ahora" 
              onPress={() => router.push("/(patient)/(tabs)/medicamentos/nuevo" as any)} 
            />
          </Animated.View>
        ) : (
          <View className="gap-6">
            {items.map((m, idx) => (
              <Animated.View 
                key={m.id} 
                entering={FadeInDown.delay(idx * 100).duration(600)}
                layout={Layout.springify()}
                className="bg-surface-container-lowest rounded-[32px] p-6 shadow-cloud border border-outline-variant/10"
              >
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-row gap-4 items-center flex-1">
                    <View className="w-14 h-14 rounded-2xl bg-primary/5 items-center justify-center">
                      <MaterialCommunityIcons name="pill" size={28} color="#0058bc" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-on-surface font-headline text-xl font-bold" numberOfLines={1}>
                        {m.nombre}
                      </Text>
                      <Text className="text-on-surface-variant text-sm font-body">
                        {m.dosis} · {m.frecuencia}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => borrar(m)} className="p-2">
                    <MaterialCommunityIcons name="close" size={20} color="#717786" />
                  </Pressable>
                </View>

                {/* Schedule info */}
                <View className="bg-surface-container/50 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#0058bc" />
                  <Text className="flex-1 text-on-surface-variant text-xs font-body">
                    Horarios: {(m.horarios ?? []).join(", ") || "Sin horario definido"}
                  </Text>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <GradientButton 
                      title="Registrar toma" 
                      onPress={() => marcarTomado(m)} 
                    />
                  </View>
                  <Pressable 
                    onPress={() => router.push(`/(patient)/(tabs)/medicamentos/${m.id}` as any)}
                    className="w-14 h-14 bg-surface-container rounded-2xl items-center justify-center border border-outline-variant/10"
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={22} color="#0058bc" />
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
