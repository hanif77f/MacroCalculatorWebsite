"use client";

import { useState } from "react";
import { calculateBodyFat, type BodyFatResult, type BodyFatSex, type BodyFatUnit } from "@/lib/calculators/body-fat-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

export default function BodyFatCalculatorWidget() {
  const [unit, setUnit] = useState<BodyFatUnit>("imperial");
  const [sex, setSex] = useState<BodyFatSex>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [showBmiComparison, setShowBmiComparison] = useState(false);
  const [result, setResult] = useState<BodyFatResult | null>(null);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const convert = (value: string, factor: number) =>
    value.trim() && Number.isFinite(Number(value)) ? String(Math.round(Number(value) * factor * 10) / 10) : "";
  const update = (callback: () => void) => {
    callback();
    setResult(null);
    setError("");
    setValidationMessage("");
  };
  const changeUnit = (nextUnit: BodyFatUnit) => {
    if (unit === nextUnit) return;
    const currentHeightCm = unit === "imperial"
      ? ((Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)) * 2.54
      : Number(height);
    const conversion = nextUnit === "imperial" ? 1 / 2.54 : 1;
    const nextHeight = currentHeightCm * conversion;
    setUnit(nextUnit);
    setHeight(nextUnit === "metric" ? convert(String(nextHeight), 1) : "");
    if (nextUnit === "imperial") {
      setHeightFeet(nextHeight ? String(Math.floor(nextHeight / 12)) : "");
      setHeightInches(nextHeight ? String(Math.round((nextHeight % 12) * 10) / 10) : "");
      setWeight(convert(weight, 2.20462));
      setNeck(convert(neck, 1 / 2.54));
      setWaist(convert(waist, 1 / 2.54));
      setHip(convert(hip, 1 / 2.54));
    } else {
      setHeightFeet("");
      setHeightInches("");
      setWeight(convert(weight, 1 / 2.20462));
      setNeck(convert(neck, 2.54));
      setWaist(convert(waist, 2.54));
      setHip(convert(hip, 2.54));
    }
    setResult(null);
    setError("");
    setValidationMessage("");
  };
  const enteredHeight = unit === "imperial"
    ? (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)
    : Number(height);
  const calculate = () => {
    const fields = getCalculatorValidationMessage([
      { label: "Weight", valid: validNumber(weight) },
      { label: "Height", valid: Number.isFinite(enteredHeight) && enteredHeight > 0 },
      { label: "Neck Circumference", valid: validNumber(neck) },
      { label: "Waist Circumference", valid: validNumber(waist) },
      ...(sex !== "female" ? [] : [{ label: "Hip Circumference", valid: validNumber(hip) }]),
      ...(!age.trim() && !showBmiComparison ? [] : [{ label: "Age (18–100)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100 }]),
    ]);
    setValidationMessage(fields);
    if (fields) return;
    try {
      setResult(calculateBodyFat({
        sex,
        ...(age.trim() ? { age: Number(age) } : {}),
        weight: Number(weight),
        height: enteredHeight,
        neck: Number(neck),
        waist: Number(waist),
        ...(sex === "female" ? { hip: Number(hip) } : {}),
        unit,
      }));
      setError("");
    } catch (calculationError) {
      setResult(null);
      setError(calculationError instanceof Error ? calculationError.message : "Unable to calculate body fat. Check your measurements.");
    }
  };
  const validNumber = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0;
  const displayMass = (mass: number) => `${mass.toFixed(1)} ${unit === "imperial" ? "lb" : "kg"}`;

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel body-fat-calculator-panel" aria-label="Body fat calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Measurements</h2>
          <div className="tdee-unit-toggle" aria-label="Measurement units">
            {(["metric", "imperial"] as const).map((value) => (
              <button aria-pressed={unit === value} className={unit === value ? "selected" : ""} key={value} onClick={() => changeUnit(value)} type="button">
                {value === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>
        </div>

        <div className="body-fat-fields-grid">
          <label className="field tdee-sex-field">
            <span>Sex / Gender</span>
            <div className="segmented">
              {(["male", "female"] as const).map((value) => (
                <button aria-pressed={sex === value} className={sex === value ? "selected" : ""} key={value} onClick={() => update(() => setSex(value))} type="button">
                  {value === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>Age <small>(optional; required for BMI comparison)</small></span>
            <div className="input-unit"><input max="100" min="18" onChange={(event) => update(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit"><input min="1" onChange={(event) => update(() => setWeight(event.target.value))} type="number" value={weight} /><i>{unit === "imperial" ? "lb" : "kg"}</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            {unit === "imperial" ? (
              <div className="body-fat-height-fields">
                <div className="input-unit"><input aria-label="Height in feet" min="1" onChange={(event) => update(() => setHeightFeet(event.target.value))} type="number" value={heightFeet} /><i>ft</i></div>
                <div className="input-unit"><input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => update(() => setHeightInches(event.target.value))} step="0.1" type="number" value={heightInches} /><i>in</i></div>
              </div>
            ) : (
              <div className="input-unit"><input min="1" onChange={(event) => update(() => setHeight(event.target.value))} type="number" value={height} /><i>cm</i></div>
            )}
          </label>
          <label className="field">
            <span>Neck Circumference</span>
            <div className="input-unit"><input min="1" onChange={(event) => update(() => setNeck(event.target.value))} type="number" value={neck} /><i>{unit === "imperial" ? "in" : "cm"}</i></div>
          </label>
          <label className="field">
            <span>Waist Circumference</span>
            <div className="input-unit"><input min="1" onChange={(event) => update(() => setWaist(event.target.value))} type="number" value={waist} /><i>{unit === "imperial" ? "in" : "cm"}</i></div>
          </label>
          {sex === "female" && (
            <label className="field">
              <span>Hip Circumference</span>
              <div className="input-unit"><input min="1" onChange={(event) => update(() => setHip(event.target.value))} type="number" value={hip} /><i>{unit === "imperial" ? "in" : "cm"}</i></div>
            </label>
          )}
        </div>

        <label className="body-fat-comparison-toggle">
          <input checked={showBmiComparison} onChange={(event) => update(() => setShowBmiComparison(event.target.checked))} type="checkbox" />
          <span>Show optional BMI-based estimate for comparison</span>
        </label>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Body Fat
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
        {error && <p className="body-fat-calculation-error" role="alert">{error}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results body-fat-results">
        <h2>Your Body Composition Estimate</h2>
        <p className="bmr-result-label">Body Fat Percentage</p>
        <div className="tdee-calorie-total bmr-calorie-total body-fat-percentage-total">
          <strong>{result ? `${result.bodyFatPercentage.toFixed(1)}%` : "—"}</strong>
          <span>U.S. Navy circumference method</span>
        </div>
        {result && (
          <>
            <p className="body-fat-category">{result.category}</p>
            <div className="body-fat-result-metrics">
              <div><span>Body Fat Mass</span><strong>{displayMass(result.fatMass)}</strong></div>
              <div><span>Lean Body Mass</span><strong>{displayMass(result.leanMass)}</strong></div>
            </div>
            {showBmiComparison && result.bmiBodyFatPercentage !== undefined && <p className="body-fat-bmi-result">BMI: {result.bmi.toFixed(1)} · BMI-based body-fat estimate: {result.bmiBodyFatPercentage.toFixed(1)}%</p>}
          </>
        )}
        {!result && <p className="protein-target-range">Enter your measurements to estimate body-fat percentage, fat mass, and lean mass.</p>}
        <p className="protein-target-method">A circumference-based estimate for general fitness and tracking, not a medical diagnosis.</p>
      </div>
    </section>
  );
}
