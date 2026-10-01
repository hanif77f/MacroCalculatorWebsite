import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Roboto_Condensed, Space_Grotesk } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const heroFont = Roboto_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-hero" });

export const metadata: Metadata = {
  title: "MacroCalculators — Nutrition Calculators Built for Real-World Goals",
  description: "Free macro, TDEE, protein, and body composition calculators. No signup required.",
  metadataBase: new URL("https://macrocalculators.com"),
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${dmSerif.variable} ${inter.variable} ${spaceGrotesk.variable} ${heroFont.variable}`}><Nav />{children}
    <footer className="site-footer"><div className="footer-main">
      <div className="footer-brand"><strong>◢ &nbsp;Macro<span>Calculators</span></strong><p>Better Nutrition. Smarter Choices.</p></div>
      <div className="footer-col"><strong>Calculators</strong><a href="/">Macro Calculator</a><a href="/calculators/tdee-calculator">Calorie Calculator</a><a href="/calculators/tdee-calculator">TDEE Calculator</a><a href="/calculators/bmr-calculator">BMR Calculator</a><a href="/calculators/body-fat-calculator">Body Fat Calculator</a></div>
      <div className="footer-col"><strong>Guides</strong><a href="/guides">What Are Macros?</a><a href="/guides">Macro Ratios</a><a href="/guides">Tracking Guide</a><a href="/guides">Nutrition Basics</a><a href="/guides">Common Mistakes</a></div>
      <div className="footer-col"><strong>About</strong><a href="/about">About Us</a><a href="/about">Contact</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Use</a><a href="/disclaimer">Disclaimer</a></div>
      <div className="footer-col"><strong>Follow Us</strong><a href="#">▶ &nbsp;● &nbsp;𝕏 &nbsp;℗</a></div>
    </div><div className="footer-bottom"><span>© 2024 MacroCalculators.com. All rights reserved.</span><span>Better Nutrition. Smarter Choices.</span></div></footer>
  </body></html>;
}
