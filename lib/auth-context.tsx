"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import {
  AuthUser,
  TeamMemberRole,
  ROLE_NAV,
} from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  canAccess: (section: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** After we have an auth.users session, fetch the team_members row + shop currency */
  const loadTeamMember = useCallback(async (userId: string, accessToken: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, shop_id, name, email, role, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !data) {
      setUser(null);
      return;
    }

    // Fetch shop currency so all pages can format money correctly
    const { data: shopData } = await supabase
      .from("shops")
      .select("currency_code")
      .eq("id", data.shop_id)
      .single();

    setUser({
      team_member_id: data.id,
      auth_user_id: userId,
      shop_id: data.shop_id,
      name: data.name,
      email: data.email,
      role: data.role as TeamMemberRole,
      access_token: accessToken,
      currency_code: shopData?.currency_code ?? "KES",
    });

    // Update last_seen_at in the background
    supabase
      .from("team_members")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", data.id)
      .then(() => {});
  }, []);

  useEffect(() => {
    // Initial session check — done first, then subscribe to avoid double-load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.access_token) {
        loadTeamMember(session.user.id, session.access_token).finally(() =>
          setIsLoading(false)
        );
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for subsequent auth state changes (login, logout, token refresh)
    // Skip INITIAL_SESSION — already handled by getSession above
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") return;
        if (session?.user && session.access_token) {
          loadTeamMember(session.user.id, session.access_token);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadTeamMember]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  const canAccess = (section: string) => {
    if (!user) return false;
    return ROLE_NAV[user.role]?.includes(section) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

