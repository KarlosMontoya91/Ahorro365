import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reto 365 - Mi Ahorro",
  description: "Aplicación diaria de ahorro",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}>
        {/* Fondo tipo app */}
        <div className="app-shell-bg min-h-dvh">{children}</div>
      </body>
    </html>
  );
}
