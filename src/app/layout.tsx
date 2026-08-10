import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The 11 Professional Family Salon | Best Salon in Kolhapur",
  description: "Transform Your Style. Elevate Your Confidence. Hair, Skin, Nail, Spa, Makeup, and Mehndi at Kolhapur's most premium luxury family salon.",
  keywords: ["Best Salon in Kolhapur", "Family Salon in Kolhapur", "Hair Salon in Kolhapur", "Bridal Makeup Kolhapur", "Hair Spa Kolhapur", "Beauty Salon Kolhapur"],
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
