import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";
import { AuthProvider } from 'cosmic-authentication';
import Navigation from '@/app/components/Navigation';
import CreditsInitializer from '@/app/components/CreditsInitializer';
import Footer from '@/app/components/Footer';

const primaryFont = Inter({
  weight: ["300", "400", "500", "600", "800"],
  subsets: ["latin"],
});

// Change the title and description to your own.
export const metadata: Metadata = {
  title: "Promptopiya - Influencer Cinematic Photography Prompts",
  description: "Become a fashion influencer with perfect character consistency for only $10. Zero studio cost, zero travel, zero outfits - just instant PDF prompt downloads.",
};

export default function RootLayout({
  children,
  
}: Readonly<{ 
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en" className={primaryFont.className}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com"/>
        <link rel="dns-prefetch" href="https://images.unsplash.com"/>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <main className="min-h-screen relative">
          {/* Site-wide background */}
          <div 
            className="fixed inset-0 -z-10"
            style={{
              background: 'linear-gradient(179deg, rgba(0,0,0,1) 9.2%, rgba(127,16,16,1) 103.9%)'
            }}
          />
          {/* Navbar */}
          <Navigation />
          {/* Init credits */}
          <CreditsInitializer />
            <CosmicAnalyticsProvider>
              {children}
              <Footer />
            </CosmicAnalyticsProvider>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}