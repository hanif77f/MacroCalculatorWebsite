"use client";

import { useState } from "react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { calculateTdee } from "@/lib/calculators/tdee-calculator";
import type { MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import { ACTIVITY_OPTIONS } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, feetAndInchesToCentimeters, inchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";

type ActivityLevel = MacroInput["activity"];
type Formula = MacroInput["formula"];
type TdeeInput = Omit<MacroInput, "goal">;

export default function TdeeCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<TdeeInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | "">("");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateTdee> | null>(null);
  const [validationMessage, setValidationMessage] = useState("");

  const needsBodyFat = formula === "katch" || formula === "cunningham";

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setValidationMessage("");
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
    if (message || !activity) return;
    setResult(calculateTdee({
      age: Number(age),
      sex,
      activity,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      formula,
      ...(needsBodyFat ? { bodyFatPct: Number(bodyFatPct) } : {}),
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

  return (
    <section className="calculator-panel tdee-calculator-panel" aria-label="TDEE calculator">
      <div className="calculator-form tdee-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div className="tdee-unit-toggle" aria-label="Unit system">
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
            <div className="input-unit"><input max="100" min="18" onChange={(event) => updateInput(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
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

        <label className="field">
          <span>Activity Level</span>
          <select onChange={(event) => updateInput(() => setActivity(event.target.value as ActivityLevel | ""))} value={activity}>
            <option value="">Select activity level</option>
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
              <option key={level} value={level}>{ACTIVITY_OPTIONS.find((option) => option.value === level)?.label}</option>
            ))}
          </select>
        </label>
        {activity && <p className="tdee-activity-description">{ACTIVITY_LEVELS[activity].hint}</p>}

        <details className="tdee-formula-options">
          <summary>Advanced Settings</summary>
          <label className="field">
            <span>BMR formula</span>
            <select onChange={(event) => updateInput(() => setFormula(event.target.value as Formula))} value={formula}>
              <option value="mifflin">Mifflin-St Jeor</option>
              <option value="harris">Harris-Benedict</option>
              <option value="katch">Katch-McArdle (requires body fat %)</option>
              <option value="cunningham">Cunningham (requires body fat %)</option>
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
          Calculate TDEE
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results">
        <h2>TDEE Breakdown</h2>
        <div className="tdee-calorie-total">
          <strong>{result ? result.tdee.toLocaleString() : "—"}</strong>
          <span>calories per day</span>
        </div>
        <div className="tdee-result-metrics">
          <div className="tdee-result-metric">
            <div className="tdee-stat-ring"><strong>{result ? result.bmr.toLocaleString() : "—"}</strong></div>
            <span>BMR</span>
          </div>
          <div className="tdee-result-metric">
            <div className="tdee-stat-ring"><strong>{activity ? ACTIVITY_MULTIPLIERS[activity] : "—"}</strong></div>
            <span>Activity multiplier</span>
          </div>
          <div className="tdee-result-metric">
            <div className="tdee-stat-ring"><strong>{result ? (result.tdee - result.bmr).toLocaleString() : "—"}</strong></div>
            <span>Activity calories</span>
          </div>
        </div>
        <div className="tdee-results-note">
          <p>{result ? "Your estimated daily energy expenditure based on the details and activity level you selected." : "Complete the form to see your estimated TDEE and daily energy breakdown."}</p>
          {result && <p>BMR estimated with {result.formulaUsed}.</p>}
        </div>
      </div>
    </section>
  );
}
