import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDb,
  addProperty,
  getProperties,
  addContactMessage,
  type PropertyInput,
  type ContactMessageInput,
} from "./firestore.js";
import {
  runAssessProperty,
  runPredictImagePrice,
  runPredictPrice,
  type AssessPayload,
  type PredictImagePayload,
  type PredictPayload,
} from "./prediction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, "server", ".env") });

const app = express();
const port = Number(process.env.PORT) || 8787;

const corsOrigin = process.env.CORS_ORIGIN?.trim();
app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(",").map((s) => s.trim()) }
      : { origin: true }
  )
);
app.use(express.json({ limit: "12mb" }));

function openRouterEnv() {
  const defaultModels = ["google/gemini-2.0-flash-001"];
  const raw = process.env.OPENROUTER_MODELS?.trim() || process.env.OPENROUTER_MODEL?.trim();
  const models = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : defaultModels;
  return {
    openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
    openrouterModels: models,
  };
}

function geminiKey(): string {
  return process.env.GEMINI_API_KEY ?? "";
}

/* ——— Health ——— */

app.get("/health", (_req, res) => {
  const db = getDb();
    res.json({ 
    status: "ok",
    database: db ? "connected" : "disconnected (missing credentials)",
    env: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

/* ——— AI Prediction routes ——— */

app.post("/api/predict-price", async (req, res) => {
  console.log("[api] POST /api/predict-price", req.body?.location);
  try {
    const out = await runPredictPrice(req.body as PredictPayload, openRouterEnv(), getDb());
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Prediction failed";
    const status = msg.includes("required") ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

app.post("/api/predict-image", async (req, res) => {
  try {
    const out = await runPredictImagePrice(req.body as PredictImagePayload, geminiKey(), getDb());
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Image prediction failed";
    const status =
      msg.includes("required") || msg.includes("Wrong image") || msg.includes("not configured") ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

app.post("/api/assess", async (req, res) => {
  try {
    const out = await runAssessProperty(req.body as AssessPayload, geminiKey(), getDb());
    res.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Assessment failed";
    const status = msg.includes("required") || msg.includes("not configured") ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

/* ——— Property routes ——— */

app.get("/api/properties", async (_req, res) => {
  try {
    const properties = await getProperties();
    res.json(properties);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch properties";
    res.status(500).json({ error: msg });
  }
});

app.post("/api/properties", async (req, res) => {
  try {
    const input = req.body as PropertyInput;
    console.log("[api] POST /api/properties", input.title);
    
    if (!input.title || !input.type || !input.location || !input.price || !input.image) {
      console.warn("[api] Missing fields in addProperty:", { 
        title: !!input.title, 
        type: !!input.type, 
        location: !!input.location, 
        price: !!input.price, 
        image: !!input.image 
      });
      res.status(400).json({ error: "Title, Type, Location, Price, and Image are all required." });
      return;
    }
    const record = await addProperty(input);
    res.status(201).json(record);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to add property";
    res.status(500).json({ error: msg });
  }
});

/* ——— Contact routes ——— */

app.post("/api/contact", async (req, res) => {
  try {
    const input = req.body as ContactMessageInput;
    if (!input.name || !input.email || !input.message) {
      res.status(400).json({ error: "name, email, and message are required." });
      return;
    }
    await addContactMessage(input);
    res.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to submit contact message";
    res.status(500).json({ error: msg });
  }
});

/* ——— Start ——— */

app.listen(port, () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`);
});
