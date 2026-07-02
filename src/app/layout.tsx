import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The 11 Professional Family Salon | Best Salon in Kolhapur",
  description: "Transform Your Style. Elevate Your Confidence. Hair, Skin, Nail, Spa, Makeup, and Mehndi at Kolhapur's most premium luxury family salon.",
  keywords: ["Best Salon in Kolhapur", "Family Salon in Kolhapur", "Hair Salon in Kolhapur", "Bridal Makeup Kolhapur", "Hair Spa Kolhapur", "Beauty Salon Kolhapur"],
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
