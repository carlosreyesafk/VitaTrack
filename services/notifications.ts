import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarCanalYPermisos() {
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
