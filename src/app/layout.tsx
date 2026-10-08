import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Roboto_Condensed, Space_Grotesk } from "next/font/google";
import Nav from "@/components/Nav";
import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import { OG_IMAGE } from "@/lib/seo";
import { GoogleTagManager } from '@next/third-parties/google'
import { organizationSchema, websiteSchema } from "@/lib/schema";
import "./globals.css";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const heroFont = Roboto_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-hero" });


export const metadata: Metadata = {
  title: "Macro Calculator: Calculate Calories, Protein, Carbs & Fat",
  description: "Calculate your daily calories, protein, carbohydrates, and fat based on your goals, activity level, and body metrics.",
  metadataBase: new URL("https://macrocalculators.com"),
  alternates: {
    canonical: "https://macrocalculators.com/",
  },
  openGraph: {
    title: "Macro Calculator: Calculate Your Daily Protein, Carbs & Fat",
    description: "Calculate your daily calories, protein, carbohydrates, and fat based on your goals, activity level, and body metrics.",
    url: "https://macrocalculators.com/",
    siteName: "MacroCalculators",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Macro Calculator: Calculate Your Daily Protein, Carbs & Fat",
    description: "Calculate your daily calories, protein, carbohydrates, and fat based on your goals, activity level, and body metrics.",
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/images/logo/favicon.webp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const globalSchema = [organizationSchema(), websiteSchema()];

  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${inter.variable} ${spaceGrotesk.variable} ${heroFont.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }} />
        <Nav />
        {children}
        <SiteFooter />
        <BackToTop />
      </body>
        <GoogleTagManager gtmId="GTM-PNJCTVKN" />
    </html>
  );
}

