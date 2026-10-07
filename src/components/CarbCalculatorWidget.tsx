"use client";

import { useState } from "react";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateCarbs, type CarbInput } from "@/lib/calculators/carb-calculator";
import type { MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type Activity = MacroInput["activity"];
type Goal = "lose" | "build" | "maintain";
type UnitSystem = "metric" | "imperial";

const activityLabels: Record<Activity, string> = {
  sedentary: "Sedentary",
  light: "Lightly Active",
  moderate: "Moderately Active",
  veryActive: "Very Active",
  extremelyActive: "Extremely Active",
};

const goalLabels: Record<Goal, string> = {
  lose: "Weight loss",
  build: "Muscle gain",
  maintain: "Maintenance",
};

export default function CarbCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<CarbInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<Activity | "">("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [result, setResult] = useState<ReturnType<typeof calculateCarbs> | null>(null);
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
      { label: "Age (18–80)", valid: Number(age) >= 18 && Number(age) <= 80 },
      { label: "Weight", valid: Number(weightKg) > 0 },
      { label: "Height", valid: Number(heightCm) > 0 },
      { label: "Activity Level", valid: Boolean(activity) },
      { label: "Goal", valid: Boolean(goal) },
    ]);
    setValidationMessage(message);
    if (message || !activity || !goal) return;
    setResult(calculateCarbs({
      age: Number(age),
      sex,
      activity,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      goal,
      formula: "mifflin",
    }));
  };

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel" aria-label="Carb calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <div>
            <h2>Your Details</h2>
            <p className="bmr-form-helper">Enter your details to estimate your daily carbohydrate target.</p>
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
              <button aria-pressed={sex === value} className={sex === value ? "selected" : ""} key={value} onClick={() => updateInput(() => setSex(value))} type="button">
                {value === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </label>

        <div className="tdee-field-grid">
          <label className="field">
            <span>Age (18–80)</span>
            <div className="input-unit"><input max="80" min="18" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
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
          <select onChange={(event) => updateInput(() => setActivity(event.target.value as Activity | ""))} value={activity}>
            <option value="">Select your usual activity</option>
            {(Object.keys(ACTIVITY_MULTIPLIERS) as Activity[]).map((level) => (
              <option key={level} value={level}>{activityLabels[level]}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Goal</span>
          <select onChange={(event) => updateInput(() => setGoal(event.target.value as Goal | ""))} value={goal}>
            <option value="">Select your goal</option>
            {(Object.keys(goalLabels) as Goal[]).map((value) => (
              <option key={value} value={value}>{goalLabels[value]}</option>
            ))}
          </select>
        </label>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Carbs
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results">
        <h2>Your Carb Target</h2>
        <p className="bmr-result-label">Estimated daily carbohydrate target</p>
        <div className="tdee-calorie-total bmr-calorie-total protein-target-total">
          <strong>{result ? result.grams.toLocaleString() : "—"}</strong>
          <span>grams per day</span>
        </div>
        <p className="protein-target-range">
          {result
            ? `${result.percentage}% of ${result.totalCalories.toLocaleString()} estimated calories`
            : "Estimated daily carbohydrate target based on the information you entered."}
        </p>
        {result && <p className="protein-target-method">{result.calories.toLocaleString()} calories from carbohydrate at 4 kcal per gram.</p>}
      </div>
    </section>
  );
}
