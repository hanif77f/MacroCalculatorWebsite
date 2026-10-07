export type LeanMassSex = "male" | "female";
export type LeanMassUnit = "metric" | "imperial";

export interface LeanBodyMassInput {
  age: number;
  sex: LeanMassSex;
  weight: number;
  height: number;
  unit: LeanMassUnit;
}

export interface LeanBodyMassResult {
  boer: number;
  james: number;
  hume: number;
  minimum: number;
  maximum: number;
  unit: LeanMassUnit;
}

export function calculateLeanBodyMass(input: LeanBodyMassInput): LeanBodyMassResult {
  const { age, sex, weight, height, unit } = input;
  if (!Number.isInteger(age) || age < 18 || age > 100) {
    throw new RangeError("Age must be between 18 and 100.");
  }
  if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError("Weight and height must be positive numbers.");
  }

  const weightKg = unit === "imperial" ? weight / 2.20462 : weight;
  const heightCm = unit === "imperial" ? height * 2.54 : height;
  const weightToHeightSquared = (weightKg / heightCm) ** 2;
  const values = sex === "male"
    ? [
      0.407 * weightKg + 0.267 * heightCm - 19.2,
      1.1 * weightKg - 128 * weightToHeightSquared,
      0.3281 * weightKg + 0.33929 * heightCm - 29.5336,
    ]
    : [
      0.252 * weightKg + 0.473 * heightCm - 48.3,
      1.07 * weightKg - 148 * weightToHeightSquared,
      0.29569 * weightKg + 0.41813 * heightCm - 43.2933,
    ];

  if (values.some((value) => !Number.isFinite(value) || value <= 0 || value > weightKg)) {
    throw new RangeError("These measurements produced an implausible lean mass estimate. Check your entries.");
  }

  const outputFactor = unit === "imperial" ? 2.20462 : 1;
  const [boer, james, hume] = values.map((value) => value * outputFactor);
  return {
    boer,
    james,
    hume,
    minimum: Math.min(boer, james, hume),
    maximum: Math.max(boer, james, hume),
    unit,
  };
}
