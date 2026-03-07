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

import { Outfit, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey="pk_test_cHJvbW90ZWQtdXJjaGluLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ">
      <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
        <body className="antialiased font-sans" suppressHydrationWarning>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="emerald"
            themes={["light", "dark", "emerald", "midnight", "cyber", "ultraviolet", "crimson", "corporate"]}
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
