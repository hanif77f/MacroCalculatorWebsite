"use client";

import { useState } from "react";
import { calculateLeanBodyMass, type LeanBodyMassResult, type LeanMassSex, type LeanMassUnit } from "@/lib/calculators/lean-body-mass-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";

export default function LeanBodyMassCalculatorWidget() {
  const [unit, setUnit] = useState<LeanMassUnit>("imperial");
  const [sex, setSex] = useState<LeanMassSex>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [result, setResult] = useState<LeanBodyMassResult | null>(null);
  const [error, setError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const update = (callback: () => void) => {
    callback();
    setResult(null);
    setError("");
    setValidationMessage("");
  };
  const convert = (value: string, factor: number) =>
    value.trim() && Number.isFinite(Number(value)) ? String(Math.round(Number(value) * factor * 10) / 10) : "";
  const updateUnit = (nextUnit: LeanMassUnit) => {
    if (unit === nextUnit) return;
    const currentHeightCm = unit === "imperial"
      ? ((Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)) * 2.54
      : Number(heightCm) || 0;
    const nextHeight = nextUnit === "imperial" ? currentHeightCm / 2.54 : currentHeightCm;
    setUnit(nextUnit);
    setHeightCm(nextUnit === "metric" ? convert(String(nextHeight), 1) : "");
    setHeightFeet(nextUnit === "imperial" && nextHeight ? String(Math.floor(nextHeight / 12)) : "");
    setHeightInches(nextUnit === "imperial" && nextHeight ? String(Math.round((nextHeight % 12) * 10) / 10) : "");
    setWeight(convert(weight, nextUnit === "imperial" ? 2.20462 : 1 / 2.20462));
    setResult(null);
    setError("");
    setValidationMessage("");
  };
  const enteredHeight = unit === "imperial"
    ? (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)
    : Number(heightCm);
  const validNumber = (value: string) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) > 0;
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Age (18–100)", valid: Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100 },
      { label: "Weight", valid: validNumber(weight) },
      { label: "Height", valid: Number.isFinite(enteredHeight) && enteredHeight > 0 },
    ]);
    setValidationMessage(message);
    if (message) return;
    try {
      setResult(calculateLeanBodyMass({ age: Number(age), sex, weight: Number(weight), height: enteredHeight, unit }));
      setError("");
    } catch (calculationError) {
      setResult(null);
      setError(calculationError instanceof Error ? calculationError.message : "Unable to calculate lean body mass. Check your entries.");
    }
  };
  const format = (value: number) => `${value.toFixed(1)} ${unit === "imperial" ? "lb" : "kg"}`;

  return (
    <section className="calculator-panel tdee-calculator-panel protein-calculator-panel lean-mass-calculator-panel" aria-label="Lean body mass calculator">
      <div className="calculator-form tdee-calculator-form protein-calculator-form">
        <div className="tdee-form-heading">
          <h2>Your Details</h2>
          <div className="tdee-unit-toggle" aria-label="Unit system">
            {(["metric", "imperial"] as const).map((value) => (
              <button aria-pressed={unit === value} className={unit === value ? "selected" : ""} key={value} onClick={() => updateUnit(value)} type="button">
                {value === "metric" ? "Metric" : "Imperial"}
              </button>
            ))}
          </div>
        </div>

        <div className="body-fat-fields-grid">
          <label className="field tdee-sex-field">
            <span>Sex</span>
            <div className="segmented">
              {(["male", "female"] as const).map((value) => (
                <button aria-pressed={sex === value} className={sex === value ? "selected" : ""} key={value} onClick={() => update(() => setSex(value))} type="button">
                  {value === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>Age (18–100)</span>
            <div className="input-unit"><input max="100" min="18" onChange={(event) => update(() => setAge(event.target.value))} type="number" value={age} /><i>years</i></div>
          </label>
          <label className="field">
            <span>Height</span>
            {unit === "imperial" ? (
              <div className="body-fat-height-fields">
                <div className="input-unit"><input aria-label="Height in feet" min="1" onChange={(event) => update(() => setHeightFeet(event.target.value))} type="number" value={heightFeet} /><i>ft</i></div>
                <div className="input-unit"><input aria-label="Height in inches" max="11.9" min="0" onChange={(event) => update(() => setHeightInches(event.target.value))} step="0.1" type="number" value={heightInches} /><i>in</i></div>
              </div>
            ) : (
              <div className="input-unit"><input aria-label="Height in centimeters" min="1" onChange={(event) => update(() => setHeightCm(event.target.value))} type="number" value={heightCm} /><i>cm</i></div>
            )}
          </label>
          <label className="field">
            <span>Weight</span>
            <div className="input-unit">
              <input aria-label={`Weight in ${unit === "imperial" ? "lb" : "kg"}`} min="1" onChange={(event) => update(() => setWeight(event.target.value))} type="number" value={weight} />
              <i>{unit === "imperial" ? "lb" : "kg"}</i>
            </div>
          </label>
        </div>

        <button className="calculate-button tdee-calculate-button" onClick={calculate} type="button">
          Calculate Lean Body Mass
        </button>
        {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
        {error && <p className="body-fat-calculation-error" role="alert">{error}</p>}
      </div>

      <div aria-live="polite" className="calculator-results tdee-calculator-results protein-calculator-results lean-mass-results">
        <h2>Your Lean Body Mass</h2>
        <p className="bmr-result-label">Estimated comparison range</p>
        <div className="tdee-calorie-total bmr-calorie-total body-fat-percentage-total">
          <strong>{result ? `${format(result.minimum)}–${format(result.maximum)}` : "—"}</strong>
          <span>range across three equations</span>
        </div>
        <div className="lean-mass-formula-results">
          <div><span>Boer</span><strong>{result ? format(result.boer) : "—"}</strong></div>
          <div><span>James</span><strong>{result ? format(result.james) : "—"}</strong></div>
          <div><span>Hume</span><strong>{result ? format(result.hume) : "—"}</strong></div>
        </div>
        <p className="protein-target-method">Lean body mass includes more than skeletal muscle. These equations provide estimates, not direct measurements.</p>
      </div>
    </section>
  );
}
