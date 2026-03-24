import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Alert, Pressable, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { listarPacientesVinculados, prioridadPaciente, vincularPaciente } from "@/services/doctor";
import type { Perfil } from "@/types";
import { supabaseConfigured } from "@/lib/supabase";

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
      Alert.alert("No se pudo vincular", error.message);
      return;
    }
    setEmail("");
    Alert.alert("Listo", "El paciente aparecerá en tu lista.");
    cargar();
  };

  const colorPrioridad = (p: "baja" | "media" | "alta") =>
    p === "alta" ? "#ba1a1a" : p === "media" ? "#b45309" : "#006b27";

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
      <Card className="mb-6">
        <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
          Vincular paciente
        </Text>
        <Text className="mt-1 text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
          Pide el correo con el que se registró en VitaTrack. Respetamos su privacidad: solo ves lo que la política
          permite.
        </Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="paciente@correo.com"
          placeholderTextColor="#717786"
          className="mt-3 rounded-2xl bg-surface-low px-4 py-4 text-on-surface"
          style={{ fontFamily: "Inter_400Regular" }}
        />
        <View className="mt-3">
          <GradientButton title={busy ? "Vinculando…" : "Vincular"} disabled={busy} onPress={vincular} />
        </View>
      </Card>

      {items.map((p) => {
        const pr = prioridades[p.id] ?? "baja";
        return (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/(doctor)/paciente/${p.id}`)}
            className="mb-3 rounded-2xl bg-white p-4"
            style={{ borderLeftWidth: 6, borderLeftColor: colorPrioridad(pr) }}
          >
            <Text className="text-lg text-on-surface" style={{ fontFamily: "Inter_600SemiBold" }}>
              {p.nombre_completo || "Paciente"}
            </Text>
            <Text className="text-sm text-on-surface-variant" style={{ fontFamily: "Inter_400Regular" }}>
              Prioridad visual: {pr === "alta" ? "alta" : pr === "media" ? "media" : "baja"}
            </Text>
          </Pressable>
        );
      })}
    </Screen>
  );
}
