import { ECL, type Mode, type Mask } from "fuqr";

export const ECL_LABELS = ["7%", "15%", "25%", "30%"] as const;
export const ECL_NAMES = ["Low", "Medium", "Quartile", "High"] as const;
export type ECLName = (typeof ECL_NAMES)[number];
export const ECL_VALUE: Record<ECLName, ECL> = {
  Low: ECL.Low,
  Medium: ECL.Medium,
  Quartile: ECL.Quartile,
  High: ECL.High,
};

export const MODE_NAMES = [
  "Auto",
  "Numeric",
  "Alphanumeric",
  "Byte",
] as const satisfies string[];
export type ModeName = (typeof MODE_NAMES)[number];

export const MODE_KEY: Record<Mode | "null", ModeName> = {
  null: "Auto",
  0: "Numeric",
  1: "Alphanumeric",
  2: "Byte",
};

export const MODE_VALUE: Record<ModeName, Mode | null> = {
  Auto: null,
  Numeric: 0,
  Alphanumeric: 1,
  Byte: 2,
};

export const MASK_NAMES = [
  "Auto",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
] as const;

export type MaskName = (typeof MASK_NAMES)[number];

export const MASK_KEY: Record<Mask | "null", MaskName> = {
  null: "Auto",
  0: "0",
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
} as const;

export const MASK_VALUE: Record<MaskName, Mask | null> = {
  Auto: null,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
};

// export const FINDER_PATTERN_NAMES = ["Square", "Cross"] as const;
// export type FinderPatternName = (typeof FINDER_PATTERN_NAMES)[number];
// export const FINDER_PATTERN_VALUE: Record<FinderPatternName, FinderPattern> = {
//   Square: FinderPattern.Square,
//   Cross: FinderPattern.Cross,
// };
