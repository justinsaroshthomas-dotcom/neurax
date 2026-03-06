import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuraMed — Disease Prediction Dashboard",
  description:
    "AI-powered disease prediction with real-time symptom analysis. Built with medical-grade precision and cyberpunk aesthetics.",
  keywords: ["disease prediction", "AI diagnostics", "symptom analysis", "health dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
