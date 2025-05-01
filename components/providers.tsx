'use client';

import { ThemeProvider } from "next-themes";
import { cn } from "@/utils/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
    >
      <div className={cn(
        // color scheme
        "bg-white dark:bg-neutral-950",
        "text-neutral-950 dark:text-neutral-50",
        // Theme variables
        "[--primary:theme(colors.violet.600)] dark:[--primary:theme(colors.violet.400)]",
        "[--primary-foreground:theme(colors.white)]",
        "[--background:theme(colors.white)] dark:[--background:theme(colors.neutral.950)]",
        "[--foreground:theme(colors.neutral.950)] dark:[--foreground:theme(colors.neutral.50)]",
        "[--muted:theme(colors.neutral.100)] dark:[--muted:theme(colors.neutral.800)]",
        "[--muted-foreground:theme(colors.neutral.500)] dark:[--muted-foreground:theme(colors.neutral.400)]",
        "[--card:theme(colors.white)] dark:[--card:theme(colors.neutral.900)]",
        "[--card-foreground:theme(colors.neutral.950)] dark:[--card-foreground:theme(colors.neutral.50)]",
        "[--border:theme(colors.neutral.200)] dark:[--border:theme(colors.neutral.900)]",
        "[--input:theme(colors.neutral.200)] dark:[--input:theme(colors.neutral.900)]",
        "[--ring:theme(colors.violet.500)] dark:[--ring:theme(colors.neutral.900)]",
        "[--accent:theme(colors.neutral.100)] dark:[--accent:theme(colors.neutral.800)]",
        "[--accent-foreground:theme(colors.neutral.900)] dark:[--accent-foreground:theme(colors.neutral.50)]",
        // Selection styles
      
      )}>
        {children}
      </div>
    </ThemeProvider>
  );
}