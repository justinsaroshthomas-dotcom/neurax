import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuraMed — Disease Prediction Dashboard",
  description:
    "AI-powered disease prediction with real-time symptom analysis. Built with medical-grade precision and cyberpunk aesthetics.",
  keywords: ["disease prediction", "AI diagnostics", "symptom analysis", "health dashboard"],
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased" suppressHydrationWarning>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="emerald"
            themes={["light", "dark", "emerald", "midnight", "cyber"]}
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
