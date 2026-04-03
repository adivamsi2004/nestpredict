/** Building / land categories sent to OpenRouter + heuristic. */
export const PROPERTY_TYPES = [
  "Apartment / Flat",
  "Independent House / Bungalow",
  "Villa",
  "Residential Plot / Land",
  "Commercial Building / Shop",
  "Agricultural Land",
  "Industrial / Warehouse",
] as const;

export type PropertyTypeId = (typeof PROPERTY_TYPES)[number];
