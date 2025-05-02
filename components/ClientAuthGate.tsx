"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthCard from "@/app/auth/authcard/auth-card";

export default function ClientAuthGate({ initialUser, children }: { initialUser: any, children: React.ReactNode }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (user === undefined) return null; // Optionally, show a loading spinner
  if (!user) return <AuthCard />;
  return <>{children}</>;
}
