"use client";

import { useState } from "react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS, CALCULATOR_INPUT_LIMITS } from "@/lib/constants";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, type StandardGoal } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, feetAndInchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";
import { calculateFatIntake, type FatIntakeResult } from "@/lib/calculators/fat-intake-calculator";
import type { BmrInput, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import { formatNutrientAmount, type NutrientDisplayUnit } from "@/lib/nutrient-display";

type ActivityLevel = MacroInput["activity"];
type Formula = BmrInput["formula"];

const formulaLabels: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};

export default function FatIntakeCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [age, setAge] = useState("25");
  const [sex, setSex] = useState<BmrInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState(String(poundsToKilograms(160)));
  const [heightCm, setHeightCm] = useState("177.8");
  const [activity, setActivity] = useState<ActivityLevel>("moderately-active");
  const [goal, setGoal] = useState<StandardGoal>("maintain");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [displayUnit, setDisplayUnit] = useState<NutrientDisplayUnit>("grams");
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
    updateInput(() => setWeightKg(value ? String(unitSystem === "imperial" ? poundsToKilograms(parsed) : parsed) : ""));
  };
  const updateHeight = (value: string) => {
    updateInput(() => setHeightCm(value));
  };
  const updateImperialHeight = (feet: string, inches: string) => {
    const totalCm = feetAndInchesToCentimeters(Number(feet) || 0, Number(inches) || 0);
    updateInput(() => setHeightCm(totalCm ? String(totalCm) : ""));
  };
  const { feet: heightFeet, inches: remainingHeightInches } = centimetersToFeetAndInches(Number(heightCm));
  const displayed = (grams: number) => formatNutrientAmount(grams, displayUnit);

  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–80)", valid: Number.isInteger(Number(age)) && Number(age) >= CALCULATOR_INPUT_LIMITS.ageYears.min && Number(age) <= CALCULATOR_INPUT_LIMITS.ageYears.max },
      { label: "Weight", valid: Number(weightKg) >= CALCULATOR_INPUT_LIMITS.weightKg.min && Number(weightKg) <= CALCULATOR_INPUT_LIMITS.weightKg.max },
      { label: "Height", valid: Number(heightCm) >= CALCULATOR_INPUT_LIMITS.heightCm.min && Number(heightCm) <= CALCULATOR_INPUT_LIMITS.heightCm.max },
      { label: "Activity Level", valid: Boolean(activity) },
      { label: "Goal", valid: Boolean(goal) },
      ...(!needsBodyFat ? [] : [{ label: "Body fat percentage (3–70%)", valid: Number(bodyFatPct) >= 3 && Number(bodyFatPct) <= 70 }]),
    ]);
    setValidationMessage(message);
    if (message || !activity || !goal) return;
    setResult(calculateFatIntake({
      age: Number(age),
      sex,
      activity,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      formula,
      goal,
      ...(needsBodyFat ? { bodyFatPct: Number(bodyFatPct) } : {}),
    }));
  };

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel fat-intake-calculator-panel" aria-label="Fat intake calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
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
            <div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} min="1" onChange={(event) => updateWeight(event.target.value)} type="number" value={weightKg ? String(Math.round((unitSystem === "imperial" ? kilogramsToPounds(Number(weightKg)) : Number(weightKg)) * 10) / 10) : ""} /><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            {unitSystem === "metric" ? (
              <div className="input-unit"><input aria-label="Height in centimeters" min="1" onChange={(event) => updateHeight(event.target.value)} type="number" value={heightCm ? String(Math.round(Number(heightCm) * 10) / 10) : ""} /><i>cm</i></div>
            ) : (
              <div className="input-unit height-feet">
                <input aria-label="Height in feet" min="1" onChange={(event) => updateImperialHeight(event.target.value, String(remainingHeightInches))} type="number" value={heightCm ? String(heightFeet) : ""} /><i>ft</i>
                <input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => updateImperialHeight(String(heightFeet), event.target.value)} step="0.1" type="number" value={heightCm ? String(Math.round(remainingHeightInches * 10) / 10) : ""} /><i>in</i>
              </div>
            )}
          </label>
        </div>

        <div className="calculator-selection-row">
          <label className="field">
            <span>Activity Level</span>
            <select onChange={(event) => updateInput(() => setActivity(event.target.value as ActivityLevel))} value={activity}>
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => (
                <option key={level} value={level}>{ACTIVITY_OPTIONS.find((option) => option.value === level)?.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Goal</span>
            <select onChange={(event) => updateInput(() => setGoal(event.target.value as StandardGoal))} value={goal}>
              {GOAL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        {activity && <p className="tdee-activity-description">{ACTIVITY_LEVELS[activity].hint}</p>}

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
              <div className="input-unit"><input max="70" min="3" onChange={(event) => updateInput(() => setBodyFatPct(event.target.value))} type="number" value={bodyFatPct} /><i>%</i></div>
            </label>
          )}
        </details>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Fat Intake
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results fat-intake-results nutrient-results">
        <div className="nutrient-results-header">
          <h2>Recommended Daily Fat Intake</h2>
          <div className="macro-unit-toggle" role="group" aria-label="Fat display units">
            <span>Units:</span>
            {(["grams", "ounces"] as const).map((unit) => (
              <button aria-pressed={displayUnit === unit} className={displayUnit === unit ? "active" : ""} key={unit} onClick={() => setDisplayUnit(unit)} type="button">
                {unit === "grams" ? "Grams" : "Ounces"}
              </button>
            ))}
          </div>
        </div>
        <p className="bmr-result-label">20–35% of your goal-adjusted calorie estimate</p>
        <div className="tdee-calorie-total bmr-calorie-total fat-intake-calorie-total">
          <strong>{result ? `${displayed(result.minimumGrams)}–${displayed(result.maximumGrams)}` : "—"}</strong>
          <span>{displayUnit === "grams" ? "g/day" : "oz/day"}</span>
        </div>
        {result && (
          <>
            <p className="protein-target-range">Arithmetic midpoint: {displayed(result.midpointGrams)} {displayUnit === "grams" ? "g/day" : "oz/day"}</p>
            <p className="protein-target-method">{result.calories.toLocaleString()} kcal/day for {GOAL_OPTIONS.find(({ value }) => value === result.goal)?.label.toLowerCase()} · {result.formulaUsed} · {ACTIVITY_LEVELS[activity].multiplier} activity multiplier</p>
          </>
        )}

        <div className="fat-intake-goal-section">
          {/* <h3>Daily Fat Range by Goal</h3> */}
          <div className="fat-intake-table-scroll">
            <table>
              <thead>
                <tr><th scope="col">Goal</th><th scope="col">Daily fat range</th></tr>
              </thead>
              <tbody>
                {GOAL_OPTIONS.map(({ value, label }) => {
                  const row = result?.goals.find((item) => item.goal === value);
                  return (
                    <tr aria-current={value === goal ? "true" : undefined} className={value === goal ? "nutrient-selected-row" : undefined} key={value}>
                      <th scope="row">{label}</th>
                      <td>{row ? `${displayed(row.minimumGrams)}–${displayed(row.maximumGrams)} ${displayUnit === "grams" ? "g" : "oz"}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fat-intake-saturated">
          <h3>Saturated Fat Guidance</h3>
          <p>{result
            ? `WHO advises limiting saturated fat to no more than 10% of total energy. At your selected goal-adjusted estimate, 10% is about ${displayed(result.saturatedFatAtTenPercent)} ${displayUnit === "grams" ? "g" : "oz"}/day. This is general guidance, not an individualized medical target.`
            : "Calculate to see the 10%-of-energy saturated-fat guidance in your selected display unit."}</p>
        </div>

        <details className="nutrient-details">
          <summary>How this is calculated</summary>
          <p>The existing BMR method and activity multiplier produce a maintenance estimate; the selected goal&apos;s configured calorie adjustment is then applied. Minimum fat = goal-adjusted calories × 20% ÷ 9 kcal/g. Maximum fat = goal-adjusted calories × 35% ÷ 9 kcal/g. The displayed midpoint is the arithmetic midpoint of these endpoints.</p>
          <p>The National Academies&apos; adult fat AMDR is 20–35% of energy. WHO recommends limiting saturated fat to no more than 10% of total energy. These are general references, not medical advice.</p>
          <p><a href="https://www.nationalacademies.org/projects/HMD-FNB-18-P-119/publication/10490" rel="noreferrer" target="_blank">National Academies: Dietary Reference Intakes for fat and other macronutrients</a> · <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" rel="noreferrer" target="_blank">WHO: Healthy diet</a></p>
        </details>
      </div>
    </section>
  );
}
