import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { Perfil } from "@/types";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type AuthState = {
  session: Session | null;
  perfil: Perfil | null;
  loading: boolean;
  initialized: boolean;
  setSession: (s: Session | null) => void;
  setPerfil: (p: Perfil | null) => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
  signOut: () => Promise<void>;
  refreshPerfil: (userId?: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  perfil: null,
  loading: true,
  initialized: false,
  setSession: (session) => set({ session }),
  setPerfil: (perfil) => set({ perfil }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  signOut: async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    set({ session: null, perfil: null });
  },
  refreshPerfil: async (userId?: string) => {
    const uid = userId ?? get().session?.user?.id;
    if (!uid || !supabaseConfigured) {
      set({ perfil: null });
      return;
    }
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    if (error) {
      console.warn("refreshPerfil", error.message);
      set({ perfil: null });
      return;
    }
    set({ perfil: data as Perfil });
  },
}));
