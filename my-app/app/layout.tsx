import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Play Money Markets - Learn Trading Risk-Free",
  description: "Practice trading with virtual money and real market prices",
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
