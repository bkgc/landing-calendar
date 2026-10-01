"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";
import { getBusiness, getUserProfile } from "@/lib/firebase/firestore";
import type { Business, UserProfile } from "@/types/business";

interface AuthContextValue {
  business: Business | null;
  configError: string | null;
  loading: boolean;
  profile: UserProfile | null;
  refresh: () => Promise<void>;
  user: User | null;
}

interface AuthState {
  business: Business | null;
  loading: boolean;
  profile: UserProfile | null;
  user: User | null;
}

const initialState: AuthState = {
  business: null,
  loading: true,
  profile: null,
  user: null,
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const [configError, setConfigError] = useState<string | null>(null);

  const loadUserData = useCallback(async (user: User | null) => {
    if (!user) {
      await fetch("/api/auth/session", { method: "DELETE" }).catch(
        () => undefined,
      );
      setState({ ...initialState, loading: false });
      return;
    }

    const token = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const profile = await getUserProfile(user.uid);
    const business = profile ? await getBusiness(profile.businessId) : null;

    setState({ business, loading: false, profile, user });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setConfigError(
        "Faltan las variables de Firebase. Revisa .env.local antes de continuar.",
      );
      setState({ ...initialState, loading: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      void loadUserData(user).catch(() => {
        setState({ ...initialState, loading: false });
      });
    });

    return unsubscribe;
  }, [loadUserData]);

  const refresh = useCallback(async () => {
    await loadUserData(getFirebaseAuth().currentUser);
  }, [loadUserData]);

  const value = useMemo(
    () => ({ ...state, configError, refresh }),
    [configError, refresh, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
