import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { registrarCanalYPermisos } from "@/services/notifications";

// Evitar que el splash screen se oculte automáticamente hasta que estemos listos
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    // Si hay error en las fuentes o ya cargaron, ocultamos el splash
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
    
    // Fallback de seguridad: ocultar splash tras 5 segundos pase lo que pase
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loaded, error]);

  useEffect(() => {
    registrarCanalYPermisos().catch(() => undefined);
  }, []);

  // No bloqueamos el renderizado por las fuentes para evitar el "loading infinito" 
  // si el sistema de archivos de fuentes falla en el dispositivo. 
  // El app simplemente usará fuentes de sistema hasta que carguen las de Google.
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f9f9fe" } }} />
    </GestureHandlerRootView>
  );
}
