"use client";

import { useState } from "react";
import { calculateMacros, MacroInput } from "@/lib/calculators/macro-calculator";

const ratios: Record<string, [number, number, number]> = { balanced: [30, 40, 30], "high-protein": [40, 30, 30], "low-carb": [30, 20, 50] };
type CalculatorForm = Omit<MacroInput, "sex" | "activity" | "goal"> & {
  sex: MacroInput["sex"] | "";
  activity: MacroInput["activity"] | "";
  goal: MacroInput["goal"] | "";
};
type HeightUnit = "cm" | "in" | "ft" | "";
type WeightUnit = "kg" | "lb" | "";

export default function CalculatorWidget() {
  const emptyForm: CalculatorForm = { weightKg: 0, heightCm: 0, age: 0, sex: "", activity: "", goal: "", formula: "mifflin" };
  const [form, setForm] = useState<CalculatorForm>(emptyForm);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightFeet, setHeightFeet] = useState(0);
  const [heightInches, setHeightInches] = useState(0);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb");
  const [ratio, setRatio] = useState("");
  const [customRatio, setCustomRatio] = useState<[number, number, number]>([30, 40, 30]);
  const [calculated, setCalculated] = useState<{ form: MacroInput; ratio: string } | null>(null);

  const update = (patch: Partial<CalculatorForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setCalculated(null);
  };
  const changeHeightUnit = (unit: HeightUnit) => {
    if (unit === "ft" && form.heightCm > 0) {
      const totalInches = Math.round(form.heightCm / 2.54);
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(totalInches % 12);
    }
    setHeightUnit(unit);
  };
  const result = calculated ? calculateMacros(calculated.form) : null;
  const selectedRatio = calculated?.ratio ?? (ratio || "balanced");
  const [proteinPct, carbPct, fatPct] = selectedRatio === "custom" ? customRatio : ratios[selectedRatio];
  const kcal = result?.targetKcal ?? 0;
  const macros = [
    { label: "Protein", value: result ? Math.round(kcal * proteinPct / 400) : 0, color: "#C4443A", percent: result ? proteinPct : 0, energy: 4 },
    { label: "Carbs", value: result ? Math.round(kcal * carbPct / 400) : 0, color: "#D9A441", percent: result ? carbPct : 0, energy: 4 },
    { label: "Fat", value: result ? Math.round(kcal * fatPct / 900) : 0, color: "#5B7A6B", percent: result ? fatPct : 0, energy: 9 },
  ];
  const canCalculate = Boolean(form.sex && form.activity && form.goal && ratio && heightUnit && weightUnit && form.age >= 18 && form.age <= 80 && form.weightKg > 0 && form.heightCm > 0);
  const calculate = () => {
    if (!canCalculate) return;
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
  };

  return <section className="calculator-panel" aria-label="Macro calculator">
    <div className="calculator-form">
      <h2>Your Details</h2>
      <label className="field sex-field"><span>Sex</span><div className="segmented"><button type="button" className={form.sex === "male" ? "selected" : ""} onClick={() => update({ sex: "male" })}>Male</button><button type="button" className={form.sex === "female" ? "selected" : ""} onClick={() => update({ sex: "female" })}>Female</button></div></label>
      <div className={`field-row three-fields${heightUnit === "ft" ? " height-feet-row" : ""}`}>
        <label className="field"><span>Age (18–80)</span><div className="input-unit"><input type="number" min="18" max="80" step="1" value={form.age || ""} onChange={e => update({ age: +e.target.value })}/><i>years</i></div></label>
        <label className="field"><span>Weight</span><div className="input-unit"><input aria-label={weightUnit ? `Weight in ${weightUnit}` : "Weight"} type="number" min={weightUnit === "lb" ? 66 : 30} value={!weightUnit || !form.weightKg ? "" : weightUnit === "lb" ? Math.round(form.weightKg * 2.20462 * 10) / 10 : form.weightKg} disabled={!weightUnit} onChange={e => update({ weightKg: weightUnit === "lb" ? +e.target.value / 2.20462 : +e.target.value })}/><select aria-label="Weight unit" value={weightUnit} onChange={e => setWeightUnit(e.target.value as WeightUnit)}><option value="">unit</option><option value="kg">kg</option><option value="lb">lb</option></select></div></label>
        <label className="field"><span>Height</span><div className={`input-unit${heightUnit === "ft" ? " height-feet" : ""}`}>
          {heightUnit === "ft" ? <><input aria-label="Height in feet" type="number" min="0" max="8" value={heightFeet || ""} onChange={e => { const feet = +e.target.value; setHeightFeet(feet); update({ heightCm: (feet * 12 + heightInches) * 2.54 }); }}/><i>ft</i><input aria-label="Additional inches" type="number" min="0" max="11" value={heightInches || ""} onChange={e => { const inches = +e.target.value; setHeightInches(inches); update({ heightCm: (heightFeet * 12 + inches) * 2.54 }); }}/><i>in</i></> : <input aria-label={heightUnit ? `Height in ${heightUnit}` : "Height"} type="number" min={heightUnit === "in" ? 40 : 100} max={heightUnit === "in" ? 100 : 250} value={!heightUnit || !form.heightCm ? "" : heightUnit === "in" ? Math.round(form.heightCm / 2.54 * 10) / 10 : form.heightCm} disabled={!heightUnit} onChange={e => update({ heightCm: heightUnit === "in" ? +e.target.value * 2.54 : +e.target.value })}/>}
          <select aria-label="Height unit" value={heightUnit} onChange={e => changeHeightUnit(e.target.value as HeightUnit)}><option value="">unit</option><option value="cm">cm</option><option value="in">in</option><option value="ft">ft + in</option></select>
        </div></label>
      </div>
      <label className="field"><span>Activity Level</span><select value={form.activity} onChange={e => update({ activity: e.target.value as CalculatorForm["activity"] })}><option value="">Select activity level</option><option value="sedentary">Sedentary (little or no exercise)</option><option value="light">Light (1 to 3 days/week)</option><option value="moderate">Moderate (3 to 5 days/week)</option><option value="veryActive">Active (6 to 7 days/week)</option><option value="extremelyActive">Very active</option></select></label>
      <label className="field"><span>Goal</span><select value={form.goal} onChange={e => update({ goal: e.target.value as CalculatorForm["goal"] })}><option value="">Select goal</option><option value="lose">Weight Loss (-15%)</option><option value="build">Muscle Gain (+10%)</option><option value="maintain">Maintenance</option><option value="keto">Keto</option></select></label>
      <fieldset className="ratio-field"><legend>Macro Ratio</legend><div className="ratio-options">{[["balanced", "Balanced", "30% / 40% / 30%"], ["high-protein", "High Protein", "40% / 30% / 30%"], ["low-carb", "Low Carb", "30% / 20% / 50%"], ["custom", "Custom", "Set your own split"]].map(([key, label, sub]) => <button type="button" key={key} className={ratio === key ? "active" : ""} onClick={() => { setRatio(key); setCalculated(null); }}><i /><span>{label}<small>{sub}</small></span></button>)}</div>
        {ratio === "custom" && <div className="custom-ratio-controls">{(["Protein", "Carbs", "Fat"] as const).map((label, index) => <label className={`custom-ratio-row custom-ratio-${label.toLowerCase()}`} key={label}><span>{label}</span><input type="range" min="10" max="70" step="1" value={customRatio[index]} aria-label={`${label} share`} onChange={e => changeCustomRatio(index as 0 | 1 | 2, Number(e.target.value))}/><output>{customRatio[index]}%</output></label>)}</div>}
      </fieldset>
      <div className="form-actions"><button className="calculate-button" type="button" onClick={calculate} disabled={!canCalculate}>Calculate My Macros</button><button className="reset-button" type="button" onClick={reset}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 5.5A5.4 5.4 0 1 1 2.8 9M3.1 2.8v3.4h3.4"/></svg><span>Reset</span></button></div>
    </div>
    <div className="calculator-results">
      <h2>Macro Breakdown</h2>
      <div className="calorie-total"><strong>{kcal.toLocaleString()}</strong><span>calories per day</span></div>
      <div className="macro-rings">{macros.map(m => { const calories = m.value * m.energy; const circumference = 2 * Math.PI * 48; return <div className="macro-ring" key={m.label}><div className="ring-visual"><svg viewBox="0 0 108 108" aria-hidden="true"><circle className="ring-track" cx="54" cy="54" r="48"/><circle className="ring-progress" cx="54" cy="54" r="48" stroke={m.color} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - m.percent / 100)}/></svg><div className="ring-inner"><strong>{m.value}<small> g</small></strong><span>{m.label}</span><em>{m.percent}%</em></div></div><p>{calories.toLocaleString()} calories</p></div>; })}</div>
      <div className="results-note">
        <p>Your results show estimated daily calories and macro targets based on your details and selected ratio. Choose a preset or create your own split to see how the balance changes.</p>
        <p>These results are general guidelines. Consult a healthcare professional about your nutrition needs if you are an athlete, training for a specific purpose, pregnant, managing a health condition, or following a prescribed diet.</p>
      </div>
    </div>
  </section>;
}
