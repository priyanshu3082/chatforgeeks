import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/utils/AuthContext";
import Script from "next/script";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f7",
};

export const metadata: Metadata = {
  title: "ChatForGeeks | AI-Powered Data Analytics",
  description:
    "Ask your data anything in plain English. Powered by Anthropic Claude AI — instantly get SQL-generated charts and insights.",
  keywords: ["business intelligence", "AI analytics", "Claude AI", "data visualization", "natural language SQL"],
  authors: [{ name: "ChatForGeeks" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>

        {/* Global Google Translate Widget */}
        <div 
          id="google_translate_element" 
          className="fixed bottom-4 left-4 z-[99999] opacity-70 hover:opacity-100 transition-opacity bg-white/70 dark:bg-[#121715]/90 backdrop-blur rounded overflow-hidden" 
        />
        
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
        >
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 
                'google_translate_element'
              );
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
