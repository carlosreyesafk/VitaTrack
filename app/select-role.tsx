import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, Text, View, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientButton } from "@/components/ui/GradientButton";
import { Screen } from "@/components/ui/Screen";
import { actualizarRol } from "@/services/perfil";
import { useAuthStore } from "@/store/authStore";
import type { RolUsuario } from "@/types";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SelectRoleScreen() {
  const [rol, setRol] = useState<RolUsuario | null>(null);
  const [busy, setBusy] = useState(false);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  const continuar = async () => {
    if (!rol) {
      Alert.alert("Selección de perfil", "Por favor selecciona tu rol para continuar.");
      return;
    }
    setBusy(true);
    const { error } = await actualizarRol(rol);
    setBusy(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    await refreshPerfil();
    router.replace("/");
  };

  return (
    <Screen withMesh className="px-0">
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(800)} className="px-8">
          <View className="text-center items-center mb-12">
            <Text className="font-headline text-4xl text-on-surface font-extrabold tracking-tight text-center leading-tight">
              Selecciona tu perfil
            </Text>
            <Text className="font-body text-on-surface-variant text-lg text-center mt-4 leading-relaxed opacity-80">
              Personalizaremos tu experiencia en VitaTrack según el rol que desempeñes en el cuidado de la salud.
            </Text>
          </View>

          <View className="gap-8 mb-12">
            {/* Patient Role Card */}
            <RoleCard
              icon="account"
              title="Soy Paciente"
              desc="Gestiona tu salud personal, realiza seguimiento de tus signos vitales y conecta con tus doctores."
              selected={rol === "paciente"}
              onPress={() => setRol("paciente")}
              color="#0058bc"
              bg="#d8e2ff"
            />

            {/* Doctor Role Card */}
            <RoleCard
              icon="medical-bag"
              title="Soy Doctor"
              desc="Accede al historial de tus pacientes, monitorea alertas en tiempo real y optimiza tus consultas."
              selected={rol === "doctor"}
              onPress={() => setRol("doctor")}
              color="#006b27"
              bg="#ccf0d6"
            />
          </View>

          <GradientButton title={busy ? "Guardando…" : "Comenzar ahora"} disabled={!rol || busy} onPress={continuar} />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function RoleCard({ icon, title, desc, selected, onPress, color, bg }: any) {
  return (
    <Pressable
      onPress={onPress}
      className={`relative p-8 rounded-3xl border ${
        selected ? "border-primary border-2" : "border-outline-variant/10 shadow-cloud"
      } bg-surface-container-lowest overflow-hidden`}
    >
      {selected && (
        <View className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8" />
      )}
      
      <View 
        style={{ backgroundColor: bg }} 
        className="w-20 h-20 mb-6 rounded-2xl items-center justify-center"
      >
        <MaterialCommunityIcons name={icon} size={40} color={color} />
      </View>
      
      <Text className="font-headline font-bold text-2xl mb-2 text-on-surface">{title}</Text>
      <Text className="font-body text-on-surface-variant leading-relaxed mb-6">
        {desc}
      </Text>
      
      <View className="flex-row items-center gap-2">
        <Text style={{ color }} className="font-headline font-bold">
          {selected ? "Seleccionado" : "Elegir este perfil"}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={color} />
      </View>
    </Pressable>
  );
}
