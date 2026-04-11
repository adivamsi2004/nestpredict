import type { PredictPricePayload } from "@/lib/functions";

const STATE_PRICE_TIER: Record<string, number> = {
  Maharashtra: 1.28,
  Karnataka: 1.22,
  "Tamil Nadu": 1.12,
  Telangana: 1.08,
  Gujarat: 1.1,
  Delhi: 1.45,
  Haryana: 1.15,
  "Uttar Pradesh": 0.92,
  "West Bengal": 0.95,
  Rajasthan: 0.9,
  "Madhya Pradesh": 0.88,
  Punjab: 1.05,
  Bihar: 0.78,
  Odisha: 0.85,
  "Andhra Pradesh": 0.92,
  Kerala: 1.05,
  Assam: 0.82,
  Jharkhand: 0.8,
  Chhattisgarh: 0.82,
  Uttarakhand: 0.95,
  "Himachal Pradesh": 0.95,
  Goa: 1.25,
  Tripura: 0.78,
  Meghalaya: 0.8,
  Manipur: 0.78,
  Nagaland: 0.76,
  "Arunachal Pradesh": 0.75,
  Mizoram: 0.76,
  Sikkim: 0.88,
  Chandigarh: 1.2,
  Puducherry: 1.0,
  "Jammu and Kashmir": 0.9,
  Ladakh: 0.85,
  "Andaman and Nicobar Islands": 0.85,
  "Dadra and Nagar Haveli and Daman and Diu": 0.9,
  Lakshadweep: 0.88,
};

const PROPERTY_TYPE_BASE_PER_SQFT: Record<string, number> = {
  "Apartment / Flat": 4200,
  "Independent House / Bungalow": 4000,
  Villa: 5600,
  "Residential Plot / Land": 3000,
  "Commercial Building / Shop": 7200,
  "Agricultural Land": 420,
  "Industrial / Warehouse": 3800,
};

/** Offline estimate when Cloud Function / OpenRouter is unavailable (mirrors Cloud Function heuristic). */
export function estimatePriceHeuristic(payload: PredictPricePayload): { price: number; source: string } {
  const isLandLike =
    payload.propertyType === "Agricultural Land" || payload.propertyType === "Residential Plot / Land";
  const tier = STATE_PRICE_TIER[payload.state] ?? 0.95;
  const base = PROPERTY_TYPE_BASE_PER_SQFT[payload.propertyType] ?? 3800;
  let p = base * payload.area * tier;
  if (!isLandLike) {
    p += payload.bedrooms * 240_000;
  }
  return {
    price: Math.round(p),
    source: "Local heuristic (OpenRouter / Cloud Function unavailable)",
  };
}
