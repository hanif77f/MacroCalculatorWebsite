import type { MacroInput } from "@/lib/calculators/macro-calculator";

export type ProteinActivity = MacroInput["activity"];
export type ProteinGoal = "maintain" | "lose" | "build";

export interface ProteinInput {
  weightKg: number;
  activity: ProteinActivity;
  goal: ProteinGoal;
}

export interface ProteinResult {
  minimum: number;
  target: number;
  maximum: number;
  minimumPerKg: number;
  targetPerKg: number;
  maximumPerKg: number;
}

const maintenanceRanges: Record<ProteinActivity, readonly [number, number]> = {
  sedentary: [0.8, 1.2],
  light: [1.2, 1.6],
  moderate: [1.4, 1.8],
  veryActive: [1.4, 2],
  extremelyActive: [1.4, 2],
};

const activityRanges: Record<Exclude<ProteinGoal, "maintain">, Record<ProteinActivity, readonly [number, number]>> = {
  lose: {
    sedentary: [1.2, 1.6],
    light: [1.4, 1.8],
    moderate: [1.6, 2],
    veryActive: [1.6, 2],
    extremelyActive: [1.6, 2],
  },
  build: {
    sedentary: [1.2, 1.6],
    light: [1.4, 1.8],
    moderate: [1.4, 2],
    veryActive: [1.6, 2],
    extremelyActive: [1.6, 2],
  },
};

export function calculateProtein(input: ProteinInput): ProteinResult {
  const [minimumPerKg, maximumPerKg] = input.goal === "maintain"
    ? maintenanceRanges[input.activity]
    : activityRanges[input.goal][input.activity];
  const targetPerKg = (minimumPerKg + maximumPerKg) / 2;

  return {
    minimum: Math.round(input.weightKg * minimumPerKg),
    target: Math.round(input.weightKg * targetPerKg),
    maximum: Math.round(input.weightKg * maximumPerKg),
    minimumPerKg,
    targetPerKg,
    maximumPerKg,
  };
}
