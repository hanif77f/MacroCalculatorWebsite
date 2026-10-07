"use client";

import { useState } from "react";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateCalories, type CalorieGoal, type CalorieResult } from "@/lib/calculators/calorie-calculator";
import type { BmrInput, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type ActivityLevel = MacroInput["activity"];
type Formula = "mifflin" | "harris" | "katch";
type UnitSystem = "metric" | "imperial";
type ResultUnit = "kcal" | "kJ";

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  veryActive: "Very Active",
  extremelyActive: "Extra Active",
};

const activityDescriptions: Record<ActivityLevel, string> = {
  sedentary: "Little planned exercise and mostly sitting during the day.",
  light: "Light exercise or activity several days per week.",
  moderate: "Moderate exercise or an active routine most days.",
  veryActive: "Hard training most days or a physically demanding routine.",
  extremelyActive: "Very hard training and/or highly physical work.",
};

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
};

const goalOptions: { value: CalorieGoal; label: string }[] = [
  { value: "maintain", label: "Maintain Weight" },
  { value: "mildLose", label: "Mild Weight Loss (−250 kcal)" },
  { value: "lose", label: "Weight Loss (−500 kcal)" },
  { value: "mildGain", label: "Mild Weight Gain (+250 kcal)" },
  { value: "gain", label: "Weight Gain (+500 kcal)" },
];

export default function CalorieCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
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
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? parsed / 2.20462 : parsed) : ""));
  };
  const updateHeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setHeightCm(value ? String(unitSystem === "imperial" ? parsed * 2.54 : parsed) : ""));
  };
  const display = (value: number) =>
    `${Math.round(resultUnit === "kJ" ? value * 4.184 : value).toLocaleString()} ${resultUnit}/day`;

  return (
    <section className="calculator-panel tdee-calculator-panel calorie-calculator-panel" aria-label="Calorie calculator">
      <div className="calculator-form tdee-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div className="tdee-unit-toggle" aria-label="Measurement units">
            {(["metric", "imperial"] as const).map((unit) => (
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
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round(Number(weightKg) * (unitSystem === "imperial" ? 2.20462 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            <div className="input-unit"><input aria-label={`Height in ${unitSystem === "metric" ? "cm" : "in"}`} min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * (unitSystem === "imperial" ? 1 / 2.54 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "cm" : "in"}</i></div>
          </label>
        </div>

        <label className="field">
          <span>Activity Level</span>
          <select onChange={(event) => updateInput(() => setActivity(event.target.value as ActivityLevel | ""))} value={activity}>
            <option value="">Select your usual activity</option>
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => <option key={level} value={level}>{activityLabels[level]}</option>)}
          </select>
        </label>
        {activity && <p className="tdee-activity-description">{activityDescriptions[activity]}</p>}

        <label className="field">
          <span>Goal</span>
          <select onChange={(event) => updateInput(() => setGoal(event.target.value as CalorieGoal))} value={goal}>
            {goalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

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
        <p className="bmr-result-label">Your {goalOptions.find((option) => option.value === goal)?.label} Target</p>
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
