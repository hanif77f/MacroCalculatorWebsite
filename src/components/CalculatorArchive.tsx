"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculators, calculatorHref, calculatorNavigationGroups } from "@/data/calculators";

const archiveTypeLabels: Record<string, string> = {
  macro: "Macros",
  protein: "Protein",
  carbs: "Carbohydrate",
  fat: "Dietary Fat",
  bmr: "Metabolism",
  tdee: "Energy",
  calories: "Calories",
  deficit: "Weight Loss",
  bodyfat: "Body Fat",
  leanmass: "Lean Mass",
};

export default function CalculatorArchive() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const groupedCalculators = useMemo(() => calculatorNavigationGroups.map((group) => ({
    ...group,
    calculators: calculators
      .filter((calculator) => calculator.navigationGroup === group.id)
      .sort((a, b) => (a.navigationOrder ?? Number.MAX_SAFE_INTEGER) - (b.navigationOrder ?? Number.MAX_SAFE_INTEGER)),
  })), []);
  const matchingCalculators = useMemo(() => groupedCalculators.flatMap((group) => group.calculators).filter((calculator) => {
    const searchText = `${calculator.title} ${calculator.shortTitle} ${calculator.description} ${calculator.calculatorType}`.toLowerCase();
    return searchText.includes(normalizedQuery);
  }), [groupedCalculators, normalizedQuery]);
  const matchingSlugs = new Set(matchingCalculators.map((calculator) => calculator.slug));

  return (
    <main className="calculator-archive">
      <section aria-labelledby="calculator-archive-title" className="calculator-archive-hero">
        <p className="calculator-archive-eyebrow">Calculator Directory</p>
        <h1 id="calculator-archive-title">Nutrition &amp;<br />Fitness Calculators</h1>
        <p className="calculator-archive-intro">
          Explore our calculators for macros, calories, metabolism, body composition, and nutrition planning. Each tool is built around a specific question and designed to give you a clear, practical estimate.
        </p>
      </section>

      <section aria-label="Calculator directory controls" className="calculator-archive-toolbar">
        <p aria-live="polite" className="calculator-archive-count">
          <strong>{matchingCalculators.length.toString().padStart(2, "0")}</strong>
          <span>{matchingCalculators.length === 1 ? "calculator" : "calculators"}</span>
        </p>
        <label className="calculator-archive-search">
          <span className="calculator-archive-visually-hidden">Search calculators</span>
          <input
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search calculators..."
            type="search"
            value={query}
          />
        </label>
      </section>

      <nav aria-label="Calculator categories" className="calculator-archive-categories">
        {groupedCalculators.filter((group) => group.calculators.some((calculator) => matchingSlugs.has(calculator.slug))).map((group) => (
          <a href={`#${group.id}`} key={group.id}>{group.label}</a>
        ))}
      </nav>

      <div className="calculator-archive-directory">
        {groupedCalculators.map((group) => {
          const groupCalculators = group.calculators.filter((calculator) => matchingSlugs.has(calculator.slug));
          if (groupCalculators.length === 0) return null;

          return (
            <section aria-labelledby={`archive-${group.id}`} className="calculator-archive-section" id={group.id} key={group.id}>
              <div className="calculator-archive-section-heading">
                <h2 id={`archive-${group.id}`}>{group.label}</h2>
                <span>{groupCalculators.length.toString().padStart(2, "0")} {groupCalculators.length === 1 ? "calculator" : "calculators"}</span>
              </div>
              <div className="calculator-archive-list">
                {groupCalculators.map((calculator) => {
                  const index = matchingCalculators.findIndex((item) => item.slug === calculator.slug) + 1;
                  return (
                    <Link className={`calculator-archive-row calculator-archive-row-${calculator.slug}`} href={calculatorHref(calculator)} key={calculator.slug}>
                      <span aria-hidden="true" className="calculator-archive-index">{index.toString().padStart(2, "0")}</span>
                      <span className="calculator-archive-copy">
                        <span className="calculator-archive-name">{calculator.title}</span>
                        <span className="calculator-archive-description">{calculator.description}</span>
                      </span>
                      <span className="calculator-archive-type">{archiveTypeLabels[calculator.calculatorType] ?? group.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {matchingCalculators.length === 0 && (
        <p className="calculator-archive-empty" role="status">No calculators match your search.</p>
      )}

      <aside className="calculator-archive-note">
        <strong>Start with the calculator that matches your question.</strong>
        <p>
          For complete macro targets, start with the Macro Calculator. For daily energy needs, explore the BMR, TDEE, or Calorie Calculator. For body composition, use the Body Fat or Lean Body Mass Calculator.
        </p>
      </aside>
    </main>
  );
}
