"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  calculateMacros,
  convertFeetAndInchesToCm,
  convertHeightToCm,
  convertWeightFromKg,
  convertWeightToKg,
  MacroInput,
} from "@/lib/calculators/macro-calculator";
import { getCalculatorValidationMessage } from "@/lib/calculator-validation";
import {
  ACTIVITY_LEVELS,
  ACTIVITY_MULTIPLIERS,
  CALCULATOR_INPUT_LIMITS,
  MACRO_CALORIE_GOALS,
  MACRO_SPLITS,
  MACRO_KCAL_PER_GRAM,
} from "@/lib/constants";

const formulaLabels: Record<MacroInput["formula"], string> = {
  mifflin: "Mifflin–St Jeor (Recommended)",
  harris: "Revised Harris-Benedict",
  katch: "Katch-McArdle",
  cunningham: "Cunningham",
};
type MacroCalculatorGoal = keyof typeof MACRO_CALORIE_GOALS;
type MacroCalculationInput = Omit<MacroInput, "goal"> & { goal: MacroCalculatorGoal };
type CalculatorForm = Omit<MacroInput, "sex" | "activity" | "goal"> & {
  sex: MacroInput["sex"] | "";
  activity: MacroInput["activity"] | "";
  goal: MacroCalculatorGoal | "";
};
type UnitSystem = "metric" | "imperial";
type MacroDisplayUnit = "grams" | "ounces";

const macroSplitLabels: Record<string, string> = {
  balanced: "Balanced",
  "high-protein": "High Protein",
  "low-carb": "Low Carb",
  keto: "Keto",
  custom: "Custom",
};
const GRAMS_PER_OUNCE = 28.3495;

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function formatMacroAmount(grams: number, unit: MacroDisplayUnit) {
  return formatAmount(unit === "grams" ? grams : grams / GRAMS_PER_OUNCE);
}

function isWithinDisplayedRange(value: number, min: number, max: number, tolerance: number) {
  return Number.isFinite(value) && value >= min - tolerance && value <= max + tolerance;
}

function clampRoundedBoundary(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDisplayedFeetAndInches(heightCm: number) {
  const totalInches = Math.round(heightCm / 2.54 * 10) / 10;
  const feet = Math.floor(totalInches / 12);
  return { feet, inches: totalInches - feet * 12 };
}

export default function CalculatorWidget() {
  const emptyForm: CalculatorForm = { weightKg: 0, heightCm: 0, age: 0, sex: "male", activity: "", goal: "", formula: "mifflin" };
  const [form, setForm] = useState<CalculatorForm>(emptyForm);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [ratio, setRatio] = useState("balanced");
  const [customRatio, setCustomRatio] = useState<[number, number, number]>([30, 40, 30]);
  const [calculated, setCalculated] = useState<{ form: MacroCalculationInput; ratio: string } | null>(null);
  const [resultProgress, setResultProgress] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");
  const [displayUnit, setDisplayUnit] = useState<MacroDisplayUnit>("grams");
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

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
  const updateWeight = (value: string) => {
    update({
      weightKg: value
        ? unitSystem === "imperial" ? convertWeightToKg(+value, "lb") : +value
        : 0,
    });
  };
  const updateImperialFeet = (value: string) => {
    const currentHeight = getDisplayedFeetAndInches(form.heightCm);
    update({
      heightCm: convertFeetAndInchesToCm(value ? +value : 0, currentHeight.inches),
    });
  };
  const updateImperialInches = (value: string) => {
    const currentHeight = getDisplayedFeetAndInches(form.heightCm);
    update({
      heightCm: convertFeetAndInchesToCm(currentHeight.feet, value ? +value : 0),
    });
  };
  const changeUnitSystem = (unit: UnitSystem) => {
    if (unit === unitSystem) return;
    setUnitSystem(unit);
    setCalculated(null);
    setResultProgress(0);
    setValidationMessage("");
  };
  const weightTolerance = unitSystem === "imperial" ? convertWeightToKg(0.05, "lb") : 0.05;
  const heightTolerance = unitSystem === "imperial" ? convertHeightToCm(0.05, "in") : 0.05;
  const imperialHeight = getDisplayedFeetAndInches(form.heightCm);
  const weightMin = unitSystem === "metric"
    ? CALCULATOR_INPUT_LIMITS.weightKg.min
    : convertWeightFromKg(CALCULATOR_INPUT_LIMITS.weightKg.min, "lb");
  const weightMax = unitSystem === "metric"
    ? CALCULATOR_INPUT_LIMITS.weightKg.max
    : convertWeightFromKg(CALCULATOR_INPUT_LIMITS.weightKg.max, "lb");
  const heightMin = getDisplayedFeetAndInches(CALCULATOR_INPUT_LIMITS.heightCm.min);
  const heightMax = getDisplayedFeetAndInches(CALCULATOR_INPUT_LIMITS.heightCm.max);
  const heightMinLabel = unitSystem === "metric" ? `${CALCULATOR_INPUT_LIMITS.heightCm.min} cm` : `${heightMin.feet} ft ${formatAmount(heightMin.inches)} in`;
  const heightMaxLabel = unitSystem === "metric" ? `${CALCULATOR_INPUT_LIMITS.heightCm.max} cm` : `${heightMax.feet} ft ${formatAmount(heightMax.inches)} in`;
  const result = calculated ? calculateMacros({
    ...calculated.form,
    split: calculated.ratio === "high-protein"
        ? "highProtein"
        : calculated.ratio === "low-carb"
          ? "lowCarb"
          : calculated.ratio === "keto"
            ? "keto"
          : calculated.ratio === "custom"
            ? "custom"
            : "balanced",
    ...(calculated.ratio === "custom" ? { customSplit: customRatio } : {}),
  }) : null;
  const selectedRatio = calculated?.ratio ?? (ratio || "balanced");
  const selectedPresetSplit = selectedRatio === "high-protein"
    ? MACRO_SPLITS.highProtein
    : selectedRatio === "low-carb"
      ? MACRO_SPLITS.lowCarb
      : selectedRatio === "keto"
        ? MACRO_SPLITS.keto
        : MACRO_SPLITS.balanced;
  const [proteinPct, carbPct, fatPct] = selectedRatio === "custom"
    ? customRatio
    : selectedPresetSplit.map((share) => share * 100);
  const kcal = result ? Math.round(result.targetKcal * resultProgress) : 0;
  const goalAdjustment = result ? result.targetKcal - result.tdee : 0;
  const adjustmentLabel = goalAdjustment > 0
    ? `+${goalAdjustment.toLocaleString()}`
    : goalAdjustment.toLocaleString();
  const macros = [
    { label: "Protein", grams: result ? Math.round(result.protein * resultProgress) : 0, color: "#C4443A", percent: result?.actualProteinShare ?? 0, energy: MACRO_KCAL_PER_GRAM.protein },
    { label: "Carbs", grams: result ? Math.round(result.carbs * resultProgress) : 0, color: "#D9A441", percent: result?.actualCarbShare ?? 0, energy: MACRO_KCAL_PER_GRAM.carbs },
    { label: "Fat", grams: result ? Math.round(result.fat * resultProgress) : 0, color: "#5B7A6B", percent: result?.actualFatShare ?? 0, energy: MACRO_KCAL_PER_GRAM.fat },
  ];
  const selectedActivity = calculated?.form.activity;
  const selectedGoal = calculated?.form.goal;
  const minimumCalorieWarning = result?.warnings.some((warning) => warning.startsWith("The calorie target is below ")) ?? false;
  const weeklyWeightChangeKg = selectedGoal ? MACRO_CALORIE_GOALS[selectedGoal].weeklyWeightChangeKg : undefined;
  const progressEstimate = result && selectedGoal && !minimumCalorieWarning && weeklyWeightChangeKg !== undefined
    ? `At your selected pace, you could ${weeklyWeightChangeKg < 0 ? "lose" : "gain"} about ${formatAmount(Math.abs(weeklyWeightChangeKg * 4))} kg in 4 weeks.`
    : null;
  const macroSplit = `${proteinPct}% / ${carbPct}% / ${fatPct}%`;
  const selectedSplitLabel = macroSplitLabels[selectedRatio] ?? "Balanced";
  const calculationExplanation = result && selectedActivity
    ? `${result.formulaUsed} formula × ${ACTIVITY_LEVELS[selectedActivity].label.toLowerCase()} activity (${ACTIVITY_MULTIPLIERS[selectedActivity]}), followed by a ${adjustmentLabel} kcal goal adjustment.`
    : "";
  const copyResults = async () => {
    if (!result || !selectedActivity || !selectedGoal) return;

    const summary = [
      `Daily target: ${result.targetKcal.toLocaleString()} calories per day`,
      `Maintenance: ${result.tdee.toLocaleString()} kcal`,
      `Goal adjustment: ${adjustmentLabel} kcal (${MACRO_CALORIE_GOALS[selectedGoal].label})`,
      `Protein: ${result.protein} g (${Math.round(result.actualProteinShare)}%, ${Math.round(result.protein * MACRO_KCAL_PER_GRAM.protein)} kcal)`,
      `Carbs: ${result.carbs} g (${Math.round(result.actualCarbShare)}%, ${Math.round(result.carbs * MACRO_KCAL_PER_GRAM.carbs)} kcal)`,
      `Fat: ${result.fat} g (${Math.round(result.actualFatShare)}%, ${Math.round(result.fat * MACRO_KCAL_PER_GRAM.fat)} kcal)`,
      `Activity: ${ACTIVITY_LEVELS[selectedActivity].label} (${ACTIVITY_MULTIPLIERS[selectedActivity]})`,
      `Macro split: ${selectedSplitLabel} (${macroSplit})`,
    ].join("\n");

    setCopyFeedback("");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary);
      } else {
        throw new Error("Clipboard API is unavailable.");
      }
      setCopyFeedback("Results copied.");
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = summary;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        try {
          document.body.appendChild(textArea);
          textArea.select();
          const copied = document.execCommand("copy");
          if (!copied) throw new Error("The browser could not copy the results.");
          setCopyFeedback("Results copied.");
        } finally {
          textArea.remove();
        }
      } catch {
        setCopyFeedback("Copy failed. Please try again.");
      }
    }
  };
  const calculate = () => {
    const message = getCalculatorValidationMessage([
      { label: "Sex", valid: Boolean(form.sex) },
      { label: "Age (18–80)", valid: Number.isInteger(form.age) && form.age >= 18 && form.age <= 80 },
      {
        label: `Weight (${unitSystem === "metric" ? "30–300 kg" : `${formatAmount(weightMin)}–${formatAmount(weightMax)} lb`})`,
        valid: isWithinDisplayedRange(
          form.weightKg,
          CALCULATOR_INPUT_LIMITS.weightKg.min,
          CALCULATOR_INPUT_LIMITS.weightKg.max,
          weightTolerance,
        ),
      },
      {
        label: `Height (${heightMinLabel}–${heightMaxLabel})`,
        valid: isWithinDisplayedRange(
          form.heightCm,
          CALCULATOR_INPUT_LIMITS.heightCm.min,
          CALCULATOR_INPUT_LIMITS.heightCm.max,
          heightTolerance,
        ),
      },
      { label: "Activity Level", valid: Boolean(form.activity) },
      { label: "Goal", valid: Boolean(form.goal) },
      { label: "Macro Split", valid: Boolean(ratio) },
      ...(!(form.formula === "katch" || form.formula === "cunningham") ? [] : [{
        label: "Body Fat Percentage (3–70%)",
        valid: Number(form.bodyFatPct) >= 3 && Number(form.bodyFatPct) <= 70,
      }]),
    ]);
    setValidationMessage(message);
    if (message) return;
    setResultProgress(0);
    setShowCalculationInfo(false);
    setCopyFeedback("");
    setCalculated({
      form: {
        ...form,
        weightKg: clampRoundedBoundary(
          form.weightKg,
          CALCULATOR_INPUT_LIMITS.weightKg.min,
          CALCULATOR_INPUT_LIMITS.weightKg.max,
        ),
        heightCm: clampRoundedBoundary(
          form.heightCm,
          CALCULATOR_INPUT_LIMITS.heightCm.min,
          CALCULATOR_INPUT_LIMITS.heightCm.max,
        ),
      } as MacroCalculationInput,
      ratio,
    });
  };
  const reset = () => {
    setForm(emptyForm);
    setUnitSystem("metric");
    setRatio("balanced");
    setCustomRatio([30, 40, 30]);
    setCalculated(null);
    setResultProgress(0);
    setValidationMessage("");
    setDisplayUnit("grams");
    setMealsPerDay(4);
    setShowCalculationInfo(false);
    setCopyFeedback("");
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
      <div className="tdee-form-heading">
        <h2>Your Details</h2>
        <div className="tdee-unit-toggle" aria-label="Measurement units">
          {(["metric", "imperial"] as const).map((unit) => (
            <button
              aria-pressed={unitSystem === unit}
              className={unitSystem === unit ? "selected" : ""}
              key={unit}
              onClick={() => changeUnitSystem(unit)}
              type="button"
            >
              {unit === "metric" ? "Metric" : "Imperial"}
            </button>
          ))}
        </div>
      </div>
      <label className="field sex-field"><span>Sex</span><div className="segmented"><button type="button" aria-pressed={form.sex === "male"} className={form.sex === "male" ? "selected" : ""} onClick={() => update({ sex: "male" })}>Male</button><button type="button" aria-pressed={form.sex === "female"} className={form.sex === "female" ? "selected" : ""} onClick={() => update({ sex: "female" })}>Female</button></div></label>
      <div className={`field-row three-fields${unitSystem === "imperial" ? " height-feet-row" : ""}`}>
        <label className="field"><span>Age (18–80)</span><div className="input-unit"><input type="number" min="18" max="80" step="1" value={form.age || ""} onChange={e => update({ age: +e.target.value })}/><i>years</i></div></label>
        <label className="field"><span>Weight</span><div className="input-unit"><input aria-label={`Weight in ${unitSystem === "metric" ? "kg" : "lb"}`} type="number" min={formatAmount(weightMin)} max={formatAmount(weightMax)} step="0.1" value={form.weightKg ? formatAmount(unitSystem === "metric" ? form.weightKg : convertWeightFromKg(form.weightKg, "lb")) : ""} onChange={e => updateWeight(e.target.value)}/><i>{unitSystem === "metric" ? "kg" : "lb"}</i></div></label>
        <label className="field height-field"><span>Height</span>{unitSystem === "metric"
          ? <div className="input-unit"><input aria-label="Height in centimeters" type="number" min={CALCULATOR_INPUT_LIMITS.heightCm.min} max={CALCULATOR_INPUT_LIMITS.heightCm.max} step="0.1" value={form.heightCm ? formatAmount(form.heightCm) : ""} onChange={e => update({ heightCm: e.target.value ? +e.target.value : 0 })}/><i>cm</i></div>
          : <div className="input-unit height-feet">
            <input aria-label="Height in feet" type="number" min="3" max="8" step="1" value={form.heightCm ? String(imperialHeight.feet) : ""} onChange={e => updateImperialFeet(e.target.value)}/><i>ft</i>
            <input aria-label="Additional height in inches" type="number" min="0" max="11.9" step="0.1" value={form.heightCm ? formatAmount(imperialHeight.inches) : ""} onChange={e => updateImperialInches(e.target.value)}/><i>in</i>
          </div>}</label>
      </div>
      <div className="macro-goal-row">
        <label className="field"><span>Activity Level</span><select value={form.activity} onChange={e => update({ activity: e.target.value as CalculatorForm["activity"] })}><option value="">Select activity level</option>{(Object.keys(ACTIVITY_LEVELS) as MacroInput["activity"][]).map((level) => <option key={level} value={level}>{ACTIVITY_LEVELS[level].label} — {ACTIVITY_LEVELS[level].hint}</option>)}</select></label>
        <label className="field"><span>Goal</span><select value={form.goal} onChange={e => update({ goal: e.target.value as CalculatorForm["goal"] })}><option value="">Select goal</option>{(Object.keys(MACRO_CALORIE_GOALS) as MacroCalculatorGoal[]).map((goal) => <option key={goal} value={goal}>{MACRO_CALORIE_GOALS[goal].label}</option>)}</select></label>
      </div>
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
      <fieldset className="ratio-field">
        <legend>Macro Split</legend>
        <div className="ratio-options" role="group" aria-label="Macro split">
          {[
            ["balanced", "Balanced", "Everyday macro balance"],
            ["high-protein", "High Protein", "Prioritizes protein"],
            ["low-carb", "Low Carb", "Fewer carbs, more fat"],
            ["keto", "Keto", "Very low carbohydrate"],
            ["custom", "Custom", "Set your own split"],
          ].map(([key, label, description]) => (
            <button
              aria-pressed={ratio === key}
              type="button"
              key={key}
              className={ratio === key ? "active" : ""}
              onClick={() => { setRatio(key); setCalculated(null); setResultProgress(0); setValidationMessage(""); }}
            >
              <i aria-hidden="true" />
              <span>{label}<small>{description}</small></span>
            </button>
          ))}
        </div>
        {ratio === "custom" && <div className="custom-ratio-controls">{(["Protein", "Carbs", "Fat"] as const).map((label, index) => <label className={`custom-ratio-row custom-ratio-${label.toLowerCase()}`} key={label}><span>{label}</span><input type="range" min="10" max="70" step="1" value={customRatio[index]} aria-label={`${label} share`} onChange={e => changeCustomRatio(index as 0 | 1 | 2, Number(e.target.value))}/><output>{customRatio[index]}%</output></label>)}</div>}
      </fieldset>
      <div className="form-actions"><button className="calculate-button" type="button" onClick={calculate}>Calculate My Macros</button><button className="reset-button" type="button" onClick={reset}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 5.5A5.4 5.4 0 1 1 2.8 9M3.1 2.8v3.4h3.4"/></svg><span>Reset</span></button></div>
      {validationMessage && <p className="calculator-validation-message" role="alert">{validationMessage}</p>}
    </div>
    <div className="calculator-results" aria-label="Macro calculator results">
      <div className="macro-results-header">
        <h2>Your Results</h2>
        <div className="macro-unit-toggle" role="group" aria-label="Macro units">
          <span>Units:</span>
          {(["grams", "ounces"] as const).map((unit) => (
            <button
              aria-pressed={displayUnit === unit}
              className={displayUnit === unit ? "active" : ""}
              key={unit}
              onClick={() => setDisplayUnit(unit)}
              type="button"
            >
              {unit === "grams" ? "Grams" : "Ounces"}
            </button>
          ))}
        </div>
      </div>
      <div className="macro-calorie-hero">
        <strong>{kcal.toLocaleString()}</strong>
        <span>calories per day</span>
        {result && selectedGoal && (
          <>
            <p>Maintenance: {result.tdee.toLocaleString()} kcal <i>•</i> Goal: {adjustmentLabel} kcal ({MACRO_CALORIE_GOALS[selectedGoal].label.toLowerCase()})</p>
            {result.warnings.filter((warning) => !warning.startsWith("Preset protein was adjusted")).length > 0 && <ul aria-label="Calculation warnings" className="macro-result-warnings" role="status">{result.warnings.filter((warning) => !warning.startsWith("Preset protein was adjusted")).map((warning) => <li key={warning}>{warning}</li>)}</ul>}
            {progressEstimate && <p className="macro-progress-estimate">{progressEstimate}</p>}
          </>
        )}
      </div>
      <div className="macro-rings">
        {macros.map((macro) => {
          const calories = Math.round(macro.grams * macro.energy);
          const amount = formatMacroAmount(macro.grams, displayUnit);
          const unitLabel = displayUnit === "grams" ? "g" : "oz";
          const circumference = 2 * Math.PI * 48;
          return (
            <div className="macro-ring" key={macro.label}>
              <div className="ring-visual">
                <svg viewBox="0 0 108 108" aria-hidden="true">
                  <circle className="ring-track" cx="54" cy="54" r="48" />
                  <circle
                    className="ring-progress"
                    cx="54"
                    cy="54"
                    r="48"
                    stroke={macro.color}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - macro.percent / 100)}
                  />
                </svg>
                <div className="ring-inner">
                  <strong>{amount}<small> {unitLabel}</small></strong>
                  <span>{macro.label}</span>
                </div>
              </div>
              <p className="macro-ring-meta">
                {result ? `${Math.round(macro.percent)}%` : ""}
                {result ? " · " : ""}
                {calories.toLocaleString()} kcal
              </p>
            </div>
          );
        })}
      </div>
      {result && calculated && selectedActivity && selectedGoal && (
        <>
          <div className="macro-protein-info">
            <p>Protein = <strong>{result.proteinPerKg.toFixed(1)} g</strong> per kg of body weight</p>
            <button
              aria-controls="macro-calculation-explanation"
              aria-expanded={showCalculationInfo}
              className="macro-info-toggle"
              onClick={() => setShowCalculationInfo((shown) => !shown)}
              type="button"
            >
              How we calculated this
            </button>
            <p
              className="macro-calculation-explanation"
              hidden={!showCalculationInfo}
              id="macro-calculation-explanation"
            >
              {calculationExplanation}
            </p>
          </div>
          <details className="macro-meal-details">
            <summary>
              <span>Per meal targets</span>
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="m3.5 6 4.5 4 4.5-4" />
              </svg>
            </summary>
            <div className="macro-meal-content">
              <div className="macro-meal-selector">
                <span>Meals per day:</span>
                <div role="group" aria-label="Meals per day">
                  {[3, 4, 5].map((meals) => (
                    <button
                      aria-pressed={mealsPerDay === meals}
                      className={mealsPerDay === meals ? "active" : ""}
                      key={meals}
                      onClick={() => setMealsPerDay(meals)}
                      type="button"
                    >
                      {meals}
                    </button>
                  ))}
                </div>
              </div>
              <div className="macro-per-meal-values">
                {[
                  { label: "Protein", grams: result.protein, color: "#C4443A" },
                  { label: "Carbs", grams: result.carbs, color: "#D9A441" },
                  { label: "Fat", grams: result.fat, color: "#5B7A6B" },
                ].map(({ label, grams, color }) => {
                  const amount = grams / mealsPerDay;
                  const unitLabel = displayUnit === "grams" ? "g" : "oz";
                  return (
                    <div key={label}>
                      <strong style={{ color }}>{formatMacroAmount(amount, displayUnit)} {unitLabel}</strong>
                      <span>{label} per meal</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
          <p className="macro-progress-note">Your results are estimates; actual progress varies.</p>
          <div className="macro-results-actions">
            <button onClick={copyResults} type="button">Copy results</button>
            <button onClick={() => window.print()} type="button">Print / Save PDF</button>
          </div>
          <p aria-live="polite" className="macro-copy-feedback" role="status">{copyFeedback}</p>
        </>
      )}
      <p className="macro-results-disclaimer">Estimates only. Not medical advice.</p>
    </div>
  </section>;
}
