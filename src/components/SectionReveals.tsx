"use client";

import { useEffect } from "react";

export default function SectionReveals() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) return;

    const sections = document.querySelectorAll<HTMLElement>(
      ".home-shell > .content-section, .home-shell > article.prose .mdx-section, .home-shell .calculator-article .mdx-section",
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target as HTMLElement;
        requestAnimationFrame(() => section.classList.add("section-revealed"));
        observer.unobserve(section);
      }
    }, { threshold: 0.08 });

    sections.forEach((section) => {
      section.classList.add("section-reveal");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
