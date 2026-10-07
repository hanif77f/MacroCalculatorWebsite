"use client";

import { useState } from "react";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateFatIntake, type FatIntakeResult } from "@/lib/calculators/fat-intake-calculator";
import type { BmrInput, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type ActivityLevel = MacroInput["activity"];
type Formula = BmrInput["formula"];
type UnitSystem = "metric" | "imperial";

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Active",
  veryActive: "Very Active",
  extremelyActive: "Extremely Active",
};

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};

const goalLabels = [
  "Maintenance",
  "Lose 0.5 kg/week",
  "Lose 1 kg/week",
  "Gain 0.5 kg/week",
  "Gain 1 kg/week",
];

export default function FatIntakeCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [age, setAge] = useState("25");
  const [sex, setSex] = useState<BmrInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState(String(160 / 2.20462));
  const [heightCm, setHeightCm] = useState("177.8");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [percentage, setPercentage] = useState(30);
  const [result, setResult] = useState<FatIntakeResult | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const needsBodyFat = formula === "katch" || formula === "cunningham";
  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
  };
  const updateWeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? parsed / 2.20462 : parsed) : ""));
  };
  const updateMetricHeight = (value: string) => {
    updateInput(() => setHeightCm(value));
  };
  const updateImperialHeight = (feet: string, inches: string) => {
    const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
    updateInput(() => setHeightCm(totalInches ? String(totalInches * 2.54) : ""));
  };
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–100)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100 },
      { label: "Weight", valid: Number(weightKg) > 0 },
      { label: "Height", valid: Number(heightCm) > 0 },
      { label: "Activity Level", valid: Boolean(activity) },
      ...(!needsBodyFat ? [] : [{ label: "Body fat percentage (3–70%)", valid: Number(bodyFatPct) >= 3 && Number(bodyFatPct) <= 70 }]),
    ]);
    setValidationMessage(message);
    if (message) return;
    setResult(calculateFatIntake({
      age: Number(age),
      sex,
      activity,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      formula,
      percentage,
      ...(needsBodyFat ? { bodyFatPct: Number(bodyFatPct) } : {}),
    }));
  };
  const imperialHeightInches = Number(heightCm) / 2.54;
  const heightFeet = Math.floor(imperialHeightInches / 12);
  const remainingHeightInches = Math.round(imperialHeightInches - heightFeet * 12);

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel fat-intake-calculator-panel" aria-label="Fat intake calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
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

        <div className="fat-intake-field-grid">
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
          <label className="field">
            <span>Age</span>
            <div className="input-unit">
              <input max="100" min="18" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} />
              <i>years</i>
            </div>
          </label>
        </div>

        <div className="fat-intake-field-grid">
          <label className="field">
            <span>Height</span>
            {unitSystem === "metric" ? (
              <div className="input-unit">
                <input aria-label="Height in centimeters" min="1" onChange={(event) => updateMetricHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * 10) / 10) : ""} />
                <i>cm</i>
              </div>
            ) : (
              <div className="fat-intake-height-inputs">
                <div className="input-unit">
                  <input aria-label="Height in feet" min="1" onChange={(event) => updateImperialHeight(event.target.value, String(remainingHeightInches))} type="number" value={heightCm ? String(heightFeet) : ""} />
                  <i>ft</i>
                </div>
                <div className="input-unit">
                  <input aria-label="Height in inches" max="11" min="0" onChange={(event) => updateImperialHeight(String(heightFeet), event.target.value)} type="number" value={heightCm ? String(remainingHeightInches) : ""} />
                  <i>in</i>
                </div>
              </div>
            )}
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit">
              <input
                aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`}
                min="1"
                onChange={(event) => updateWeight(event.target.value)}
                type="number"
                value={weightKg ? String(Math.round(Number(weightKg) * (unitSystem === "imperial" ? 2.20462 : 1) * 10) / 10) : ""}
              />
              <i>{unitSystem === "metric" ? "kg" : "lb"}</i>
            </div>
          </label>
        </div>

        <label className="field">
          <span>Activity Level</span>
          <select onChange={(event) => updateInput(() => setActivity(event.target.value as ActivityLevel))} value={activity}>
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
              <option key={level} value={level}>{activityLabels[level]}</option>
            ))}
          </select>
        </label>

        <details className="tdee-formula-options">
          <summary>Advanced Settings</summary>
          <label className="field">
            <span>BMR Formula</span>
            <select onChange={(event) => updateInput(() => setFormula(event.target.value as Formula))} value={formula}>
              {(Object.entries(formulaLabels) as [Formula, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}{value === "katch" || value === "cunningham" ? " (requires body fat %)" : ""}</option>
              ))}
            </select>
          </label>
          {needsBodyFat && (
            <label className="field">
              <span>Body fat percentage (3–70%)</span>
              <div className="input-unit">
                <input max="70" min="3" onChange={(event) => updateInput(() => setBodyFatPct(event.target.value))} type="number" value={bodyFatPct} />
                <i>%</i>
              </div>
            </label>
          )}
        </details>

        <label className="field fat-intake-calorie-share">
          <span>Your Selected Fat Target: {percentage}%</span>
          <input
            aria-label="Percentage of calories from fat"
            max="35"
            min="20"
            onChange={(event) => {
              setPercentage(Number(event.target.value));
              setResult(null);
            }}
            step="1"
            type="range"
            value={percentage}
          />
          <span className="protein-context-note">Choose a target within the general adult 20–35% range.</span>
        </label>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Fat Intake
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results fat-intake-results">
        <h2>Your Daily Fat Target</h2>
        <p className="bmr-result-label">Estimated Daily Calories</p>
        <div className="tdee-calorie-total bmr-calorie-total fat-intake-calorie-total">
          <strong>{result ? result.calories.toLocaleString() : "—"}</strong>
          <span>kcal/day</span>
        </div>
        <div className="fat-intake-result-highlight">
          <div>
            <span>Daily Fat Allowance</span>
            <strong>{result ? `${result.minimumGrams}–${result.maximumGrams} g/day` : "—"}</strong>
            <small>20–35% of calories</small>
          </div>
          <div>
            <span>Your Selected Fat Target</span>
            <strong>{result ? `${result.percentage}%` : `${percentage}%`}</strong>
            <small>{result ? `${result.grams} g/day` : "grams per day"}</small>
          </div>
        </div>
        {result && <p className="protein-target-method">Calculated with {result.formulaUsed} and your selected activity level.</p>}

        <div className="fat-intake-goal-section">
          <h3>Fat Intake by Goal</h3>
          <div className="fat-intake-table-scroll">
            <table>
              <thead>
                <tr><th>Goal</th><th>Calories</th><th>Fat range</th></tr>
              </thead>
              <tbody>
                {(result?.goals ?? goalLabels.map((label) => ({ label, calories: 0, minimumGrams: 0, maximumGrams: 0 }))).map((goal) => (
                  <tr key={goal.label}>
                    <th scope="row">{goal.label}</th>
                    <td>{goal.calories ? `${goal.calories.toLocaleString()} kcal` : "—"}</td>
                    <td>{goal.calories ? `${goal.minimumGrams}–${goal.maximumGrams} g` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fat-intake-saturated">
          <h3>Saturated Fat Limits</h3>
          <p>
            {result
              ? `<${result.saturatedFatAtTenPercent} g at 10% of calories · <${result.saturatedFatAtSevenPercent} g at 7% of calories`
              : "Calculated as calorie-based reference values when you calculate your target."}
          </p>
        </div>
      </div>
    </section>
  );
}
