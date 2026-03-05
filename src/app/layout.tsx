import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuraMed — Disease Prediction Dashboard",
  description:
    "AI-powered disease prediction with real-time symptom analysis. Built with medical-grade precision and cyberpunk aesthetics.",
  keywords: ["disease prediction", "AI diagnostics", "symptom analysis", "health dashboard"],
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );

  if (!clerkKey) {
    return content;
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#00f0ff",
          colorBackground: "#0f1526",
          colorInputBackground: "#151d35",
          colorText: "#e0e6f0",
        },
      }}
    >
      {content}
    </ClerkProvider>
  );
}
