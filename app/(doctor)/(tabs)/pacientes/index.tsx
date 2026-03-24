import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, Pressable, Text, TextInput, View, ActivityIndicator, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { listarPacientesVinculados, prioridadPaciente, vincularPaciente } from "@/services/doctor";
import type { Perfil } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

export default function DoctorPacientesListScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Perfil[]>([]);
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
    setItems(lista);
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

  const vincular = async () => {
    if (!email.trim()) {
      Alert.alert("Correo", "Escribe el correo del paciente.");
      return;
    }
    setBusy(true);
    const { error } = await vincularPaciente(email.trim());
    setBusy(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setEmail("");
    Alert.alert("Transacción Exitosa", "El paciente ha sido vinculado a su panel clínico.");
    cargar();
  };

  const getPriorityInfo = (p: "baja" | "media" | "alta") => {
    switch (p) {
      case "alta": return { color: "#ba1a1a", bg: "#ba1a1a15", label: "Prioridad Alta" };
      case "media": return { color: "#a44605", bg: "#a4460515", label: "Revisión Requerida" };
      default: return { color: "#006b27", bg: "#006b2715", label: "Paciente Estable" };
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

  return (
    <Screen withMesh scroll className="px-0">
      <View className="px-8 pt-6 pb-20">
        {/* Header Section */}
        <View className="mb-10">
          <Text className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
            Base de Datos
          </Text>
          <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight leading-tight">
            Gestión de Pacientes
          </Text>
          <Text className="mt-4 font-body text-on-surface-variant leading-relaxed opacity-80">
            Respetamos la privacidad clínica. Solo verá la información autorizada por el paciente.
          </Text>
        </View>

        {/* Link Patient Card */}
        <Animated.View 
          entering={FadeInDown.duration(800)}
          className="bg-surface-container-lowest p-8 rounded-[32px] shadow-cloud border border-outline-variant/10 mb-12"
        >
          <Text className="font-headline text-xl text-on-surface font-bold mb-2">Vincular nuevo paciente</Text>
          <Text className="text-on-surface-variant text-xs font-body mb-6 opacity-60">
            Ingrese el correo electrónico registrado del paciente para solicitar acceso.
          </Text>
          
          <View className="relative mb-6">
            <View className="absolute left-4 top-1/2 -translate-y-4 z-10">
              <MaterialCommunityIcons name="email-outline" size={20} color="#717786" />
            </View>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="paciente@correo.com"
              placeholderTextColor="#94a3b8"
              className="w-full h-14 pl-12 pr-4 bg-surface-container rounded-2xl text-on-surface font-body"
              style={{ fontFamily: "Inter_400Regular" }}
            />
          </View>
          
          <GradientButton title={busy ? "Procesando…" : "Vincular Paciente"} disabled={busy} onPress={vincular} />
        </Animated.View>

        {/* Patients Registry */}
        <View>
          <Text className="font-headline text-2xl text-on-surface font-bold mb-6 px-2">Registro Clínico</Text>
          
          {items.length === 0 ? (
            <View className="bg-surface-container-lowest p-12 rounded-[32px] border border-dashed border-outline-variant items-center justify-center">
              <MaterialCommunityIcons name="account-search-outline" size={48} color="#94a3b8" />
              <Text className="text-on-surface-variant text-sm font-body text-center mt-4">
                Aún no hay pacientes en su lista técnica.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {items.map((p, idx) => {
                const pr = prioridades[p.id] ?? "baja";
                const priInfo = getPriorityInfo(pr);
                return (
                  <Animated.View 
                    key={p.id} 
                    entering={FadeInDown.delay(idx * 50).duration(600)}
                    layout={Layout.springify()}
                  >
                    <Pressable
                      onPress={() => router.push(`/(doctor)/paciente/${p.id}` as any)}
                      className="bg-surface-container-lowest rounded-[28px] p-5 shadow-sm border border-outline-variant/5"
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-4">
                          <Text className="text-on-surface font-headline text-lg font-bold leading-tight mb-1">
                            {p.nombre_completo || "Sin nombre"}
                          </Text>
                          <View className="flex-row items-center">
                            <View 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: priInfo.color }}
                            />
                            <Text 
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: priInfo.color }}
                            >
                              {priInfo.label}
                            </Text>
                          </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#0058bc" />
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
