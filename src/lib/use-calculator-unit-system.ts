"use client";

import { useSyncExternalStore } from "react";

export type CalculatorUnitSystem = "metric" | "imperial";

const STORAGE_KEY = "calculator-unit-system";
const CHANGE_EVENT = "calculator-unit-system-change";
export const DEFAULT_CALCULATOR_UNIT_SYSTEM: CalculatorUnitSystem = "imperial";

export function useCalculatorUnitSystem() {
  const unitSystem = useSyncExternalStore(
    (callback) => {
      window.addEventListener(CHANGE_EVENT, callback);
      return () => window.removeEventListener(CHANGE_EVENT, callback);
    },
    () => {
      const savedUnit = window.sessionStorage.getItem(STORAGE_KEY);
      return savedUnit === "metric" || savedUnit === "imperial" ? savedUnit : DEFAULT_CALCULATOR_UNIT_SYSTEM;
    },
    () => DEFAULT_CALCULATOR_UNIT_SYSTEM,
  );

  const selectUnitSystem = (unit: CalculatorUnitSystem) => {
    window.sessionStorage.setItem(STORAGE_KEY, unit);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return [unitSystem, selectUnitSystem] as const;
}
