"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

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
          redirectTo: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || 
            `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
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
      <Card className="bg-background/95 backdrop-blur-sm dark:bg-neutral-900/95 md:w-[400px] font-mono border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center mb-2 flex items-center justify-center gap-2 font-mono">
            <span>Welcome to Yurei</span>
            <img 
              src="/yurei-ghost.svg" 
              alt="Yurei Ghost" 
              className="w-8 h-8 " 
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-muted-foreground text-sm font-mono">
              Sign in with Google to get started
            </p>
            {error && <p className="text-red-400 text-sm mt-2 font-mono">{error}</p>}
          </div>
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            variant="default"
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}