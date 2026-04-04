import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import fs from "node:fs";

let cached: Firestore | null | undefined;
const memoryCache: PropertyRecord[] = [];

export function getDb(): Firestore | null {
  if (cached !== undefined) return cached;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const path =
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

  try {
    if (getApps().length) {
      cached = getFirestore();
      return cached;
    }
    if (json) {
      initializeApp({ credential: cert(JSON.parse(json) as ServiceAccount) });
    } else if (path && fs.existsSync(path)) {
      const sa = JSON.parse(fs.readFileSync(path, "utf8")) as ServiceAccount;
      initializeApp({ credential: cert(sa) });
    } else {
      console.warn(
        "[api] Firestore writes disabled: set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_PATH, or FIREBASE_SERVICE_ACCOUNT_JSON"
      );
      cached = null;
      return null;
    }
    cached = getFirestore();
    return cached;
  } catch (e) {
    console.warn("[api] Firestore init failed:", e);
    cached = null;
    return null;
  }
}

/* ——— Property helpers ——— */

export type PropertyInput = {
  title: string;
  type: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  description?: string;
};

export type PropertyRecord = PropertyInput & {
  id: number;
  createdAt: string;
};

export async function addProperty(input: PropertyInput): Promise<PropertyRecord> {
  const record: PropertyRecord = {
    ...input,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };

  // Always add to memory cache as universal fallback for the current process
  memoryCache.push(record);

  const db = getDb();
  if (db) {
    try {
      await db.collection("properties").add(record);
    } catch (e) {
      console.warn("[api] Firestore write failed (auth?), but property is saved in memory cache.", e);
    }
  } else {
    console.warn("[api] Firestore disabled: property is only in memory cache.");
  }
  return record;
}

export async function getProperties(): Promise<PropertyRecord[]> {
  const db = getDb();
  if (!db) return memoryCache;

  try {
    const q = db.collection("properties").orderBy("id", "desc");
    const snapshot = await q.get();
    const dbResults = snapshot.docs.map((doc) => doc.data() as PropertyRecord);
    
    // Merge memory cache with DB results, uniquely by ID
    const all = [...memoryCache, ...dbResults];
    const unique = Array.from(new Map(all.map(p => [p.id, p])).values());
    return unique.sort((a, b) => b.id - a.id);
  } catch (e) {
    console.warn("[api] Firestore read failed, returning memory cache only.", e);
    return memoryCache;
  }
}

/* ——— Contact helpers ——— */

export type ContactMessageInput = {
  name: string;
  email: string;
  message: string;
};

export async function addContactMessage(input: ContactMessageInput): Promise<void> {
  const db = getDb();
  if (db) {
    await db.collection("contact_messages").add({
      ...input,
      createdAt: new Date().toISOString(),
    });
  }
}
