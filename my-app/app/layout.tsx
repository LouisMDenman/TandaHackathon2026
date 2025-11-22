import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Navigation from "@/components/Navigation";
import CryptoAssistant from "@/components/CryptoAssistant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Crypto Tools - Wallet Checker & Trading Playground",
  description: "Check your Bitcoin or Ethereum wallet balance and practice trading with our paper trading simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="antialiased" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
          <Navigation />
          {children}
          <CryptoAssistant />
        </body>
      </html>
    </ClerkProvider>
  );
}
