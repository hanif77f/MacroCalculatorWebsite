"use client";

import { useState } from "react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS } from "@/lib/constants";
import { ACTIVITY_OPTIONS } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, inchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";
import { calculateCalorieDeficit, type CalorieDeficitResult } from "@/lib/calculators/calorie-deficit-calculator";
import type { BmrInput, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

type ActivityLevel = MacroInput["activity"];
type Formula = MacroInput["formula"];
type DeficitAmount = 250 | 500 | 750 | 1000;

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};

const deficitOptions: { value: DeficitAmount; label: string }[] = [
  { value: 250, label: "250 kcal/day — mild" },
  { value: 500, label: "500 kcal/day — moderate" },
  { value: 750, label: "750 kcal/day — aggressive" },
  { value: 1000, label: "1,000 kcal/day — very aggressive" },
];

export default function CalorieDeficitCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<BmrInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<ActivityLevel | "">("");
  const [deficit, setDeficit] = useState<DeficitAmount>(500);
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [result, setResult] = useState<CalorieDeficitResult | null>(null);
  const [estimatedDate, setEstimatedDate] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const needsBodyFat = formula === "katch" || formula === "cunningham";

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setEstimatedDate(null);
    setError("");
    setValidationMessage("");
  };

  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–100)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100 },
      { label: "Current Weight", valid: Number.isFinite(Number(weightKg)) && Number(weightKg) > 0 },
      { label: "Height", valid: Number.isFinite(Number(heightCm)) && Number(heightCm) > 0 },
      { label: "Activity Level", valid: Boolean(activity) },
      ...(targetWeightKg ? [{ label: "Goal Weight (must be below current weight)", valid: Number(targetWeightKg) > 0 && Number(targetWeightKg) < Number(weightKg) }] : []),
      ...(!needsBodyFat ? [] : [{ label: "Body Fat Percentage (3–70%)", valid: Number(bodyFatPct) >= 3 && Number(bodyFatPct) <= 70 }]),
    ]);
    setValidationMessage(message);
    if (message || !activity) return;
    try {
      const calculatedResult = calculateCalorieDeficit({
        age: Number(age),
        sex,
        activity,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        formula,
        deficitKcal: deficit,
        ...(needsBodyFat ? { bodyFatPct: Number(bodyFatPct) } : {}),
        ...(targetWeightKg ? { targetWeightKg: Number(targetWeightKg) } : {}),
      });
      setResult(calculatedResult);
      if (calculatedResult.estimatedTimeWeeks !== undefined) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Math.round(calculatedResult.estimatedTimeWeeks * 7));
        setEstimatedDate(targetDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
      } else {
        setEstimatedDate(null);
      }
      setError("");
    } catch (calculationError) {
      setResult(null);
      setEstimatedDate(null);
      setError(calculationError instanceof Error ? calculationError.message : "Unable to calculate the calorie deficit.");
    }
  };

  const updateWeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? poundsToKilograms(parsed) : parsed) : ""));
  };
  const updateHeight = (value: string) => {
    const parsed = Number(value);
    updateInput(() => setHeightCm(value ? String(unitSystem === "imperial" ? inchesToCentimeters(parsed) : parsed) : ""));
  };
  const toDisplayWeight = (value: string) => value
    ? String(Math.round((unitSystem === "imperial" ? kilogramsToPounds(Number(value)) : Number(value)) * 10) / 10)
    : "";
  const imperialHeight = centimetersToFeetAndInches(Number(heightCm));
  const weeklyRate = (kg: number) => unitSystem === "imperial"
    ? `${kilogramsToPounds(kg).toFixed(1)} lb/week`
    : `${kg.toFixed(1)} kg/week`;
  const formatDuration = (weeks: number) => {
    if (weeks < 1) return "Less than 1 week";
    const roundedWeeks = Math.round(weeks);
    const years = Math.floor(roundedWeeks / 52);
    const remainingWeeks = roundedWeeks % 52;
    if (years === 0) return `~${roundedWeeks} ${roundedWeeks === 1 ? "week" : "weeks"}`;
    if (remainingWeeks === 0) return `~${years} ${years === 1 ? "year" : "years"}`;
    return `~${years} ${years === 1 ? "year" : "years"}, ${remainingWeeks} ${remainingWeeks === 1 ? "week" : "weeks"}`;
  };
  const targetWeightLoss = result?.estimatedWeightToLoseKg === undefined
    ? null
    : unitSystem === "imperial"
      ? `${kilogramsToPounds(result.estimatedWeightToLoseKg).toFixed(1)} lb`
      : `${result.estimatedWeightToLoseKg.toFixed(1)} kg`;

  return (
    <section aria-label="Calorie deficit calculator" className="calculator-panel tdee-calculator-panel calorie-deficit-calculator-panel">
      <div className="calculator-form tdee-calculator-form calorie-deficit-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div aria-label="Measurement units" className="tdee-unit-toggle">
            {(["imperial", "metric"] as const).map((unit) => (
              <button aria-pressed={unitSystem === unit} className={unitSystem === unit ? "selected" : ""} key={unit} onClick={() => { setUnitSystem(unit); setResult(null); setEstimatedDate(null); setError(""); setValidationMessage(""); }} type="button">
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
            <div className="input-unit"><input aria-label={`Current weight in ${unitSystem === "imperial" ? "lb" : "kg"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={toDisplayWeight(weightKg)} /><i>{unitSystem === "imperial" ? "lb" : "kg"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            {unitSystem === "metric" ? (
              <div className="input-unit"><input aria-label="Height in cm" min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * 10) / 10) : ""} /><i>cm</i></div>
            ) : (
              <div className="input-unit height-feet">
                <input aria-label="Height in feet" min="0" onChange={(event) => {
                  const totalInches = Number(event.target.value) * 12 + imperialHeight.inches;
                  updateHeight(totalInches ? String(totalInches) : "");
                }} type="number" value={heightCm ? String(imperialHeight.feet) : ""} /><i>ft</i>
                <input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => {
                  const feet = heightCm ? imperialHeight.feet : 0;
                  updateHeight(String(feet * 12 + Number(event.target.value)));
                }} type="number" value={heightCm ? String(Math.round(imperialHeight.inches * 10) / 10) : ""} /><i>in</i>
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
            <span>Daily Calorie Deficit</span>
            <select onChange={(event) => updateInput(() => setDeficit(Number(event.target.value) as DeficitAmount))} value={deficit}>
              {deficitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <details className="calorie-deficit-goal-options">
          <summary>Optional Weight Goal</summary>
          <p>Enter a goal weight to estimate the time and date from your selected deficit. This is rough arithmetic, not a forecast.</p>
          <label className="field">
            <span>Goal Weight</span>
            <div className="input-unit"><input aria-label={`Goal weight in ${unitSystem === "imperial" ? "lb" : "kg"}`} min="1" onChange={(event) => {
              const value = event.target.value;
              const parsed = Number(value);
              updateInput(() => setTargetWeightKg(value ? String(unitSystem === "imperial" ? poundsToKilograms(parsed) : parsed) : ""));
            }} type="number" value={toDisplayWeight(targetWeightKg)} /><i>{unitSystem === "imperial" ? "lb" : "kg"}</i></div>
          </label>
          {result && targetWeightLoss && result.estimatedTimeWeeks !== undefined && estimatedDate && (
            <div aria-live="polite" className="calorie-deficit-goal-estimates">
              <div><span>Estimated Weight to Lose</span><strong>{targetWeightLoss}</strong></div>
              <div><span>Estimated Time</span><strong>{formatDuration(result.estimatedTimeWeeks)}</strong></div>
              <div><span>Estimated Target Date</span><strong>{estimatedDate}</strong></div>
            </div>
          )}
        </details>

        <details className="tdee-formula-options">
          <summary>Advanced Settings</summary>
          <label className="field">
            <span>BMR Formula</span>
            <select onChange={(event) => updateInput(() => setFormula(event.target.value as Formula))} value={formula}>
              {(Object.entries(formulaLabels) as [Formula, string][]).map(([value, label]) => <option key={value} value={value}>{label}{value === "katch" || value === "cunningham" ? " (requires body fat %)" : ""}</option>)}
            </select>
          </label>
          {needsBodyFat && (
            <label className="field">
              <span>Body Fat Percentage (3–70%)</span>
              <div className="input-unit"><input max="70" min="3" onChange={(event) => updateInput(() => setBodyFatPct(event.target.value))} type="number" value={bodyFatPct} /><i>%</i></div>
            </label>
          )}
        </details>

        {error && <p className="calorie-deficit-error" role="alert">{error}</p>}
        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Calorie Deficit
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results calorie-deficit-results">
        <h2>Your Weight-Loss Target</h2>
        <p className="bmr-result-label">Estimated Daily Calorie Target</p>
        <div className="tdee-calorie-total">
          <strong>{result ? result.targetCalories.toLocaleString() : "—"}</strong>
          <span>calories per day</span>
        </div>
        <div className="calorie-deficit-result-breakdown">
          <div><span>Estimated maintenance</span><strong>{result ? `${result.maintenanceCalories.toLocaleString()} kcal/day` : "—"}</strong></div>
          <div><span>Selected deficit</span><strong>{result ? `${result.deficitCalories.toLocaleString()} kcal/day` : "—"}</strong></div>
          <div><span>Rough weekly arithmetic</span><strong>{result ? weeklyRate(result.estimatedWeeklyLossKg) : "—"}</strong></div>
        </div>
        <p className="protein-target-method">
          {result
            ? `Estimated with ${result.formulaUsed} and your activity level. Weekly rate is simple arithmetic, not a weight-loss prediction.`
            : "Enter your details to estimate maintenance calories, your selected deficit, and a starting daily intake target."}
        </p>
      </div>
    </section>
  );
}
