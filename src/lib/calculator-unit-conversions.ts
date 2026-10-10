const POUNDS_PER_KILOGRAM = 2.20462;
const CENTIMETERS_PER_INCH = 2.54;

export function poundsToKilograms(pounds: number) {
  return pounds / POUNDS_PER_KILOGRAM;
}

export function kilogramsToPounds(kilograms: number) {
  return kilograms * POUNDS_PER_KILOGRAM;
}

export function inchesToCentimeters(inches: number) {
  return inches * CENTIMETERS_PER_INCH;
}

export function centimetersToInches(centimeters: number) {
  return centimeters / CENTIMETERS_PER_INCH;
}

export function feetAndInchesToCentimeters(feet: number, inches: number) {
  return inchesToCentimeters(feet * 12 + inches);
}

export function centimetersToFeetAndInches(centimeters: number) {
  const totalInches = centimetersToInches(centimeters);
  const feet = Math.floor(totalInches / 12);
  return { feet, inches: totalInches - feet * 12 };
}
