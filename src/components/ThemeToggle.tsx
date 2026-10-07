"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      className="theme-toggle"
      onClick={toggle}
      title={`Switch to ${nextTheme} mode`}
      type="button"
    >
      <svg aria-hidden="true" className={`theme-toggle-icon theme-toggle-icon-${theme}`} fill="none" viewBox="0 0 24 24">
        {theme === "light" ? (
          <>
            <path d="M20.1 15.4A8.5 8.5 0 0 1 8.6 3.9 8.5 8.5 0 1 0 20.1 15.4Z" />
            <path d="M16.5 4.5v3m-1.5-1.5h3" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="3.7" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        )}
      </svg>
      <span className="theme-toggle-indicator" aria-hidden="true" />
    </button>
  );
}
