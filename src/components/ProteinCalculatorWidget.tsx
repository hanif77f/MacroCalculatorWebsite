"use client";

import { useState } from "react";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateProtein, type ProteinActivity, type ProteinGoal, type ProteinResult } from "@/lib/calculators/protein-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type UnitSystem = "metric" | "imperial";

const activityLabels: Record<ProteinActivity, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  veryActive: "Very Active",
  extremelyActive: "Extremely Active",
};

const goalLabels: Record<ProteinGoal, string> = {
  maintain: "General / maintain",
  lose: "Weight loss",
  build: "Muscle gain",
};

export default function ProteinCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<ProteinActivity | "">("");
  const [goal, setGoal] = useState<ProteinGoal | "">("");
  const [result, setResult] = useState<ProteinResult | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
  };
  const updateWeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? parsed / 2.20462 : parsed) : ""));
  };
  const updateHeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setHeightCm(value ? String(unitSystem === "imperial" ? parsed * 2.54 : parsed) : ""));
  };
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Weight", valid: Number(weightKg) >= 1 },
      { label: "Activity Level", valid: Boolean(activity) },
      { label: "Goal", valid: Boolean(goal) },
    ]);
    setValidationMessage(message);
    if (message || !activity || !goal) return;
    setResult(calculateProtein({ weightKg: Number(weightKg), activity, goal }));
  };
  const displayed = (grams: number) => Math.round(grams).toLocaleString();

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel" aria-label="Protein calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <div>
            <h2>Your Details</h2>
            <p className="bmr-form-helper">Enter your information to estimate a daily protein target.</p>
          </div>
          <div className="tdee-unit-toggle" aria-label="Weight and height unit system">
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
          <span>Sex <small>(optional)</small></span>
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
            <span>Age <small>(optional)</small></span>
            <div className="input-unit"><input min="1" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round(Number(weightKg) * (unitSystem === "imperial" ? 2.20462 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height <small>(optional)</small></span>
            <div className="input-unit"><input aria-label={`Height in ${unitSystem === "metric" ? "cm" : "in"}`} min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * (unitSystem === "imperial" ? 1 / 2.54 : 1) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "cm" : "in"}</i></div>
          </label>
        </div>

        <label className="field">
          <span>Activity Level</span>
          <select onChange={(event) => updateInput(() => setActivity(event.target.value as ProteinActivity | ""))} value={activity}>
            <option value="">Select your usual activity</option>
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ProteinActivity[]).map((level) => (
              <option key={level} value={level}>{activityLabels[level]}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Goal</span>
          <select onChange={(event) => updateInput(() => setGoal(event.target.value as ProteinGoal | ""))} value={goal}>
            <option value="">Select your goal</option>
            {(Object.keys(goalLabels) as ProteinGoal[]).map((value) => (
              <option key={value} value={value}>{goalLabels[value]}</option>
            ))}
          </select>
        </label>

        <p className="protein-context-note">Age, sex, and height are optional context. This estimate uses weight, activity, and goal.</p>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Protein
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results">
        <h2>Your Protein Target</h2>
        <p className="bmr-result-label">Estimated daily target</p>
        <div className="tdee-calorie-total bmr-calorie-total protein-target-total">
          <strong>{result ? displayed(result.target) : "—"}</strong>
          <span>grams per day</span>
        </div>
        <p className="protein-target-range">
          {result
            ? `Estimated range: ${displayed(result.minimum)}–${displayed(result.maximum)} g/day`
            : "Estimated daily protein range or target based on the information you entered."}
        </p>
        {result && <p className="protein-target-method">{result.targetPerKg.toFixed(1)} g/kg/day midpoint of the {result.minimumPerKg.toFixed(1)}–{result.maximumPerKg.toFixed(1)} g/kg/day reference range.</p>}
      </div>
    </section>
  );
}
