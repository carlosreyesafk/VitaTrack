import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const perfil = useAuthStore((s) => s.perfil);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const setSession = useAuthStore((s) => s.setSession);
  const setPerfil = useAuthStore((s) => s.setPerfil);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const refreshPerfil = useAuthStore((s) => s.refreshPerfil);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabaseConfigured) {
        setLoading(false);
        setInitialized(true);
        return;
      }
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        await refreshPerfil(data.session.user.id);
      } else {
        setPerfil(null);
      }
      setLoading(false);
      setInitialized(true);
    }

    init();

    if (!supabaseConfigured) return;

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) await refreshPerfil(sess.user.id);
      else setPerfil(null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshPerfil, setInitialized, setLoading, setPerfil, setSession]);

  return {
    session,
    perfil,
    loading,
    initialized,
    refreshPerfil,
  };
}
