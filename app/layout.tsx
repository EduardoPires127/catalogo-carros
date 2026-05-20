import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { STORE_NAME, STORE_DESCRIPTION } from "@/data/cars";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${STORE_NAME} - Catálogo de Carros`,
  description: STORE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
