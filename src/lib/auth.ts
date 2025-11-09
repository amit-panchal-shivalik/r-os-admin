import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, territory: string, pincode: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
}

export async function signUp(email: string, password: string, fullName: string, territory: string, pincode: string) {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
        territory,
        pincode,
      },
    },
  });

  // Update profile with territory and pincode
  if (data.user && !error) {
    await supabase
      .from("profiles")
      .update({ territory, pincode })
      .eq("id", data.user.id);
  }

  return { error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function setupAuthListener(
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void
) {
  // Set up listener first
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Then check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return subscription;
}
