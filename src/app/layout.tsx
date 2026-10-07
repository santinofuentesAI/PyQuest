import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { AppStage } from "@/components/app-stage";
import { PybotHelp } from "@/components/pybot-help";

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

const paletteBoot = `(function(){try{var r=localStorage.getItem("pyquest-progress-v1");if(!r){document.documentElement.setAttribute("data-palette","violet");return;}var j=JSON.parse(r);var s=j.state||j;var pal=s.palette||(s.theme==="dark"?"night":"violet");document.documentElement.setAttribute("data-palette",pal);if(pal==="night"||pal==="forest"||pal==="black")document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable} h-full antialiased`} data-palette="violet" suppressHydrationWarning>
      <body className="flex min-h-full flex-col overflow-x-clip bg-background text-foreground">
        <Script id="palette-boot" strategy="beforeInteractive">
          {paletteBoot}
        </Script>
        <Providers>
          <TopBar />
          <main id="main-content" className="min-h-0 flex-1"><AppStage>{children}</AppStage></main>
          <PybotHelp />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
