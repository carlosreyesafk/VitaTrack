import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants, { AppOwnership } from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarCanalYPermisos() {
  // Evitar errores y warnings en Expo Go (SDK 53+ no soporta remote notifications en Go)
  if (Constants.appOwnership === AppOwnership.Expo || __DEV__) {
    console.info("Info: Notificaciones remotas deshabilitadas en Expo Go/Dev para evitar warnings de SDK 53+.");
    // Aún así podemos intentar registrar el canal local si no causa crash, 
    // pero para ir a lo seguro en el demo, retornamos false si es Expo Go.
    if (Constants.appOwnership === AppOwnership.Expo) return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Recordatorios",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === "granted";
}

/**
 * Programa una notificación local en una fecha futura (Expo SDK 52).
 * Para recordatorios recurrentes por medicamento, amplía esta función.
 */
export async function programarRecordatorioMedicamento(
  titulo: string,
  cuerpo: string,
  fecha: Date
) {
  const diffSec = Math.floor((fecha.getTime() - Date.now()) / 1000);
  const seconds = Math.max(1, diffSec);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
  });
}
