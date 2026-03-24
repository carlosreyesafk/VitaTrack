import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra?.supabaseUrl ??
  "";

const anon =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra?.supabaseAnonKey ??
  "";

export const supabaseConfigured = Boolean(url && anon);

export const supabase = createClient(url || "https://placeholder.supabase.co", anon || "placeholder", {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
