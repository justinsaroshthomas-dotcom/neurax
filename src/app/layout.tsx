import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { THEME_IDS, THEME_STORAGE_KEY } from "@/lib/theme-config";
import "./globals.css";

export const metadata: Metadata = {
    title: "Neurax - Universal Disease Intelligence",
    description: "Multi-layered diagnostic matrix for clinical analysis with generated local symptom intelligence.",
    keywords: ["disease prediction", "AI diagnostics", "symptom analysis", "health dashboard"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            publishableKey="pk_test_cHJvbW90ZWQtdXJjaGluLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ"
            localization={{
                signIn: {
                    start: {
                        title: "Sign in to Neurax",
                        subtitle: "to continue to the clinical portal",
                    },
                },
                signUp: {
                    start: {
                        title: "Create Neurax Account",
                        subtitle: "to access the intelligence matrix",
                    },
                },
            }}
        >
            <html
                lang="en"
                suppressHydrationWarning
            >
                <head>
                    <Script
                        src="https://mcp.figma.com/mcp/html-to-design/capture.js"
                        strategy="afterInteractive"
                    />
                </head>
                <body className="antialiased font-sans" suppressHydrationWarning>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        storageKey={THEME_STORAGE_KEY}
                        themes={THEME_IDS}
                    >
                        <TooltipProvider>{children}</TooltipProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
