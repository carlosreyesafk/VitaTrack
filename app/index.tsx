import React from "react";
import { View, Text, ActivityIndicator, Pressable, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { supabaseConfigured } from "@/lib/supabase";
import { Screen } from "@/components/ui/Screen";
import { GradientButton } from "@/components/ui/GradientButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function Index() {
  const { session, perfil, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0058bc" />
      </View>
    );
  }

  // If supabase is not configured, we can't do much, just go to login which shows error
  if (!supabaseConfigured) {
    router.replace("/(auth)/login");
    return null;
  }

  // If user is already logged in, redirect them
  if (session) {
    if (!perfil?.rol) {
      router.replace("/select-role");
    } else if (perfil.rol === "paciente") {
      router.replace("/(patient)/(tabs)");
    } else {
      router.replace("/(doctor)/(tabs)");
    }
    return null;
  }

  // Welcome Screen UI
  return (
    <Screen withMesh={true} className="px-0">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)}
          className="items-center px-8"
        >
          {/* Logo Section */}
          <View className="mb-12 items-center">
            <LinearGradient
              colors={["#0058bc", "#0070eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 rounded-2xl items-center justify-center shadow-lg"
            >
              <MaterialCommunityIcons name="heart-pulse" size={40} color="white" />
            </LinearGradient>
            <Text className="text-primary font-headline text-2xl mt-4 font-extrabold tracking-tighter">
              VitaTrack
            </Text>
          </View>

          {/* Hero Section */}
          <Text className="font-headline text-5xl text-on-surface leading-[1.1] tracking-tight text-center mb-6">
            Tu salud, siempre {"\n"}
            <Text className="text-primary italic">bajo control</Text>
          </Text>
          
          <Text className="font-body text-lg text-on-surface-variant text-center leading-relaxed mb-12 px-4">
            Monitorea tus medicamentos, síntomas y seguimiento médico en un solo lugar. Una experiencia clínica diseñada para tu bienestar.
          </Text>

          {/* Action Buttons */}
          <View className="w-full gap-4 mb-16">
            <GradientButton 
              title="Iniciar sesión" 
              onPress={() => router.push("/(auth)/login")}
            />
            <GradientButton 
              title="Crear cuenta" 
              variant="secondary"
              onPress={() => router.push("/(auth)/register")}
            />
          </View>

          {/* Features Grid */}
          <View className="w-full gap-6">
            <FeatureCard 
              icon="pill" 
              title="Medicamentos" 
              desc="Recordatorios inteligentes y gestión de inventario diario."
              color="#0058bc"
              rotate="-1deg"
            />
            <FeatureCard 
              icon="clipboard-pulse" 
              title="Síntomas" 
              desc="Registro detallado de tu evolución para compartir con médicos."
              color="#006b27"
              rotate="0deg"
              scale={1.05}
              zIndex={10}
            />
            <FeatureCard 
              icon="calendar-month" 
              title="Seguimiento" 
              desc="Calendario centralizado de citas y reportes automáticos."
              color="#0058bc"
              rotate="1deg"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function FeatureCard({ icon, title, desc, color, rotate = "0deg", scale = 1, zIndex = 1 }: any) {
  return (
    <View 
      style={{ 
        transform: [{ rotate }, { scale }],
        zIndex,
        shadowColor: "#1a1c1f",
        shadowOpacity: 0.02,
        shadowRadius: 20,
        elevation: 2
      }}
      className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10"
    >
      <View className="mb-4">
        <MaterialCommunityIcons name={icon as any} size={32} color={color} />
      </View>
      <Text className="font-headline font-bold text-lg mb-1 text-on-surface">{title}</Text>
      <Text className="text-on-surface-variant text-sm leading-relaxed">{desc}</Text>
    </View>
  );
}
