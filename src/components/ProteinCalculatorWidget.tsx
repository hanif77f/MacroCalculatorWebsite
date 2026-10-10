"use client";

import { useState } from "react";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, type StandardGoal } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, feetAndInchesToCentimeters, inchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";
import { calculateProtein, type ProteinResult } from "@/lib/calculators/protein-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import { formatNutrientAmount, type NutrientDisplayUnit } from "@/lib/nutrient-display";
import type { MacroInput } from "@/lib/calculators/macro-calculator";

type ProteinActivity = MacroInput["activity"];

export default function ProteinCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<ProteinActivity>("moderately-active");
  const [goal, setGoal] = useState<StandardGoal>("maintain");
  const [displayUnit, setDisplayUnit] = useState<NutrientDisplayUnit>("grams");
  const [result, setResult] = useState<ProteinResult | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
  };
  const updateWeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? poundsToKilograms(parsed) : parsed) : ""));
  };
  const updateHeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setHeightCm(value ? String(unitSystem === "imperial" ? inchesToCentimeters(parsed) : parsed) : ""));
  };
  const updateImperialHeight = (feet: string, inches: string) => {
    const height = feetAndInchesToCentimeters(Number(feet) || 0, Number(inches) || 0);
    updateInput(() => setHeightCm(feet || inches ? String(height) : ""));
  };
  const imperialHeight = centimetersToFeetAndInches(Number(heightCm));
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Weight", valid: Number.isFinite(Number(weightKg)) && Number(weightKg) >= 1 },
      ...(!age.trim() ? [] : [{ label: "Age (18–80)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 80 }]),
    ]);
    setValidationMessage(message);
    if (message) return;
    setResult(calculateProtein({ weightKg: Number(weightKg) }));
  };
  const displayed = (grams: number) => formatNutrientAmount(grams, displayUnit);

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel protein-nutrient-calculator-panel" aria-label="Protein calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div className="tdee-unit-toggle" aria-label="Weight and height unit system">
            {(["imperial", "metric"] as const).map((unit) => (
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
          <span>Sex <small>(optional context; not used)</small></span>
          <div className="segmented">
            {(["male", "female"] as const).map((value) => (
              <button aria-pressed={sex === value} className={sex === value ? "selected" : ""} key={value} onClick={() => updateInput(() => setSex(value))} type="button">
                {value === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </label>

        <div className="tdee-field-grid">
          <label className="field">
            <span>Age <small>(optional context)</small></span>
            <div className="input-unit"><input min="1" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round((unitSystem === "imperial" ? kilogramsToPounds(Number(weightKg)) : Number(weightKg)) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height <small>(optional context)</small></span>
            {unitSystem === "metric" ? (
              <div className="input-unit"><input aria-label="Height in centimeters" min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * 10) / 10) : ""} /><i>cm</i></div>
            ) : (
              <div className="input-unit height-feet">
                <input aria-label="Height in feet" min="1" onChange={(event) => updateImperialHeight(event.target.value, String(Math.round(imperialHeight.inches * 10) / 10))} type="number" value={heightCm ? String(imperialHeight.feet) : ""} /><i>ft</i>
                <input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => updateImperialHeight(String(imperialHeight.feet), event.target.value)} step="0.1" type="number" value={heightCm ? String(Math.round(imperialHeight.inches * 10) / 10) : ""} /><i>in</i>
              </div>
            )}
          </label>
        </div>

        <div className="calculator-selection-row">
          <label className="field">
            <span>Activity Level <small>(does not adjust RDA)</small></span>
            <select onChange={(event) => updateInput(() => setActivity(event.target.value as ProteinActivity))} value={activity}>
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ProteinActivity[]).map((level) => (
                <option key={level} value={level}>{ACTIVITY_OPTIONS.find((option) => option.value === level)?.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Goal <small>(does not adjust RDA)</small></span>
            <select onChange={(event) => updateInput(() => setGoal(event.target.value as StandardGoal))} value={goal}>
              {GOAL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        {/* <p className="protein-context-note">This general adult RDA estimate uses body weight only. Activity level and goal are shown for consistency and do not change this estimate. Age, sex, and height are optional context and are not used in the calculation.</p> */}

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Protein
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results">
        <div className="nutrient-results-header">
          <h2>Estimated Daily Protein Intake</h2>
          <div className="macro-unit-toggle" role="group" aria-label="Protein display units">
            <span>Units:</span>
            {(["grams", "ounces"] as const).map((unit) => (
              <button aria-pressed={displayUnit === unit} className={displayUnit === unit ? "active" : ""} key={unit} onClick={() => setDisplayUnit(unit)} type="button">
                {unit === "grams" ? "Grams" : "Ounces"}
              </button>
            ))}
          </div>
        </div>
        <p className="bmr-result-label">General adult RDA reference</p>
        <div className="tdee-calorie-total bmr-calorie-total protein-target-total">
          <strong>{result ? displayed(result.targetGrams) : "—"}</strong>
          <span>{displayUnit === "grams" ? "g/day" : "oz/day"}</span>
        </div>
        <p className="protein-target-range">0.8 g/kg/day is a general adult Recommended Dietary Allowance reference, not an individualized fitness target.</p>
        {result && <p className="protein-target-method">Reference: {result.targetPerKg.toFixed(1)} g/kg/day · Body weight: {Number(weightKg).toFixed(1)} kg</p>}
        <details className="nutrient-details">
          <summary>How this is calculated</summary>
          <p>Daily protein reference = body weight in kilograms × 0.8 g/kg/day. The displayed amount is rounded for presentation. Activity level, goal, age, sex, and height do not change this RDA-based estimate.</p>
          <p>The RDA is a general reference for healthy adults; individual needs can vary. This calculator does not provide medical advice.</p>
          <p><a href="https://www.nationalacademies.org/projects/HMD-FNB-18-P-119/publication/10490" rel="noreferrer" target="_blank">National Academies: Dietary Reference Intakes for protein and amino acids</a></p>
        </details>
      </div>
    </section>
  );
}
