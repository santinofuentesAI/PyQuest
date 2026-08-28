import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://127.0.0.1:43180";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PyQuest — Python para datos e IA",
  description:
    "Aprende Python para análisis de datos e inteligencia artificial con lecciones cortas, corazones, rachas y un laboratorio real en el navegador.",
  applicationName: "PyQuest",
  openGraph: {
    title: "PyQuest — Python para datos e IA",
    description: "De print('hola') a tu primer modelo. En el navegador, sin instalar Anaconda.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <TopBar />
          <main className="flex-1">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
