"use client";

import { useState } from "react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS, CALCULATOR_INPUT_LIMITS } from "@/lib/constants";
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, type StandardGoal } from "@/lib/calculator-standardization";
import { centimetersToFeetAndInches, feetAndInchesToCentimeters, inchesToCentimeters, kilogramsToPounds, poundsToKilograms } from "@/lib/calculator-unit-conversions";
import { useCalculatorUnitSystem } from "@/lib/use-calculator-unit-system";
import { calculateCarbs, calculateCarbohydratePortion, CARBOHYDRATE_COMPARISON_PERCENTAGES, CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE, DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE, type CarbInput, type CarbResult } from "@/lib/calculators/carb-calculator";
import type { MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import { formatNutrientAmount, type NutrientDisplayUnit } from "@/lib/nutrient-display";

type Activity = MacroInput["activity"];
type CarbComparisonRow = {
  goal: StandardGoal;
  label: string;
  calories: number;
  gramsByPercentage: Record<number, number>;
};

export default function CarbCalculatorWidget() {
  const [unitSystem, setUnitSystem] = useCalculatorUnitSystem();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<CarbInput["sex"]>("male");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activity, setActivity] = useState<Activity | "">("");
  const [goal, setGoal] = useState<StandardGoal | "">("");
  const [percentage, setPercentage] = useState(DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE);
  const [displayUnit, setDisplayUnit] = useState<NutrientDisplayUnit>("grams");
  const [result, setResult] = useState<CarbResult | null>(null);
  const [comparisonRows, setComparisonRows] = useState<CarbComparisonRow[]>([]);
  const [validationMessage, setValidationMessage] = useState("");

  const updateInput = (update: () => void) => {
    update();
    setResult(null);
    setComparisonRows([]);
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

  const makeInput = (selectedGoal: StandardGoal, selectedActivity: Activity): CarbInput => ({
    age: Number(age),
    sex,
    activity: selectedActivity,
    weightKg: Number(weightKg),
    heightCm: Number(heightCm),
    goal: selectedGoal,
    formula: "mifflin",
    percentage,
  });

  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–80)", valid: Number.isInteger(Number(age)) && Number(age) >= CALCULATOR_INPUT_LIMITS.ageYears.min && Number(age) <= CALCULATOR_INPUT_LIMITS.ageYears.max },
      { label: "Weight", valid: Number(weightKg) >= CALCULATOR_INPUT_LIMITS.weightKg.min && Number(weightKg) <= CALCULATOR_INPUT_LIMITS.weightKg.max },
      { label: "Height", valid: Number(heightCm) >= CALCULATOR_INPUT_LIMITS.heightCm.min && Number(heightCm) <= CALCULATOR_INPUT_LIMITS.heightCm.max },
      { label: "Activity Level", valid: Boolean(activity) },
      { label: "Goal", valid: Boolean(goal) },
    ]);
    setValidationMessage(message);
    if (message || !activity || !goal) return;

    const selectedInput = makeInput(goal, activity);
    setResult(calculateCarbs(selectedInput));
    setComparisonRows(GOAL_OPTIONS.map(({ value, label }) => {
      const comparisonGoal = value as StandardGoal;
      const calories = calculateCarbs({ ...selectedInput, goal: comparisonGoal }).totalCalories;
      return {
        goal: comparisonGoal,
        label,
        calories,
        gramsByPercentage: Object.fromEntries(
          CARBOHYDRATE_COMPARISON_PERCENTAGES.map((comparisonPercentage) => [
            comparisonPercentage,
            calculateCarbohydratePortion(calories, comparisonPercentage).grams,
          ]),
        ),
      };
    }));
  };
  const displayed = (grams: number) => formatNutrientAmount(grams, displayUnit);

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel carb-nutrient-calculator-panel" aria-label="Carb calculator">
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
                  setComparisonRows([]);
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
                <input aria-label="Height in feet" min="1" onChange={(event) => updateImperialHeight(event.target.value, String(Math.round(imperialHeight.inches * 10) / 10))} type="number" value={heightCm ? String(imperialHeight.feet) : ""} /><i>ft</i>
                <input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => updateImperialHeight(String(imperialHeight.feet), event.target.value)} step="0.1" type="number" value={heightCm ? String(Math.round(imperialHeight.inches * 10) / 10) : ""} /><i>in</i>
              </div>
            )}
          </label>
        </div>

        <div className="calculator-selection-row">
          <label className="field">
            <span>Activity Level</span>
            <select onChange={(event) => updateInput(() => setActivity(event.target.value as Activity))} value={activity}>
              <option value="">Select activity level</option>
              {(Object.keys(ACTIVITY_MULTIPLIERS) as Activity[]).map((level) => (
                <option key={level} value={level}>{ACTIVITY_OPTIONS.find((option) => option.value === level)?.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Goal</span>
            <select onChange={(event) => updateInput(() => setGoal(event.target.value as StandardGoal | ""))} value={goal}>
              <option value="">Select goal</option>
              {GOAL_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        {activity && <p className="tdee-activity-description">{ACTIVITY_LEVELS[activity].hint}</p>}

        <details className="tdee-formula-options">
          <summary>Advanced Settings</summary>
          <label className="field">
            <span>Carbohydrate share of goal-adjusted calories</span>
            <div className="nutrient-percentage-control">
              <input
                aria-label="Carbohydrate energy percentage"
                max={CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.max}
                min={CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE.min}
                onChange={(event) => {
                  setPercentage(Number(event.target.value));
                  setResult(null);
                  setComparisonRows([]);
                  setValidationMessage("");
                }}
                step="1"
                type="range"
                value={percentage}
              />
              <output>{percentage}%</output>
            </div>
            <small>Default: 50%. The adult AMDR reference range is 45–65% of total energy. The comparison table also shows 40% and 75% scenarios.</small>
          </label>
        </details>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Carbs
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results nutrient-results">
        <div className="nutrient-results-header">
          <h2>Estimated Daily Carbohydrate Intake</h2>
          <div className="macro-unit-toggle" role="group" aria-label="Carbohydrate display units">
            <span>Units:</span>
            {(["grams", "ounces"] as const).map((unit) => (
              <button aria-pressed={displayUnit === unit} className={displayUnit === unit ? "active" : ""} key={unit} onClick={() => setDisplayUnit(unit)} type="button">
                {unit === "grams" ? "Grams" : "Ounces"}
              </button>
            ))}
          </div>
        </div>
        <p className="bmr-result-label">Based on your goal-adjusted calorie estimate</p>
        <div className="tdee-calorie-total bmr-calorie-total protein-target-total">
          <strong>{result ? displayed(result.grams) : "—"}</strong>
          <span>{displayUnit === "grams" ? "g/day" : "oz/day"}</span>
        </div>
        <p className="protein-target-range">
          {result
            ? `${result.percentage}% of ${result.totalCalories.toLocaleString()} kcal/day = ${Math.round(result.calories).toLocaleString()} kcal from carbohydrate.`
            : "Calculate to see your daily carbohydrate estimate."}
        </p>
        <p className="protein-target-method">The default 50% share is a calculator assumption, not a universal optimum.</p>

        <div className="fat-intake-goal-section">
          <h3>Carbohydrate Comparison by Goal</h3>
          <div className="fat-intake-table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Goal</th>
                  <th scope="col">Daily calories</th>
                  {CARBOHYDRATE_COMPARISON_PERCENTAGES.map((value) => <th scope="col" key={value}>{value}%</th>)}
                </tr>
              </thead>
              <tbody>
                {GOAL_OPTIONS.map(({ value, label }) => {
                  const row = comparisonRows.find((item) => item.goal === value);
                  return (
                    <tr aria-current={value === goal ? "true" : undefined} className={value === goal ? "nutrient-selected-row" : undefined} key={value}>
                      <th scope="row">{label}</th>
                      <td>{row ? `${row.calories.toLocaleString()} kcal` : "—"}</td>
                      {CARBOHYDRATE_COMPARISON_PERCENTAGES.map((comparisonPercentage) => (
                        <td key={comparisonPercentage}>{row ? displayed(row.gramsByPercentage[comparisonPercentage]) : "—"}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <details className="nutrient-details">
          <summary>How this is calculated</summary>
          <p>Goal-adjusted calories are calculated using the existing BMR formula, selected activity multiplier, and the selected fixed calorie adjustment. Carbohydrate grams = goal-adjusted calories × the selected percentage ÷ 4 kcal/g. Calories and grams shown are derived from that same percentage.</p>
          <p>The National Academies adult Acceptable Macronutrient Distribution Range (AMDR) for carbohydrate is 45–65% of energy. The 40% and 75% comparison columns are scenarios outside that AMDR, not equally established recommendations.</p>
          <p><a href="https://www.nationalacademies.org/projects/HMD-FNB-18-P-119/publication/10490" rel="noreferrer" target="_blank">National Academies: Dietary Reference Intakes for carbohydrate and other macronutrients</a></p>
        </details>
      </div>
    </section>
  );
}
