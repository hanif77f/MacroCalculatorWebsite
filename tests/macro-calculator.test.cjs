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

const {
  calculateBmr,
  calculateMacros,
  calculateMacrosSafe,
  convertFeetAndInchesToCm,
  convertHeightToCm,
  convertWeightFromKg,
  convertWeightToKg,
} = require(path.join(root, "src", "lib", "calculators", "macro-calculator.ts"));
const {
  ACTIVITY_LEVELS,
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  MACRO_CALORIE_GOALS,
  MACRO_KCAL_PER_GRAM,
  MACRO_SPLITS,
} = require(path.join(root, "src", "lib", "constants.ts"));

const profile = {
  weightKg: 82,
  heightCm: 182,
  age: 35,
  sex: "male",
  activity: "moderately-active",
  formula: "mifflin",
};

test("shared activity levels expose the six required IDs and exact multipliers", () => {
  assert.deepEqual(Object.keys(ACTIVITY_LEVELS), [
    "sedentary",
    "lightly-active",
    "moderately-active",
    "active",
    "very-active",
    "extra-active",
  ]);
  assert.deepEqual(ACTIVITY_MULTIPLIERS, {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.465,
    active: 1.55,
    "very-active": 1.725,
    "extra-active": 1.9,
  });
});

test("all seven Macro Calculator goals have the required fixed daily adjustments", () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(MACRO_CALORIE_GOALS).map(([goal, definition]) => [goal, definition.adjustmentKcal])),
    {
      maintain: 0,
      "lose-mild": -250,
      "lose-standard": -500,
      "lose-fast": -1000,
      "gain-mild": 250,
      "gain-standard": 500,
      "gain-fast": 1000,
    },
  );
});

test("weekly progress estimates use explicit goal rates and omit maintenance", () => {
  const expectedWeeklyKg = {
    "lose-mild": -0.25,
    "lose-standard": -0.5,
    "lose-fast": -1,
    "gain-mild": 0.25,
    "gain-standard": 0.5,
    "gain-fast": 1,
  };

  for (const [goal, weeklyRate] of Object.entries(expectedWeeklyKg)) {
    assert.equal(MACRO_CALORIE_GOALS[goal].weeklyWeightChangeKg, weeklyRate);
    assert.equal(Math.abs(MACRO_CALORIE_GOALS[goal].weeklyWeightChangeKg * 4), Math.abs(weeklyRate) * 4);
  }
  assert.equal(MACRO_CALORIE_GOALS.maintain.weeklyWeightChangeKg, undefined);
});

test("each activity and Macro Calculator goal uses formula-precision BMR TDEE plus the fixed adjustment", () => {
  const unroundedBmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;

  for (const [activity, multiplier] of Object.entries(ACTIVITY_MULTIPLIERS)) {
    for (const [goal, definition] of Object.entries(MACRO_CALORIE_GOALS)) {
      const result = calculateMacrosSafe({ ...profile, activity, goal, split: "balanced" });
      const expectedTdee = Math.round(unroundedBmr * multiplier);
      assert.equal(result.valid, true, `${activity} / ${goal} should be valid`);
      assert.equal(result.bmr, Math.round(unroundedBmr), `${activity} / ${goal} BMR`);
      assert.equal(result.tdee, expectedTdee, `${activity} / ${goal} TDEE`);
      assert.equal(result.targetKcal, expectedTdee + definition.adjustmentKcal, `${activity} / ${goal} target`);
    }
  }
});

test("Keto split stays independent from weight-loss, maintenance, and weight-gain goals", () => {
  for (const goal of ["lose-standard", "maintain", "gain-standard"]) {
    const result = calculateMacrosSafe({ ...profile, goal, split: "keto" });
    assert.equal(result.valid, true);
    assert.equal(result.targetKcal, result.tdee + MACRO_CALORIE_GOALS[goal].adjustmentKcal);
    assert.equal(result.protein, Math.round(result.targetKcal * MACRO_SPLITS.keto[0] / MACRO_KCAL_PER_GRAM.protein));
  }
});

test("preset and custom splits use the same derived energy factors", () => {
  const cases = [
    { split: "balanced" },
    { split: "lowFat" },
    { split: "highProtein" },
    { split: "lowCarb" },
    { split: "keto" },
    { split: "custom", customSplit: [30, 35, 35] },
  ];

  for (const options of cases) {
    const result = calculateMacrosSafe({ ...profile, goal: "maintain", ...options });
    assert.equal(result.valid, true, `${options.split} split should be valid`);
    const factors = MACRO_KCAL_PER_GRAM;
    const [proteinShare, carbShare, fatShare] = options.split === "custom"
      ? options.customSplit.map((percentage) => percentage / 100)
      : MACRO_SPLITS[options.split];
    assert.deepEqual(
      [result.protein, result.carbs, result.fat],
      [
        Math.round(result.targetKcal * proteinShare / factors.protein),
        Math.round(result.targetKcal * carbShare / factors.carbs),
        Math.round(result.targetKcal * fatShare / factors.fat),
      ],
      `${options.split} grams should use shared direct allocations`,
    );
    assert.deepEqual(
      [result.actualProteinShare, result.actualCarbShare, result.actualFatShare],
      [
        result.protein * factors.protein / result.targetKcal * 100,
        result.carbs * factors.carbs / result.targetKcal * 100,
        result.fat * factors.fat / result.targetKcal * 100,
      ],
      `${options.split} percentages should reflect rounded grams using shared factors`,
    );
  }
});

test("Keto and Custom use shared gram and displayed-calorie factors at 2,541 kcal", () => {
  const input = {
    ...profile,
    weightKg: 67.2,
    heightCm: 182,
    age: 35,
    activity: "active",
    goal: "maintain",
  };
  const keto = calculateMacrosSafe({ ...input, split: "keto" });
  const custom = calculateMacrosSafe({ ...input, split: "custom", customSplit: [30, 35, 35] });
  const factors = MACRO_KCAL_PER_GRAM;

  assert.equal(keto.targetKcal, 2541);
  assert.deepEqual([keto.protein, keto.carbs, keto.fat], [155, 34, 202]);
  assert.deepEqual(
    [keto.protein, keto.carbs, keto.fat].map((grams, index) =>
      Math.round(grams * [factors.protein, factors.carbs, factors.fat][index])),
    [636, 128, 1778],
  );

  assert.equal(custom.targetKcal, 2541);
  assert.deepEqual([custom.protein, custom.carbs, custom.fat], [186, 237, 101]);
  assert.deepEqual(
    [custom.protein, custom.carbs, custom.fat].map((grams, index) =>
      Math.round(grams * [factors.protein, factors.carbs, factors.fat][index])),
    [763, 889, 889],
  );
});

test("verified preset profiles match reference macro grams", () => {
  const profiles = [
    {
      input: {
        weightKg: convertWeightToKg(200, "lb"),
        heightCm: convertFeetAndInchesToCm(6, 0),
        age: 30,
        sex: "male",
        activity: "sedentary",
        goal: "maintain",
        formula: "mifflin",
      },
      tdee: 2286,
      macros: {
        balanced: [139, 305, 65],
        lowFat: [153, 320, 52],
        lowCarb: [167, 244, 78],
        highProtein: [195, 259, 58],
      },
    },
    {
      input: {
        weightKg: convertWeightToKg(165, "lb"),
        heightCm: convertFeetAndInchesToCm(5, 10),
        age: 25,
        sex: "male",
        activity: "lightly-active",
        goal: "maintain",
        formula: "mifflin",
      },
      tdee: 2392,
      macros: {
        balanced: [146, 319, 68],
        lowFat: [160, 335, 54],
        lowCarb: [175, 255, 82],
        highProtein: [204, 271, 61],
      },
    },
  ];

  const splitNames = {
    balanced: "balanced",
    lowFat: "lowFat",
    lowCarb: "lowCarb",
    highProtein: "highProtein",
  };

  for (const { input, tdee, macros } of profiles) {
    const splitValues = {
      balanced: MACRO_SPLITS.balanced,
      lowFat: MACRO_SPLITS.lowFat,
      lowCarb: MACRO_SPLITS.lowCarb,
      highProtein: MACRO_SPLITS.highProtein,
    };
    for (const [name, split] of Object.entries(splitNames)) {
      const result = calculateMacrosSafe({ ...input, split });
      assert.equal(result.valid, true);
      assert.equal(result.tdee, tdee);
      assert.deepEqual(
        [result.protein, result.carbs, result.fat],
        macros[name],
        `${name} should match the verified reference profile`,
      );
      assert.deepEqual(MACRO_SPLITS[split], splitValues[name]);
    }
  }
});

test("the public legacy calculation API uses reference formulas for explicitly selected presets", () => {
  const input = { ...profile, goal: "maintain", split: "balanced" };
  const safeResult = calculateMacrosSafe(input);
  const legacyApiResult = calculateMacros(input);

  assert.deepEqual(
    [legacyApiResult.protein, legacyApiResult.carbs, legacyApiResult.fat],
    [safeResult.protein, safeResult.carbs, safeResult.fat],
  );
});

test("all BMR formula calculations remain rounded and supported", () => {
  const expectedBmr = {
    mifflin: Math.round(10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5),
    harris: Math.round(13.397 * profile.weightKg + 4.799 * profile.heightCm - 5.677 * profile.age + 88.362),
    katch: Math.round(370 + 21.6 * profile.weightKg * 0.8),
    cunningham: Math.round(500 + 22 * profile.weightKg * 0.8),
  };

  for (const [formula, bmr] of Object.entries(expectedBmr)) {
    assert.equal(calculateBmr({ ...profile, formula, bodyFatPct: formula === "katch" || formula === "cunningham" ? 20 : undefined }).bmr, bmr);
  }
});

test("metric and imperial conversions produce equivalent calculator results", () => {
  const weightKg = convertWeightToKg(82 * 2.20462, "lb");
  const heightCm = convertHeightToCm(182 / 2.54, "in");
  assert.ok(Math.abs(weightKg - 82) < 1e-10);
  assert.ok(Math.abs(heightCm - 182) < 1e-10);
  assert.equal(convertFeetAndInchesToCm(5, 11), (5 * 12 + 11) * 2.54);

  const metric = calculateMacrosSafe({ ...profile, goal: "maintain", split: "balanced" });
  const imperial = calculateMacrosSafe({ ...profile, weightKg, heightCm, goal: "maintain", split: "balanced" });
  assert.equal(imperial.valid, true);
  assert.equal(metric.targetKcal, imperial.targetKcal);
  assert.deepEqual(
    [metric.protein, metric.carbs, metric.fat],
    [imperial.protein, imperial.carbs, imperial.fat],
  );
});

test("unit conversions preserve precision across repeated unit switches", () => {
  const weightKg = 80;
  const heightCm = 178;
  for (let index = 0; index < 100; index += 1) {
    const displayedPounds = convertWeightFromKg(weightKg, "lb");
    const displayedInches = heightCm / 2.54;
    assert.ok(Math.abs(displayedPounds - 176.3696) < 0.001);
    assert.ok(Math.abs(displayedInches - 70.07874) < 0.001);
  }
  assert.equal(weightKg, 80);
  assert.equal(heightCm, 178);
});

test("canonical minimum and maximum weight and height values are valid while out-of-range values are rejected", () => {
  for (const weightKg of [30, 300]) {
    for (const heightCm of [120, 250]) {
      const result = calculateMacrosSafe({
        ...profile,
        weightKg,
        heightCm,
        goal: "maintain",
        split: "balanced",
      });
      assert.equal(result.valid, true, `${weightKg} kg / ${heightCm} cm should be valid`);
    }
  }

  for (const [weightKg, heightCm] of [[29.9, 180], [300.1, 180], [80, 119.9], [80, 250.1]]) {
    const result = calculateMacrosSafe({
      ...profile,
      weightKg,
      heightCm,
      goal: "maintain",
      split: "balanced",
    });
    assert.equal(result.valid, false, `${weightKg} kg / ${heightCm} cm should be invalid`);
  }
});

test("low calorie targets warn and invalid inputs remain invalid", () => {
  const lowTarget = calculateMacrosSafe({
    weightKg: 65,
    heightCm: 170,
    age: 40,
    sex: "male",
    activity: "sedentary",
    goal: "lose-fast",
    formula: "mifflin",
    split: "balanced",
  });
  assert.equal(lowTarget.valid, true);
  assert.ok(lowTarget.warnings.some((warning) => warning.includes("1,500 kcal/day")));

  const invalid = calculateMacrosSafe({ ...profile, age: 17, goal: "maintain", split: "balanced" });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length > 0);
});

test("legacy percentage-based goals remain available to existing callers", () => {
  const result = calculateMacros({ ...profile, activity: "moderately-active", goal: "lose" });
  const rawBmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const rawTdee = rawBmr * ACTIVITY_MULTIPLIERS[profile.activity];
  assert.equal(result.targetKcal, Math.round(rawTdee * (1 + GOAL_CALORIE_ADJUSTMENTS.lose)));
});

test("the shared calculator accepts fixed-kcal Macro goals without a split", () => {
  const result = calculateMacros({ ...profile, goal: "lose-standard" });
  assert.equal(result.targetKcal, result.tdee - 500);
});
