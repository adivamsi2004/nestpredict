import type { Part } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Firestore } from "firebase-admin/firestore";

export type PredictPayload = {
  area: number;
  bedrooms: number;
  state: string;
  district: string;
  propertyType: string;
  bathrooms?: number;
  garage?: number;
  floors?: number;
  condition?: string;
  yearBuilt?: number;
  location?: string;
};

export type AssessPayload = {
  image: string;
  bedrooms: number;
  area: number;
  location: string;
  property_type: string;
};

export type PredictImagePayload = {
  imageBase64: string;
  mimeType: string;
};

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

export const heuristicPriceInr = (payload: PredictPayload): number => {
  const isLandLike =
    payload.propertyType === "Agricultural Land" || payload.propertyType === "Residential Plot / Land";
  const tier = STATE_PRICE_TIER[payload.state] ?? 0.95;
  const base = PROPERTY_TYPE_BASE_PER_SQFT[payload.propertyType] ?? 3800;
  let p = base * payload.area * tier;
  if (!isLandLike) {
    p += payload.bedrooms * 240000;
  }
  return Math.round(p);
};

export const predictPriceViaOpenRouter = async (
  prompt: string,
  apiKey: string,
  model: string
): Promise<string> => {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/house-price-pro",
      "X-Title": "House Price Pro",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenRouter HTTP ${res.status}: ${raw.slice(0, 500)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
};

export const parsePrice = (raw: string): number => {
  const clean = raw.replace(/[^\d.]/g, "").trim();
  const price = Number(clean);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Unable to parse price from AI response.");
  }
  return price;
};

export async function runPredictPrice(
  payload: PredictPayload,
  env: { openrouterApiKey: string; openrouterModels: string[] },
  db: Firestore | null
): Promise<{ price: number; source: string }> {
  if (!payload?.area || !payload.state?.trim() || !payload.district?.trim() || !payload.propertyType?.trim()) {
    throw new Error("State, district, property type, and area are required.");
  }

  const locationLabel = `${payload.location ? payload.location + ", " : ""}${payload.district.trim()}, ${payload.state.trim()}, India`;

  let extraDetails = "";
  if (payload.bathrooms !== undefined) extraDetails += `Bathrooms: ${payload.bathrooms}\n`;
  if (payload.garage !== undefined) extraDetails += `Garage capacity: ${payload.garage} cars\n`;
  if (payload.floors !== undefined) extraDetails += `Number of floors: ${payload.floors}\n`;
  if (payload.condition) extraDetails += `Condition: ${payload.condition}\n`;
  if (payload.yearBuilt) extraDetails += `Year Built: ${payload.yearBuilt}\n`;

  const prompt = `
You are an expert real estate appraiser in India.
Estimate the current realistic total market price in Indian Rupees (INR) for this property based on the following details:

Location: ${locationLabel}
Property type: ${payload.propertyType}
Area: ${payload.area} sq ft
Bedrooms: ${payload.bedrooms}
${extraDetails}
Use typical ${payload.district} / ${payload.state} market rates for ${payload.propertyType}. Respond with ONE number only: estimated price in INR. No commas, symbols, units, or words.
`.trim();

  let predictedPrice: number = 0;
  let source: string = "";

  const apiKey = env.openrouterApiKey.trim();
  if (!apiKey) {
    predictedPrice = heuristicPriceInr(payload);
    source = "Heuristic estimate (set OPENROUTER_API_KEY for OpenRouter AI)";
  } else {
    // Fallback chain: try each model in order
    let succeeded = false;
    const errors: string[] = [];
    for (const model of env.openrouterModels) {
      try {
        console.log(`[api] Trying model: ${model}`);
        const text = await predictPriceViaOpenRouter(prompt, apiKey, model);
        predictedPrice = parsePrice(text);
        source = `OpenRouter (${model})`;
        succeeded = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[api] Model ${model} failed: ${msg.slice(0, 200)}`);
        errors.push(`${model}: ${msg.slice(0, 100)}`);
      }
    }
    if (!succeeded) {
      predictedPrice = heuristicPriceInr(payload);
      source = `Heuristic estimate (all ${env.openrouterModels.length} models failed)`;
      console.warn("[api] All models failed, using heuristic. Errors:", errors);
    }
  }

  if (db) {
    await db.collection("price_predictions").add({
      timestamp: new Date().toISOString(),
      property_details: { ...payload, locationLabel },
      predicted_price_inr: predictedPrice,
      source,
      kind: "form",
    });
  }

  return { price: predictedPrice, source };
}

export async function runPredictImagePrice(
  payload: PredictImagePayload,
  geminiApiKey: string,
  db: Firestore | null
): Promise<{ price: number; source: string }> {
  if (!payload?.imageBase64 || !payload?.mimeType) {
    throw new Error("Image data is required.");
  }
  if (!geminiApiKey) {
    console.warn("[api] GEMINI_API_KEY not set. Using heuristic fallback.");
    // Return a baseline estimate so the UI remains functional for the user
    return { price: 8500000, source: "Heuristic (Gemini API Key missing)" };
  }

  const ai = new GoogleGenerativeAI(geminiApiKey);
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];
  
  try {
    let response;
    for (const modelName of modelsToTry) {
      try {
        console.log(`[api] Trying Gemini: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName });
        const prompt = `
  You are an expert real estate appraiser in India. Analyze this house image. 
  Respond ONLY with a single numeric market price in INR. No units, no text.
  `.trim();

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: payload.imageBase64, mimeType: payload.mimeType } }] }],
          generationConfig: { temperature: 0 },
        });
        response = result.response;
        if (response) break;
      } catch (mErr) {
        console.warn(`[api] Model ${modelName} failed:`, mErr instanceof Error ? mErr.message : mErr);
      }
    }

    if (!response) throw new Error("No AI response");

    const text = (response.text() ?? "").trim();
    if (text.includes("NOT_A_HOUSE")) throw new Error("Wrong image type");

    const predictedPrice = parsePrice(text);
    if (db) {
      await db.collection("price_predictions").add({
        timestamp: new Date().toISOString(),
        predicted_price_inr: predictedPrice,
        source: "Gemini AI Vision",
        kind: "image",
      });
    }
    return { price: predictedPrice, source: "Gemini AI Vision" };
  } catch (err) {
    console.warn("[api] Gemini failed completely, using heuristic fallback.", err);
    return { price: 9200000, source: "Heuristic estimate (AI unavailable)" };
  }
}

export async function runAssessProperty(
  payload: AssessPayload,
  geminiApiKey: string,
  db: Firestore | null
): Promise<{ price: number; source: string }> {
  if (!payload?.image || !payload?.location) {
    throw new Error("Image and location are required.");
  }
  if (!geminiApiKey) {
    console.warn("[api] GEMINI_API_KEY not set. Using heuristic fallback for assessment.");
    const p = heuristicPriceInr({
      area: payload.area,
      bedrooms: payload.bedrooms,
      state: "Maharashtra", // Generic baseline
      district: payload.location,
      propertyType: payload.property_type
    });
    return { price: p, source: "Heuristic (Gemini API Key missing)" };
  }

  const ai = new GoogleGenerativeAI(geminiApiKey);
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];
  
  try {
    let response;
    for (const modelName of modelsToTry) {
      try {
        console.log(`[api] Assessing with Gemini: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName });
        const prompt = `
You are an expert real estate appraiser in India.
Analyze the attached property image and details:
Location: ${payload.location}
Type: ${payload.property_type}
Bedrooms: ${payload.bedrooms}
Area: ${payload.area} sq ft

Respond ONLY with a single numeric INR value.
`.trim();

        const imageBase64 = payload.image.includes(",") ? payload.image.split(",")[1] : payload.image;
        const mimeTypeMatch = payload.image.match(/^data:(.*?);base64,/);
        const mimeType = mimeTypeMatch?.[1] || "image/jpeg";

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: imageBase64, mimeType } }] }],
          generationConfig: { temperature: 0 },
        });
        response = result.response;
        if (response) break;
      } catch (mErr) {
        console.warn(`[api] Assessment model ${modelName} failed:`, mErr instanceof Error ? mErr.message : mErr);
      }
    }

    if (!response) throw new Error("No AI response");

    const predictedPrice = parsePrice(response.text() ?? "");
    if (db) {
      await db.collection("price_predictions").add({
        timestamp: new Date().toISOString(),
        property_details: payload,
        predicted_price_inr: predictedPrice,
        source: "Gemini AI Visual + Specs",
        kind: "assess",
      });
    }
    return { price: predictedPrice, source: "Gemini AI Visual + Specs" };
  } catch (err) {
    console.warn("[api] Gemini Assessment failed, using heuristic fallback.", err);
    // Use the reliable heuristic calculator
    const p = heuristicPriceInr({
      area: payload.area,
      bedrooms: payload.bedrooms,
      state: "Maharashtra", // Generic mid-tier baseline
      district: payload.location,
      propertyType: payload.property_type
    });
    return { price: p, source: "Heuristic (Gemini AI failed)" };
  }
}
