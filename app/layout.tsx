import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A/L Mastermind | Master Your A/L Journey",
  description: "A calm, focused study workspace for Sri Lankan G.C.E. Advanced Level students.",
  applicationName: "A/L Mastermind",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Mastermind" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" }
};

export const viewport: Viewport = {
  themeColor: "#080b1a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<script dangerouslySetInnerHTML={{__html: "if ('serviceWorker' in navigator && location.protocol.startsWith('http')) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }"}} /></body></html>;
}