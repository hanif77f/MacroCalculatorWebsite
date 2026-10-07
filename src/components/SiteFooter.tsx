import Image from "next/image";
import Link from "next/link";
import SiteLink from "@/components/SiteLink";

const calculators = [
  ["Macro Calculator", "/"],
  ["Protein Calculator", "/calculators/protein-calculator"],
  ["TDEE Calculator", "/calculators/tdee-calculator"],
  ["Calorie Calculator", "/calculators/calorie-calculator"],
  ["Body Fat Calculator", "/calculators/body-fat-calculator"],
];

const socialLinks = [
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.932 4.932 0 0 0 2.163-2.723 9.99 9.99 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.95 13.95 0 0 1 1.64 3.162a4.916 4.916 0 0 0 1.523 6.557 4.903 4.903 0 0 1-2.229-.616v.062a4.918 4.918 0 0 0 3.946 4.818 4.935 4.935 0 0 1-2.224.084 4.926 4.926 0 0 0 4.6 3.416A9.867 9.867 0 0 1 0 19.54a13.93 13.93 0 0 0 7.548 2.213c9.057 0 14.01-7.504 14.01-14.01l-.017-.637a10.01 10.01 0 0 0 2.46-2.548l-.048.012Z" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    icon: <><rect height="18" rx="5" width="18" x="3" y="3" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" /></>,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    icon: <path d="M13.5 21v-8.2h2.76l.414-3.2H13.5V7.56c0-.927.258-1.56 1.59-1.56h1.698V3.138A22.7 22.7 0 0 0 14.314 3c-2.454 0-4.134 1.498-4.134 4.25V9.6H7.4v3.2h2.78V21h3.32Z" />,
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <section className="footer-brand">
            <Link className="footer-brand-link" href="/">
              <Image alt="" aria-hidden="true" className="footer-brand-logo" height={40} src="/images/logo/logo.png" width={40} />
              <span><span className="footer-brand-accent">Macro</span>Calculators</span>
            </Link>
            <p>Clear tools for more confident nutrition decisions.</p>
            <Link className="footer-brand-cta" href="/calculators">Explore our calculators <span aria-hidden="true">↗</span></Link>
          </section>

          <nav aria-label="Calculator links" className="footer-col">
            <h2>Calculators</h2>
            {calculators.map(([title, href]) => <Link href={href} key={title}>{title}</Link>)}
          </nav>

          <nav aria-label="Company links" className="footer-col">
            <h2>Company</h2>
            <Link href="/about">About us</Link>
            <Link href="/editorial-team">Editorial Team</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <nav aria-label="Legal links" className="footer-col">
            <h2>Legal</h2>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms-of-use">Terms of use</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>

          <section aria-label="Social media" className="footer-social">
            <h2>Find us online</h2>
            <p>Follow MacroCalculators on social media.</p>
            <div className="footer-social-links">
              {socialLinks.map((social) => (
                <SiteLink aria-label={social.label} href={social.href} key={social.label} title={social.label}>
                  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">{social.icon}</svg>
                </SiteLink>
              ))}
            </div>
          </section>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MacroCalculators.com</span>
          <span>Better nutrition. Smarter choices.</span>
          <Link href="/contact">Questions? Get in touch <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </footer>
  );
}
