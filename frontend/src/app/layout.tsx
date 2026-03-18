import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/utils/AuthContext";

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
      </body>
    </html>
  );
}
