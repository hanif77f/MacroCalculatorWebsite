"use client";

import { useState } from "react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, feetAndInchesToCentimeters, inchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";
import { calculateCalories, type CalorieGoal, type CalorieResult } from "@/lib/calculators/calorie-calculator";
import type { BmrInput, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type ActivityLevel = MacroInput["activity"];
type Formula = "mifflin" | "harris" | "katch";
type ResultUnit = "kcal" | "kJ";

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
};

export default function CalorieCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [resultUnit, setResultUnit] = useState<ResultUnit>("kcal");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<BmrInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | "">("");
  const [goal, setGoal] = useState<CalorieGoal>("maintain");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
  };
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–100)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100 },
      { label: "Weight", valid: Number.isFinite(Number(weightKg)) && Number(weightKg) > 0 },
      { label: "Height", valid: Number.isFinite(Number(heightCm)) && Number(heightCm) > 0 },
      { label: "Activity Level", valid: Boolean(activity) },
      ...(formula !== "katch" ? [] : [{ label: "Body fat percentage (3–70%)", valid: Number(bodyFatPct) >= 3 && Number(bodyFatPct) <= 70 }]),
    ]);
    setValidationMessage(message);
    if (message || !activity) return;
    setResult(calculateCalories({
      age: Number(age),
      sex,
      activity,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      formula,
      goal,
      ...(formula === "katch" ? { bodyFatPct: Number(bodyFatPct) } : {}),
    }));
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
  const display = (value: number) =>
    `${Math.round(resultUnit === "kJ" ? value * 4.184 : value).toLocaleString()} ${resultUnit}/day`;

  return (
    <section className="calculator-panel tdee-calculator-panel calorie-calculator-panel" aria-label="Calorie calculator">
      <div className="calculator-form tdee-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div className="tdee-unit-toggle" aria-label="Measurement units">
            {(["imperial", "metric"] as const).map((unit) => (
              <button aria-pressed={unitSystem === unit} className={unitSystem === unit ? "selected" : ""} key={unit} onClick={() => { setUnitSystem(unit); setResult(null); setValidationMessage(""); }} type="button">
                {unit === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>
        </div>

        <label className="field tdee-sex-field">
          <span>Sex</span>
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
            <span>Age (18–100)</span>
            <div className="input-unit"><input max="100" min="18" onChange={(event) => updateInput(() => setAge(event.target.value))} step="1" type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round((unitSystem === "imperial" ? kilogramsToPounds(Number(weightKg)) : Number(weightKg)) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
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
          <div>
            <label className="field">
              <span>Activity Level</span>
              <select onChange={(event) => updateInput(() => setActivity(event.target.value as ActivityLevel | ""))} value={activity}>
                <option value="">Select activity level</option>
                {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => <option key={level} value={level}>{ACTIVITY_OPTIONS.find((option) => option.value === level)?.label}</option>)}
              </select>
            </label>
            {activity && <p className="tdee-activity-description">{ACTIVITY_LEVELS[activity].hint}</p>}
          </div>
          <label className="field">
            <span>Goal</span>
            <select onChange={(event) => updateInput(() => setGoal(event.target.value as CalorieGoal))} value={goal}>
              {GOAL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <details className="tdee-formula-options">
          <summary>Advanced Settings</summary>
          <label className="field">
            <span>BMR Formula</span>
            <select onChange={(event) => updateInput(() => setFormula(event.target.value as Formula))} value={formula}>
              {(Object.entries(formulaLabels) as [Formula, string][]).map(([value, label]) => <option key={value} value={value}>{label}{value === "katch" ? " (requires body fat %)" : ""}</option>)}
            </select>
          </label>
          {formula === "katch" && (
            <label className="field">
              <span>Body Fat Percentage (3–70%)</span>
              <div className="input-unit"><input max="70" min="3" onChange={(event) => updateInput(() => setBodyFatPct(event.target.value))} type="number" value={bodyFatPct} /><i>%</i></div>
            </label>
          )}
        </details>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Daily Calories
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results calorie-calculator-results">
        <div className="calorie-results-heading">
          <h2>Your Daily Calories</h2>
          <div className="tdee-unit-toggle" aria-label="Result units">
            {(["kcal", "kJ"] as const).map((value) => (
              <button aria-pressed={resultUnit === value} className={resultUnit === value ? "selected" : ""} key={value} onClick={() => setResultUnit(value)} type="button">{value}</button>
            ))}
          </div>
        </div>
        <p className="bmr-result-label">Your {GOAL_OPTIONS.find((option) => option.value === goal)?.label} Target</p>
        <div className="tdee-calorie-total">
          <strong>{result ? display(result.targetCalories).replace(` ${resultUnit}/day`, "") : "—"}</strong>
          <span>{resultUnit} per day</span>
        </div>
        <div className="calorie-result-breakdown">
          <div><span>Estimated BMR</span><strong>{result ? display(result.bmr) : "—"}</strong></div>
          <div><span>Maintenance Calories</span><strong>{result ? display(result.maintenanceCalories) : "—"}</strong></div>
        </div>
        {result && <p className="protein-target-method">Estimated with {result.formulaUsed}, your activity level, and the selected goal adjustment.</p>}
        {!result && <p className="protein-target-method">Enter your details to estimate BMR, maintenance, and a practical daily calorie target.</p>}
      </div>
    </section>
  );
}
