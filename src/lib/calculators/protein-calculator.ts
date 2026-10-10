export const ADULT_PROTEIN_RDA_G_PER_KG = 0.8;

export interface ProteinInput {
  weightKg: number;
}

export interface ProteinResult {
  targetGrams: number;
  targetPerKg: number;
}

export function calculateProtein(input: ProteinInput): ProteinResult {
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    throw new RangeError("Weight must be a positive number.");
  }

  return {
    targetGrams: input.weightKg * ADULT_PROTEIN_RDA_G_PER_KG,
    targetPerKg: ADULT_PROTEIN_RDA_G_PER_KG,
  };
}
