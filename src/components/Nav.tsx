import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="brand-mark"><span className="leaf-mark" aria-hidden="true"/><b>Macro<span>Calculators</span></b></Link>
        <div className="nav-tools">
          <nav className="main-nav">
            <Link href="/calculators">Calculators</Link><Link href="/guides">Guides</Link><Link href="/guides/nutrition-basics">Nutrition</Link><Link href="/guides">Blog</Link><Link href="/about">About</Link>
          </nav>
          <label className="nav-search"><input placeholder="Search calculators..." aria-label="Search calculators"/><span aria-hidden="true">&#8981;</span></label>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
