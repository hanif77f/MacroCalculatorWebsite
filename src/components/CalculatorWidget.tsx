"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateMacros, MacroInput } from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import { ACTIVITY_MULTIPLIERS } from "@/lib/constants";

const ratios: Record<string, [number, number, number]> = { balanced: [30, 40, 30], "high-protein": [40, 30, 30], "low-carb": [30, 20, 50] };
const formulaLabels: Record<MacroInput["formula"], string> = {
  mifflin: "Mifflin–St Jeor (Recommended)",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};
const activityLabels: Record<MacroInput["activity"], string> = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  veryActive: "Active",
  extremelyActive: "Very active",
};
const goalLabels: Record<MacroInput["goal"], string> = {
  lose: "Weight loss",
  build: "Muscle gain",
  maintain: "Maintenance",
  keto: "Keto",
};
type CalculatorForm = Omit<MacroInput, "sex" | "activity" | "goal"> & {
  sex: MacroInput["sex"] | "";
  activity: MacroInput["activity"] | "";
  goal: MacroInput["goal"] | "";
};
type HeightUnit = "cm" | "in" | "ft" | "";
type WeightUnit = "kg" | "lb" | "";

export default function CalculatorWidget() {
  const emptyForm: CalculatorForm = { weightKg: 0, heightCm: 0, age: 0, sex: "male", activity: "", goal: "", formula: "mifflin" };
  const [form, setForm] = useState<CalculatorForm>(emptyForm);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightFeet, setHeightFeet] = useState(0);
  const [heightInches, setHeightInches] = useState(0);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb");
  const [ratio, setRatio] = useState("");
  const [customRatio, setCustomRatio] = useState<[number, number, number]>([30, 40, 30]);
  const [calculated, setCalculated] = useState<{ form: MacroInput; ratio: string } | null>(null);
  const [resultProgress, setResultProgress] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    if (!calculated) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setResultProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    let startTime: number | undefined;
    let frame = 0;
    const animate = (time: number) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / 650, 1);
      setResultProgress(1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [calculated]);

  const update = (patch: Partial<CalculatorForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setCalculated(null);
    setResultProgress(0);
    setValidationMessage("");
  };
  const changeHeightUnit = (unit: HeightUnit) => {
    if (unit === "ft" && form.heightCm > 0) {
      const totalInches = Math.round(form.heightCm / 2.54);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
    }
    setHeightUnit(unit);
  };
  const result = calculated ? calculateMacros({
    ...calculated.form,
    split: calculated.form.goal === "keto"
      ? "keto"
      : calculated.ratio === "high-protein"
        ? "highProtein"
        : calculated.ratio === "low-carb"
          ? "lowCarb"
          : calculated.ratio === "custom"
            ? "custom"
            : "balanced",
    ...(calculated.ratio === "custom" && calculated.form.goal !== "keto" ? { customSplit: customRatio } : {}),
  }) : null;
  const selectedRatio = calculated?.form.goal === "keto" ? "keto" : calculated?.ratio ?? (ratio || "balanced");
  const [proteinPct, carbPct, fatPct] = selectedRatio === "keto"
    ? [25, 5, 70]
    : selectedRatio === "custom"
      ? customRatio
      : ratios[selectedRatio];
  const kcal = result ? Math.round(result.targetKcal * resultProgress) : 0;
  const macros = [
    { label: "Protein", value: result ? Math.round(kcal * proteinPct / 400) : 0, color: "#C4443A", percent: result ? proteinPct : 0, energy: 4 },
    { label: "Carbs", value: result ? Math.round(kcal * carbPct / 400) : 0, color: "#D9A441", percent: result ? carbPct : 0, energy: 4 },
    { label: "Fat", value: result ? Math.round(kcal * fatPct / 900) : 0, color: "#5B7A6B", percent: result ? fatPct : 0, energy: 9 },
  ];
  const selectedActivity = calculated?.form.activity;
  const selectedGoal = calculated?.form.goal;
  const selectedFormula = result?.formulaUsed;
  const planMacros = result ? [
    Math.round(result.targetKcal * proteinPct / 400),
    Math.round(result.targetKcal * carbPct / 400),
    Math.round(result.targetKcal * fatPct / 900),
  ] : [];
  const goalMeaning: Record<MacroInput["goal"], string> = {
    lose: "This estimate uses a calorie target below estimated daily energy expenditure.",
    build: "This estimate uses a calorie target above estimated daily energy expenditure.",
    maintain: "This estimate uses your estimated daily energy expenditure as a maintenance starting point.",
    keto: "This estimate uses your estimated daily energy expenditure with the selected keto macro split.",
  };
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Sex", valid: Boolean(form.sex) },
      { label: "Age (18–80)", valid: Number.isInteger(form.age) && form.age >= 18 && form.age <= 80 },
      { label: "Weight", valid: form.weightKg > 0 },
      { label: "Weight unit", valid: Boolean(weightUnit) },
      { label: "Height", valid: form.heightCm > 0 },
      { label: "Height unit", valid: Boolean(heightUnit) },
      { label: "Activity Level", valid: Boolean(form.activity) },
      { label: "Goal", valid: Boolean(form.goal) },
      ...(form.goal === "keto" ? [] : [{ label: "Macro Split", valid: Boolean(ratio) }]),
      ...(!(form.formula === "katch" || form.formula === "cunningham") ? [] : [{
        label: "Body Fat Percentage (3–70%)",
        valid: Number(form.bodyFatPct) >= 3 && Number(form.bodyFatPct) <= 70,
      }]),
    ]);
    setValidationMessage(message);
    if (message) return;
    setResultProgress(0);
    setCalculated({ form: form as MacroInput, ratio });
  };
  const reset = () => {
    setForm(emptyForm);
    setHeightUnit("cm");
    setHeightFeet(0);
    setHeightInches(0);
    setWeightUnit("lb");
    setRatio("");
    setCustomRatio([30, 40, 30]);
    setCalculated(null);
    setResultProgress(0);
    setValidationMessage("");
  };
  const changeCustomRatio = (index: 0 | 1 | 2, value: number) => {
    const next: [number, number, number] = [...customRatio];
    const remaining = 100 - value;
    const others = ([0, 1, 2] as const).filter((i) => i !== index);
    const otherTotal = customRatio[others[0]] + customRatio[others[1]];
    next[index] = value;
    const firstShare = otherTotal
      ? Math.round(remaining * customRatio[others[0]] / otherTotal)
      : Math.round(remaining / 2);
    const minFirst = Math.max(10, remaining - 70);
    const maxFirst = Math.min(70, remaining - 10);
    next[others[0]] = Math.min(maxFirst, Math.max(minFirst, firstShare));
    next[others[1]] = remaining - next[others[0]];
    setCustomRatio(next);
    setCalculated(null);
    setResultProgress(0);
    setValidationMessage("");
  };

  return <section className="calculator-panel" aria-label="Macro calculator">
    <div className="calculator-form">
      <h2>Your Details</h2>
      <label className="field sex-field"><span>Sex</span><div className="segmented"><button type="button" aria-pressed={form.sex === "male"} className={form.sex === "male" ? "selected" : ""} onClick={() => update({ sex: "male" })}>Male</button><button type="button" aria-pressed={form.sex === "female"} className={form.sex === "female" ? "selected" : ""} onClick={() => update({ sex: "female" })}>Female</button></div></label>
      <div className={`field-row three-fields${heightUnit === "ft" ? " height-feet-row" : ""}`}>
        <label className="field"><span>Age (18–80)</span><div className="input-unit"><input type="number" min="18" max="80" step="1" value={form.age || ""} onChange={e => update({ age: +e.target.value })}/><i>years</i></div></label>
        <label className="field"><span>Weight</span><div className="input-unit"><input aria-label={weightUnit ? `Weight in ${weightUnit}` : "Weight"} type="number" min={weightUnit === "lb" ? 66 : 30} value={!weightUnit || !form.weightKg ? "" : weightUnit === "lb" ? Math.round(form.weightKg * 2.20462 * 10) / 10 : form.weightKg} disabled={!weightUnit} onChange={e => update({ weightKg: weightUnit === "lb" ? +e.target.value / 2.20462 : +e.target.value })}/><select aria-label="Weight unit" value={weightUnit} onChange={e => { setWeightUnit(e.target.value as WeightUnit); setValidationMessage(""); }}><option value="">unit</option><option value="kg">kg</option><option value="lb">lb</option></select></div></label>
        <label className="field height-field"><span>Height</span><div className={`input-unit${heightUnit === "ft" ? " height-feet" : ""}`}>
          {heightUnit === "ft" ? <><input aria-label="Height in feet" type="number" min="0" max="8" value={heightFeet || ""} onChange={e => { const feet = +e.target.value; setHeightFeet(feet); update({ heightCm: (feet * 12 + heightInches) * 2.54 }); }}/><i>ft</i><input aria-label="Additional inches" type="number" min="0" max="11" value={heightInches || ""} onChange={e => { const inches = +e.target.value; setHeightInches(inches); update({ heightCm: (heightFeet * 12 + inches) * 2.54 }); }}/><i>in</i></> : <input aria-label={heightUnit ? `Height in ${heightUnit}` : "Height"} type="number" min={heightUnit === "in" ? 40 : 100} max={heightUnit === "in" ? 100 : 250} value={!heightUnit || !form.heightCm ? "" : heightUnit === "in" ? Math.round(form.heightCm / 2.54 * 10) / 10 : form.heightCm} disabled={!heightUnit} onChange={e => update({ heightCm: heightUnit === "in" ? +e.target.value * 2.54 : +e.target.value })}/>}
          <select aria-label="Height unit" value={heightUnit} onChange={e => { changeHeightUnit(e.target.value as HeightUnit); setValidationMessage(""); }}><option value="">unit</option><option value="cm">cm</option><option value="in">in</option><option value="ft">ft + in</option></select>
        </div></label>
      </div>
      <label className="field"><span>Activity Level</span><select value={form.activity} onChange={e => update({ activity: e.target.value as CalculatorForm["activity"] })}><option value="">Select activity level</option><option value="sedentary">Sedentary (little or no exercise)</option><option value="light">Light (1 to 3 days/week)</option><option value="moderate">Moderate (3 to 5 days/week)</option><option value="veryActive">Active (6 to 7 days/week)</option><option value="extremelyActive">Very active</option></select></label>
      <label className="field"><span>Goal</span><select value={form.goal} onChange={e => update({ goal: e.target.value as CalculatorForm["goal"] })}><option value="">Select goal</option><option value="lose">Weight Loss (-15%)</option><option value="build">Muscle Gain (+10%)</option><option value="maintain">Maintenance</option><option value="keto">Keto</option></select></label>
      <details className="tdee-formula-options">
        <summary>Advanced Settings</summary>
        <label className="field">
          <span>Calorie Calculation Method</span>
          <select
            onChange={(event) => update({ formula: event.target.value as MacroInput["formula"], bodyFatPct: undefined })}
            value={form.formula}
          >
            {(Object.entries(formulaLabels) as [MacroInput["formula"], string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}{value === "katch" || value === "cunningham" ? " (requires body fat %)" : ""}</option>
            ))}
          </select>
        </label>
        {(form.formula === "katch" || form.formula === "cunningham") && (
          <>
            <p className="macro-body-fat-help">
              Don&apos;t know your body fat percentage?{" "}
              <Link href="/calculators/body-fat-calculator">Calculate it with our Body Fat Calculator</Link>.
            </p>
          <label className="field">
            <span>Body Fat Percentage (3–70%)</span>
            <div className="input-unit">
              <input
                aria-label="Body fat percentage"
                max="70"
                min="3"
                onChange={(event) => update({ bodyFatPct: Number(event.target.value) })}
                type="number"
                value={form.bodyFatPct ?? ""}
              />
              <i>%</i>
            </div>
          </label>
          </>
        )}
      </details>
      {form.goal !== "keto" && <fieldset className="ratio-field"><legend>Macro Split</legend><div className="ratio-options">{[["balanced", "Balanced", "30% / 40% / 30%"], ["high-protein", "High Protein", "40% / 30% / 30%"], ["low-carb", "Low Carb", "30% / 20% / 50%"], ["custom", "Custom", "Set your own split"]].map(([key, label, sub]) => <button type="button" key={key} className={ratio === key ? "active" : ""} onClick={() => { setRatio(key); setCalculated(null); setResultProgress(0); setValidationMessage(""); }}><i /><span>{label}<small>{sub}</small></span></button>)}</div>
        {ratio === "custom" && <div className="custom-ratio-controls">{(["Protein", "Carbs", "Fat"] as const).map((label, index) => <label className={`custom-ratio-row custom-ratio-${label.toLowerCase()}`} key={label}><span>{label}</span><input type="range" min="10" max="70" step="1" value={customRatio[index]} aria-label={`${label} share`} onChange={e => changeCustomRatio(index as 0 | 1 | 2, Number(e.target.value))}/><output>{customRatio[index]}%</output></label>)}</div>}
      </fieldset>}
      <div className="form-actions"><button className="calculate-button" type="button" onClick={calculate}>Calculate My Macros</button><button className="reset-button" type="button" onClick={reset}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 5.5A5.4 5.4 0 1 1 2.8 9M3.1 2.8v3.4h3.4"/></svg><span>Reset</span></button></div>
      {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
    </div>
    <div className="calculator-results">
      <div className="macro-results-header">
        <h2>Macro Breakdown</h2>
      </div>
      <div className="calorie-total"><strong>{kcal.toLocaleString()}</strong><span>calories per day</span></div>
      <div className="macro-rings">{macros.map(m => { const calories = m.value * m.energy; const circumference = 2 * Math.PI * 48; return <div className="macro-ring" key={m.label}><div className="ring-visual"><svg viewBox="0 0 108 108" aria-hidden="true"><circle className="ring-track" cx="54" cy="54" r="48"/><circle className="ring-progress" cx="54" cy="54" r="48" stroke={m.color} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - m.percent / 100)}/></svg><div className="ring-inner"><strong>{m.value}<small> g</small></strong><span>{m.label}</span><em>{m.percent}%</em></div></div><p>{calories.toLocaleString()} calories</p></div>; })}</div>
      <aside aria-label="Calculation basis" className="macro-calculation-basis">
        <h3>Calculation basis</h3>
        <dl>
          <div><dt>Goal</dt><dd>{result && selectedGoal ? goalLabels[selectedGoal] : "—"}</dd></div>
          <div><dt>Activity</dt><dd>{result && selectedActivity ? `${activityLabels[selectedActivity]} (${ACTIVITY_MULTIPLIERS[selectedActivity].toFixed(2)})` : "—"}</dd></div>
          <div><dt>Macro split</dt><dd>{result ? `${proteinPct}% / ${carbPct}% / ${fatPct}%` : "—"}</dd></div>
          <div><dt>Formula</dt><dd>{result ? selectedFormula : "—"}</dd></div>
        </dl>
      </aside>
      {result && calculated && selectedActivity && selectedGoal && (
        <div className="macro-result-extras">
          <p className="macro-result-summary">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M20.5 3.5C12 3.8 6.2 6.7 5.1 12c-.7 3.4 1.5 5.8 4.5 5.3 5.6-.9 8.7-7.1 10.9-13.8Z" /><path d="M3.5 21c2.7-6 6.5-9.8 12-12" /></svg>
            <span>
              Aim for about <strong>{result.targetKcal.toLocaleString()} calories</strong> per day, including{" "}
              <strong>{planMacros[0]} g</strong> protein, <strong>{planMacros[1]} g</strong> carbs, and <strong>{planMacros[2]} g</strong> fat.
            </span>
          </p>

          <div className="macro-result-context">
            <p><strong>What this means:</strong> {goalMeaning[selectedGoal]} Use it as an estimate, not a precise measurement.</p>
            <p><strong>Next steps (optional):</strong> Adjust your goal or macro split, then select Calculate to compare your estimated daily targets.</p>
          </div>
        </div>
      )}
      <div className="results-note">
        <p>Your results show estimated daily calories and macro targets based on your details and selected ratio. Choose a preset or create your own split to see how the balance changes.</p>

      </div>
    </div>
  </section>;
}
