import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, Pressable, Text, View, ActivityIndicator } from "react-native";
import { Plus } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { eliminarMedicamento, listarMedicamentos, registrarToma } from "@/services/medicamentos";
import type { Medicamento } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

export default function MedicamentosListScreen() {
  const router = useRouter();
  const uid = useAuthStore((s) => s.session?.user?.id);
  const [items, setItems] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!uid || !supabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await listarMedicamentos(uid);
    setItems(data ?? []);
    setLoading(false);
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
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
    Alert.alert("Listo", "Toma registrada. Sigue tu horario lo mejor que puedas.");
    cargar();
  };

  const borrar = (m: Medicamento) => {
    Alert.alert("¿Quitar medicamento?", `Se archivará «${m.nombre}» de tu lista.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
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
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0058bc" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pb-4 pt-2">
        <Text className="text-2xl text-on-surface" style={{ fontFamily: "Manrope_800ExtraBold" }}>
          Tus medicamentos
        </Text>
        <Pressable
          onPress={() => router.push("/(patient)/(tabs)/medicamentos/nuevo")}
          className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed"
        >
          <Plus color="#0058bc" size={26} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Card>
          <Text className="text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
            Aún no tienes medicamentos. Agrega el primero con el botón + y pon los horarios que te indicó tu médico o
            médica.
          </Text>
          <View className="mt-4">
            <GradientButton title="Agregar medicamento" onPress={() => router.push("/(patient)/(tabs)/medicamentos/nuevo")} />
          </View>
        </Card>
      ) : (
        items.map((m) => (
          <Card key={m.id} className="mb-4">
            <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
              {m.nombre}
            </Text>
            <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              {m.dosis} · {m.frecuencia}
            </Text>
            <Text className="mt-2 text-xs text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Horarios: {(m.horarios ?? []).join(", ") || "Sin horario"}
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <View className="min-w-[48%] flex-1">
                <GradientButton title="Lo tomé" onPress={() => marcarTomado(m)} />
              </View>
              <Pressable
                onPress={() => router.push(`/(patient)/(tabs)/medicamentos/${m.id}`)}
                className="rounded-2xl bg-surface-high px-4 py-3"
              >
                <Text style={{ fontFamily: "Inter_600SemiBold" }}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => borrar(m)} className="rounded-2xl bg-error-container px-4 py-3">
                <Text className="text-error" style={{ fontFamily: "Inter_600SemiBold" }}>
                  Quitar
                </Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
