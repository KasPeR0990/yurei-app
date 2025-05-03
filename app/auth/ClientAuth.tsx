"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthCard from "@/app/auth/authcard/AuthCard";

export default function ClientAuth({ initialUser, children }: { initialUser: any, children: React.ReactNode }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const supabase = createClient();

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) return null; // Optionally, show a loading spinner
  if (!user) return <AuthCard />;
  return <>{children}</>;
}