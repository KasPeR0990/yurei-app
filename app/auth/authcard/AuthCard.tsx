"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Circle } from "lucide-react";

export default function AuthCard() {
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            process.env.NEXT_PUBLIC_URL ?? location.origin
          }/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono">
      <Card
        className={`${theme === "dark" ? "bg-[#0A0A0A] border-[--border]" : "bg-[--card] border-[--border]"} md:w-[400px] font-mono`}
      >
        <div className="absolute -top-6 -right-6 opacity-[0.03] rotate-45">
          <Circle className="w-12 h-12 absolute" strokeWidth={1} />
          <Circle className="w-12 h-12 absolute -translate-x-2 -translate-y-2" strokeWidth={1} />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center mb-2 flex items-center justify-center gap-2 font-mono">
          <span>Welcome to Yurei</span>
            <img 
              src="/yurei-ghost.svg" 
              alt="Yurei Ghost" 
              className="w-8 h-8" 
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className={`${theme === "dark" ? "text-[--muted-foreground]" : "text-[--muted-foreground]"} text-sm font-mono`}>
              Continue with Google to search content ideas
            </p>
            {error && <p className="text-red-400 text-sm mt-2 font-mono">{error}</p>}
          </div>

          <button
            onClick={handleGoogleSignIn}
            className={`w-full flex justify-center items-center gap-2 transition-colors rounded-xl px-6 py-3 font-mono bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-black border border-gray-300`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
