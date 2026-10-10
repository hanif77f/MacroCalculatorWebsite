/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const test = require("node:test");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;

Module._extensions[".ts"] = (module, filename) => {
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  module._compile(output, filename);
};

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  const resolvedRequest = request.startsWith("@/")
    ? path.join(root, "src", request.slice(2))
    : request;
  return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};

const { ACTIVITY_LEVELS, MACRO_CALORIE_GOALS } =
  require(path.join(root, "src", "lib", "constants.ts"));
const {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
} = require(path.join(root, "src", "lib", "calculator-standardization.ts"));
const {
  centimetersToFeetAndInches,
  centimetersToInches,
  feetAndInchesToCentimeters,
  inchesToCentimeters,
  kilogramsToPounds,
  poundsToKilograms,
} = require(path.join(root, "src", "lib", "calculator-unit-conversions.ts"));
const { DEFAULT_CALCULATOR_UNIT_SYSTEM } =
  require(path.join(root, "src", "lib", "use-calculator-unit-system.ts"));
const { calculateTdee } = require(path.join(root, "src", "lib", "calculators", "tdee-calculator.ts"));
const { calculateCalories } = require(path.join(root, "src", "lib", "calculators", "calorie-calculator.ts"));
const {
  calculateCarbs,
  calculateCarbohydratePortion,
  CARBOHYDRATE_COMPARISON_PERCENTAGES,
  CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE,
  DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE,
} = require(path.join(root, "src", "lib", "calculators", "carb-calculator.ts"));
const { calculateFatIntake } = require(path.join(root, "src", "lib", "calculators", "fat-intake-calculator.ts"));
const { calculateProtein } = require(path.join(root, "src", "lib", "calculators", "protein-calculator.ts"));
const { formatNutrientAmount, GRAMS_PER_OUNCE } = require(path.join(root, "src", "lib", "nutrient-display.ts"));
const { calculateBodyFat } = require(path.join(root, "src", "lib", "calculators", "body-fat-calculator.ts"));
const { calculateLeanBodyMass } = require(path.join(root, "src", "lib", "calculators", "lean-body-mass-calculator.ts"));

const profile = {
  age: 35,
  sex: "male",
  weightKg: 82,
  heightCm: 182,
  activity: "moderately-active",
  formula: "mifflin",
};

test("other calculator activity options match the shared exact values and order", () => {
  assert.deepEqual(
    ACTIVITY_OPTIONS.map(({ value, label, multiplier }) => [value, label, multiplier]),
    [
      ["sedentary", "Sedentary — Little or no exercise", 1.2],
      ["lightly-active", "Lightly Active — Exercise 1–3 times per week", 1.375],
      ["moderately-active", "Moderately Active — Exercise 4–5 times per week", 1.465],
      ["active", "Active — Daily exercise or intense exercise 3–4 times per week", 1.55],
      ["very-active", "Very Active — Intense exercise 6–7 times per week", 1.725],
      ["extra-active", "Extra Active — Very intense exercise daily or a physically demanding job", 1.9],
    ],
  );
  assert.deepEqual(
    ACTIVITY_OPTIONS.map(({ value }) => value),
    Object.keys(ACTIVITY_LEVELS),
  );
});

test("other calculator goal options use the shared IDs, labels, order, and fixed adjustments", () => {
  assert.deepEqual(
    GOAL_OPTIONS.map(({ value, label, adjustmentKcal }) => [value, label, adjustmentKcal]),
    [
      ["maintain", "Maintain weight", 0],
      ["lose-mild", "Mild weight loss — 0.25 kg (0.5 lb) per week", -250],
      ["lose-standard", "Weight loss — 0.5 kg (1 lb) per week", -500],
      ["lose-fast", "Faster weight loss — 1 kg (2 lb) per week", -1000],
      ["gain-mild", "Mild weight gain — 0.25 kg (0.5 lb) per week", 250],
      ["gain-standard", "Weight gain — 0.5 kg (1 lb) per week", 500],
      ["gain-fast", "Faster weight gain — 1 kg (2 lb) per week", 1000],
    ],
  );
  assert.deepEqual(Object.keys(MACRO_CALORIE_GOALS), GOAL_OPTIONS.map(({ value }) => value));
});

test("imperial is the default and shared unit conversions preserve canonical values", () => {
  assert.equal(DEFAULT_CALCULATOR_UNIT_SYSTEM, "imperial");
  const unitAwareWidgets = [
    "BmrCalculatorWidget.tsx",
    "TdeeCalculatorWidget.tsx",
    "CalorieCalculatorWidget.tsx",
    "CalorieDeficitCalculatorWidget.tsx",
    "ProteinCalculatorWidget.tsx",
    "CarbCalculatorWidget.tsx",
    "FatIntakeCalculatorWidget.tsx",
    "BodyFatCalculatorWidget.tsx",
    "LeanBodyMassCalculatorWidget.tsx",
  ];
  for (const widget of unitAwareWidgets) {
    const source = require("node:fs").readFileSync(
      path.join(root, "src", "components", widget),
      "utf8",
    );
    assert.ok(source.includes("useCalculatorUnitSystem"), `${widget} should honor the shared Imperial fallback and session preference`);
  }
  assert.ok(Math.abs(poundsToKilograms(kilogramsToPounds(80)) - 80) < 1e-10);
  assert.ok(Math.abs(inchesToCentimeters(centimetersToInches(178)) - 178) < 1e-10);
  const height = centimetersToFeetAndInches(178);
  assert.equal(height.feet, 5);
  assert.ok(Math.abs(feetAndInchesToCentimeters(height.feet, height.inches) - 178) < 1e-10);
});

test("unit preference reads and persists a selection for calculator navigation", () => {
  const react = require("react");
  const originalHook = react.useSyncExternalStore;
  const listeners = new Set();
  const session = new Map();
  const originalWindow = global.window;
  let notifications = 0;
  global.window = {
    sessionStorage: {
      getItem: (key) => session.get(key) ?? null,
      setItem: (key, value) => session.set(key, value),
    },
    addEventListener: (_event, callback) => listeners.add(callback),
    removeEventListener: (_event, callback) => listeners.delete(callback),
    dispatchEvent: () => {
      for (const callback of listeners) callback();
      return true;
    },
  };
  react.useSyncExternalStore = (subscribe, getSnapshot) => {
    const selected = getSnapshot();
    subscribe(() => { notifications += 1; });
    return selected;
  };
  try {
    const { useCalculatorUnitSystem } = require(path.join(root, "src", "lib", "use-calculator-unit-system.ts"));
    const [initial, setUnit] = useCalculatorUnitSystem();
    assert.equal(initial, "imperial");
    setUnit("metric");
    assert.equal(session.get("calculator-unit-system"), "metric");
    assert.equal(notifications, 1);
    setUnit("imperial");
    assert.equal(session.get("calculator-unit-system"), "imperial");
    assert.equal(notifications, 2);
  } finally {
    react.useSyncExternalStore = originalHook;
    if (originalWindow === undefined) delete global.window;
    else global.window = originalWindow;
  }
});

test("compatible calculators share the Macro Calculator TDEE and fixed goal adjustments", () => {
  for (const activity of Object.keys(ACTIVITY_LEVELS)) {
    const input = { ...profile, activity };
    const tdee = calculateTdee(input);
    for (const [goal, configuration] of Object.entries(MACRO_CALORIE_GOALS)) {
      const calories = calculateCalories({ ...input, goal });
      assert.equal(calories.bmr, tdee.bmr, `${activity}/${goal} BMR`);
      assert.equal(calories.maintenanceCalories, tdee.tdee, `${activity}/${goal} maintenance`);
      assert.equal(calories.targetCalories, tdee.tdee + configuration.adjustmentKcal, `${activity}/${goal} target`);
    }
  }
});

test("calorie calculator preserves its legacy goal identifiers and adjustments", () => {
  const tdee = calculateTdee(profile);
  for (const [goal, adjustment] of Object.entries({
    mildLose: -250,
    lose: -500,
    mildGain: 250,
    gain: 500,
  })) {
    const result = calculateCalories({ ...profile, goal });
    assert.equal(result.targetCalories, tdee.tdee + adjustment, goal);
  }
});

test("carbohydrate calculations use the shared goal-adjusted calorie engine and 4 kcal/g", () => {
  assert.equal(DEFAULT_CARBOHYDRATE_ENERGY_PERCENTAGE, 50);
  assert.deepEqual(CARBOHYDRATE_ENERGY_PERCENTAGE_RANGE, { min: 45, max: 65 });
  assert.deepEqual(CARBOHYDRATE_COMPARISON_PERCENTAGES, [40, 55, 65, 75]);

  for (const activity of Object.keys(ACTIVITY_LEVELS)) {
    for (const [goal, definition] of Object.entries(MACRO_CALORIE_GOALS)) {
      const input = { ...profile, activity, goal };
      const tdee = calculateTdee(input);
      const carbs = calculateCarbs(input);
      const expectedCalories = tdee.tdee + definition.adjustmentKcal;
      assert.equal(carbs.totalCalories, expectedCalories, `${activity}/${goal} calorie target`);
      assert.equal(carbs.percentage, 50);
      assert.equal(carbs.calories, expectedCalories * 0.5);
      assert.equal(carbs.grams, expectedCalories * 0.5 / 4);
    }
  }
  for (const percentage of [40, 55, 65, 75]) {
    const portion = calculateCarbohydratePortion(2541, percentage);
    assert.equal(portion.calories, 2541 * percentage / 100);
    assert.equal(portion.grams, portion.calories / 4);
  }
  assert.throws(() => calculateCarbs({ ...profile, goal: "maintain", percentage: 44 }), RangeError);
  assert.throws(() => calculateCarbs({ ...profile, goal: "maintain", percentage: 66 }), RangeError);
  assert.throws(() => calculateCarbohydratePortion(2541, 101), RangeError);
});

test("fat ranges and saturated-fat guidance use goal-adjusted energy for all goals and activity levels", () => {
  for (const activity of Object.keys(ACTIVITY_LEVELS)) {
    const tdee = calculateTdee({ ...profile, activity });
    for (const [goal, definition] of Object.entries(MACRO_CALORIE_GOALS)) {
      const result = calculateFatIntake({ ...profile, activity, goal });
      const target = tdee.tdee + definition.adjustmentKcal;
      assert.equal(result.calories, target, `${activity}/${goal} goal-adjusted calories`);
      assert.equal(result.minimumGrams, target * 0.2 / 9);
      assert.equal(result.maximumGrams, target * 0.35 / 9);
      assert.equal(result.midpointGrams, (result.minimumGrams + result.maximumGrams) / 2);
      assert.equal(result.saturatedFatAtTenPercent, target * 0.1 / 9);
      assert.equal(result.goals.length, GOAL_OPTIONS.length);
      assert.deepEqual(
        result.goals.map(({ goal: rowGoal, calories, minimumGrams, maximumGrams }) => [
          rowGoal,
          calories,
          minimumGrams,
          maximumGrams,
        ]),
        GOAL_OPTIONS.map(({ value, adjustmentKcal }) => {
          const goalCalories = tdee.tdee + adjustmentKcal;
          return [value, goalCalories, goalCalories * 0.2 / 9, goalCalories * 0.35 / 9];
        }),
      );
    }
  }
});

test("protein calculator reports the adult 0.8 g/kg RDA without activity or goal multipliers", () => {
  const result = calculateProtein({ weightKg: 82 });
  assert.equal(result.targetGrams, 82 * 0.8);
  assert.equal(result.targetPerKg, 0.8);
  assert.equal(calculateProtein({ weightKg: poundsToKilograms(180) }).targetGrams, poundsToKilograms(180) * 0.8);
  assert.throws(() => calculateProtein({ weightKg: 0 }), RangeError);
  assert.throws(() => calculateProtein({ weightKg: Number.NaN }), RangeError);
});

test("nutrient display conversions use avoirdupois ounces and round only for display", () => {
  assert.equal(GRAMS_PER_OUNCE, 28.349523125);
  assert.equal(formatNutrientAmount(28.349523125, "ounces"), "1.00");
  assert.equal(formatNutrientAmount(28.349523125, "grams"), "28");
  assert.equal(formatNutrientAmount(100, "ounces"), (100 / GRAMS_PER_OUNCE).toFixed(2));
  assert.equal(formatNutrientAmount(65.6, "grams"), "66");
});

test("specialized body-fat and lean-mass calculations agree for equivalent units", () => {
  const metricBodyFat = calculateBodyFat({
    sex: "male",
    age: 35,
    weight: 82,
    height: 182,
    neck: 40,
    waist: 90,
    unit: "metric",
  });
  const imperialBodyFat = calculateBodyFat({
    sex: "male",
    age: 35,
    weight: kilogramsToPounds(82),
    height: centimetersToInches(182),
    neck: centimetersToInches(40),
    waist: centimetersToInches(90),
    unit: "imperial",
  });
  assert.ok(Math.abs(metricBodyFat.bodyFatPercentage - imperialBodyFat.bodyFatPercentage) < 1e-10);

  const height = centimetersToFeetAndInches(182);
  const metricLeanMass = calculateLeanBodyMass({ age: 35, sex: "male", weight: 82, height: 182, unit: "metric" });
  const imperialLeanMass = calculateLeanBodyMass({
    age: 35,
    sex: "male",
    weight: kilogramsToPounds(82),
    height: height.feet * 12 + height.inches,
    unit: "imperial",
  });
  assert.ok(Math.abs(metricLeanMass.boer - poundsToKilograms(imperialLeanMass.boer)) < 1e-10);
  assert.ok(Math.abs(metricLeanMass.james - poundsToKilograms(imperialLeanMass.james)) < 1e-10);
  assert.ok(Math.abs(metricLeanMass.hume - poundsToKilograms(imperialLeanMass.hume)) < 1e-10);
});
