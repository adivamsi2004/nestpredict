const apiBase = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!base) {
    console.warn("VITE_API_BASE_URL is not set; AI requests will fail until you configure it.");
  }
  return base;
};

export async function postJson<TBody extends object, TRes>(path: string, body: TBody): Promise<TRes> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & TRes;
  if (!res.ok) {
    throw new Error(data.error ?? res.statusText ?? "Request failed");
  }
  return data as TRes;
}

export async function getJson<TRes>(path: string): Promise<TRes> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & TRes;
  if (!res.ok) {
    throw new Error(data.error ?? res.statusText ?? "Request failed");
  }
  return data as TRes;
}

export type PredictPricePayload = {
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

export type PredictResult = {
  price: number;
  source: string;
};

export type PredictImagePayload = {
  imageBase64: string;
  mimeType: string;
};

export type AssessPayload = {
  image: string;
  bedrooms: number;
  area: number;
  location: string;
  property_type: string;
};

export const predictPrice = async (payload: PredictPricePayload): Promise<PredictResult> => {
  return postJson<PredictPricePayload, PredictResult>("/api/predict-price", payload);
};

export const predictImagePrice = async (payload: PredictImagePayload): Promise<PredictResult> => {
  return postJson<PredictImagePayload, PredictResult>("/api/predict-image", payload);
};

export const assessProperty = async (payload: AssessPayload): Promise<PredictResult> => {
  return postJson<AssessPayload, PredictResult>("/api/assess", payload);
};
