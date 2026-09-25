import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const MOCK_AUTH_STORAGE_KEY = "hms_mock_auth_session";
const MOCK_OTP_STORAGE_KEY = "hms_mock_otp_data";

interface OtpData {
  email: string;
  code: string;
  expiresAt: number;
}

function createMockSession(email = "admin@hotel.com", name = "Admin Manager"): Session {
  const user: User = {
    id: `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
    app_metadata: { provider: "email" },
    user_metadata: { name, property: "Aurora Central Resort" },
    aud: "authenticated",
    confirmation_sent_at: "",
    recovery_sent_at: "",
    email_change_sent_at: "",
    new_email: "",
    invited_at: "",
    action_link: "",
    email,
    phone: "",
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: "",
    last_sign_in_at: new Date().toISOString(),
    role: "authenticated",
    updated_at: new Date().toISOString(),
    identities: [],
    factors: [],
  };

  return {
    access_token: `mock-token-${Date.now()}`,
    token_type: "bearer",
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    refresh_token: `mock-refresh-${Date.now()}`,
    user,
  };
}

function getStoredMockSession(): Session | null {
  try {
    const raw = localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    if (raw === "logged_out") return null;
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const defaultSession = createMockSession();
  localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(defaultSession));
  return defaultSession;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      return () => subscription.unsubscribe();
    } else {
      setSession(getStoredMockSession());

      const handleStorage = (e: StorageEvent) => {
        if (e.key === MOCK_AUTH_STORAGE_KEY) {
          setSession(getStoredMockSession());
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      return supabase.auth.signInWithPassword({ email, password });
    }
    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 450));
    const newSession = createMockSession(email || "admin@hotel.com");
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return { data: { session: newSession, user: newSession.user }, error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    options?: { data?: { name?: string; property?: string } }
  ) => {
    if (isSupabaseConfigured) {
      return supabase.auth.signUp({
        email,
        password,
        options,
      });
    }
    await new Promise((r) => setTimeout(r, 550));
    const name = options?.data?.name || "Manager";
    const newSession = createMockSession(email || "admin@hotel.com", name);
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return { data: { session: newSession, user: newSession.user }, error: null };
  };

  const sendPasswordResetOtp = async (email: string) => {
    if (isSupabaseConfigured) {
      return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });
    }
    await new Promise((r) => setTimeout(r, 400));
    // Generate mock 6 digit OTP
    const code = "123456";
    const otpData: OtpData = {
      email,
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    sessionStorage.setItem(MOCK_OTP_STORAGE_KEY, JSON.stringify(otpData));
    return { data: { message: "Verification code sent" }, error: null };
  };

  const verifyOtp = async (email: string, code: string) => {
    if (isSupabaseConfigured) {
      return supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });
    }
    await new Promise((r) => setTimeout(r, 450));
    // Allow either the universal demo code 123456 or the stored code
    let valid = code === "123456";
    try {
      const raw = sessionStorage.getItem(MOCK_OTP_STORAGE_KEY);
      if (raw) {
        const stored: OtpData = JSON.parse(raw);
        if (stored.code === code && stored.expiresAt > Date.now()) {
          valid = true;
        }
      }
    } catch {
      // ignore
    }

    if (!valid) {
      return {
        data: null,
        error: { message: "Invalid or expired verification code. Use demo code: 123456" },
      };
    }

    return { data: { verified: true }, error: null };
  };

  const updateUserPassword = async (newPassword: string, email?: string) => {
    if (isSupabaseConfigured) {
      return supabase.auth.updateUser({ password: newPassword });
    }
    await new Promise((r) => setTimeout(r, 500));
    const targetEmail = email || session?.user?.email || "admin@hotel.com";
    const updatedSession = createMockSession(targetEmail);
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
    setSession(updatedSession);
    return { data: { user: updatedSession.user }, error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      return supabase.auth.signOut();
    }
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, "logged_out");
    setSession(null);
    return { error: null };
  };

  return {
    session,
    loading: session === undefined,
    signIn,
    signUp,
    sendPasswordResetOtp,
    verifyOtp,
    updateUserPassword,
    signOut,
  };
}
