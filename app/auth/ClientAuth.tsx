"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AuthCard from "@/app/auth/authcard/AuthCard";

export default function ClientAuth({ initialUser, children }: { initialUser: any, children: React.ReactNode }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (user === undefined) return null; // Optionally, show a loading spinner

  return (
    <>
      {children}
      {!user && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>
          <div className="flex items-center justify-center h-full pointer-events-auto relative z-10">
            <AuthCard />
          </div>
        </div>
      )}
    </>
  );
}