"use client";

import { useState } from "react";
import { calculateBmr, type BmrInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type Formula = BmrInput["formula"];
type UnitSystem = "metric" | "imperial";

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};

export default function BmrCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<BmrInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateBmr> | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const needsBodyFat = formula === "katch" || formula === "cunningham";

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
  };

  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age", valid: Number.isFinite(Number(age)) && Number(age) > 0 },
      { label: "Weight", valid: Number.isFinite(Number(weightKg)) && Number(weightKg) > 0 },
      { label: "Height", valid: Number.isFinite(Number(heightCm)) && Number(heightCm) > 0 },
      ...(!needsBodyFat ? [] : [{ label: "Body fat percentage (3–70%)", valid: Number(bodyFatPct) >= 3 && Number(bodyFatPct) <= 70 }]),
    ]);
    setValidationMessage(message);
    if (message) return;
    setResult(calculateBmr({
      age: Number(age),
      sex,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      formula,
      ...(needsBodyFat ? { bodyFatPct: Number(bodyFatPct) } : {}),
    }));
  };

  const updateWeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? parsed / 2.20462 : parsed) : ""));
  };

  const updateHeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setHeightCm(value ? String(unitSystem === "imperial" ? parsed * 2.54 : parsed) : ""));
  };

  return (
    <section className="calculator-panel tdee-calculator-panel bmr-calculator-panel" aria-label="BMR calculator">
      <div className="calculator-form tdee-calculator-form bmr-calculator-form">
        <div className="tdee-form-heading">
          <div>
            <h2>Your Details</h2>
            <p className="bmr-form-helper">Enter your information to calculate your BMR.</p>
          </div>
          <div className="tdee-unit-toggle" aria-label="Unit system">
            {(["metric", "imperial"] as const).map((unit) => (
              <button
                aria-pressed={unitSystem === unit}
                className={unitSystem === unit ? "selected" : ""}
                key={unit}
                onClick={() => {
                  if (unit === unitSystem) return;
                  setUnitSystem(unit);
                  setResult(null);
                  setValidationMessage("");
                }}
                type="button"
              >
                {unit === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>
        </div>

        <label className="field tdee-sex-field">
          <span>Sex</span>
          <div className="segmented">
            {(["male", "female"] as const).map((value) => (
              <button className={sex === value ? "selected" : ""} key={value} onClick={() => updateInput(() => setSex(value))} type="button">
                {value === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </label>

        <div className="tdee-field-grid">
          <label className="field">
            <span>Age</span>
            <div className="input-unit"><input min="1" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round(Number(weightKg) * (unitSystem === "imperial" ? 2.20462 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            <div className="input-unit"><input aria-label={`Height in ${unitSystem === "metric" ? "cm" : "in"}`} min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * (unitSystem === "imperial" ? 1 / 2.54 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "cm" : "in"}</i></div>
          </label>
        </div>

        <details className="tdee-formula-options" open>
          <summary>Calculation Method</summary>
          <label className="field">
            <span>Formula</span>
            <select onChange={(event) => updateInput(() => setFormula(event.target.value as Formula))} value={formula}>
              {(Object.entries(formulaLabels) as [Formula, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}{value === "katch" || value === "cunningham" ? " (requires body fat %)" : ""}</option>
              ))}
            </select>
          </label>
          {needsBodyFat && (
            <label className="field">
              <span>Body fat percentage (3–70%)</span>
              <div className="input-unit"><input max="70" min="3" onChange={(event) => updateInput(() => setBodyFatPct(event.target.value))} type="number" value={bodyFatPct} /><i>%</i></div>
            </label>
          )}
        </details>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate BMR
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results bmr-calculator-results">
        <h2>Your BMR</h2>
        <p className="bmr-result-label">Estimated BMR</p>
        <div className="tdee-calorie-total bmr-calorie-total">
          <strong>{result ? result.bmr.toLocaleString() : "—"}</strong>
          <span>calories per day</span>
        </div>
        <p className="bmr-results-note">
          {result
            ? `This is your estimated basal metabolic rate under resting conditions, calculated with ${result.formulaUsed}.`
            : "This is your estimated basal metabolic rate under resting conditions."}
        </p>
      </div>
    </section>
  );
}
