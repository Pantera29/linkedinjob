import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recolector de Datos de Ofertas de LinkedIn",
  description: "Aplicación para extraer y almacenar datos de ofertas de trabajo de LinkedIn utilizando la API de Bright Data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
