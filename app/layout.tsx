import ClientAuthGate from "@/components/ClientAuthGate";
import { createClient } from "@/utils/supabase/server";
import AuthCard from "@/app/auth/authcard/auth-card";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { cn } from "@/utils/utils";
import "./globals.css";

// Change when production
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Yurei",
  description: "Search for content ideas across social media platforms",
  icons: {
    icon: "/yurei-ghost.svg",
  },
};


export default async function CombinedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen")}>
        <NuqsAdapter>
        <Providers>
          <main>
            <ClientAuthGate initialUser={user}>
              {children}
            </ClientAuthGate>
          </main>
        </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}