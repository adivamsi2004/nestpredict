import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PredictionResult from "./PredictionResult";

interface FormData {
  area: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  yearBuilt: string;
  location: string;
  condition: string;
  garage: string;
}

const initialForm: FormData = {
  area: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  yearBuilt: "",
  location: "",
  condition: "",
  garage: "",
};

const PriceForm = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.area || Number(form.area) <= 0) e.area = "Enter a valid area";
    if (!form.bedrooms || Number(form.bedrooms) < 1) e.bedrooms = "At least 1";
    if (!form.bathrooms || Number(form.bathrooms) < 1) e.bathrooms = "At least 1";
    if (!form.floors || Number(form.floors) < 1) e.floors = "At least 1";
    if (!form.yearBuilt || Number(form.yearBuilt) < 1800 || Number(form.yearBuilt) > 2026) e.yearBuilt = "Enter valid year";
    if (!form.location) e.location = "Select location";
    if (!form.condition) e.condition = "Select condition";
    if (!form.garage) e.garage = "Select option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setPrice(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: Number(form.area),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          floors: Number(form.floors),
          yearBuilt: Number(form.yearBuilt),
          location: form.location,
          condition: form.condition,
          garage: form.garage,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setPrice(data.price);
    } catch (error) {
      console.error(error);
      alert(`Failed to get prediction passing to backend. Please check your backend is deployed properly or VITE_API_BASE_URL is set in Vercel.`);
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Area */}
          <div>
            <Label htmlFor="area">Area (sq ft)</Label>
            <Input id="area" type="number" placeholder="e.g. 2000" value={form.area} onChange={(e) => set("area", e.target.value)} />
            {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
          </div>
          {/* Bedrooms */}
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" placeholder="e.g. 3" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
            {errors.bedrooms && <p className="mt-1 text-xs text-destructive">{errors.bedrooms}</p>}
          </div>
          {/* Bathrooms */}
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" placeholder="e.g. 2" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
            {errors.bathrooms && <p className="mt-1 text-xs text-destructive">{errors.bathrooms}</p>}
          </div>
          {/* Floors */}
          <div>
            <Label htmlFor="floors">Floors</Label>
            <Input id="floors" type="number" placeholder="e.g. 2" value={form.floors} onChange={(e) => set("floors", e.target.value)} />
            {errors.floors && <p className="mt-1 text-xs text-destructive">{errors.floors}</p>}
          </div>
          {/* Year Built */}
          <div>
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input id="yearBuilt" type="number" placeholder="e.g. 2018" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} />
            {errors.yearBuilt && <p className="mt-1 text-xs text-destructive">{errors.yearBuilt}</p>}
          </div>
          {/* Location */}
          <div>
            <Label>Location</Label>
            <Select value={form.location} onValueChange={(v) => set("location", v)}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ongole">Ongole</SelectItem>
                <SelectItem value="Nellore">Nellore</SelectItem>
                <SelectItem value="Kurnool">Kurnool</SelectItem>
                <SelectItem value="Nandyala">Nandyala</SelectItem>
              </SelectContent>
            </Select>
            {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
          </div>
          {/* Condition */}
          <div>
            <Label>Condition</Label>
            <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
              <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && <p className="mt-1 text-xs text-destructive">{errors.condition}</p>}
          </div>
          {/* Garage */}
          <div>
            <Label>Garage</Label>
            <Select value={form.garage} onValueChange={(v) => set("garage", v)}>
              <SelectTrigger><SelectValue placeholder="Has garage?" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.garage && <p className="mt-1 text-xs text-destructive">{errors.garage}</p>}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full text-base" disabled={loading}>
          {loading ? "Predicting..." : "Predict Price"}
        </Button>
      </form>

      {price !== null && <PredictionResult price={price} location={form.location} />}
    </div>
  );
};

export default PriceForm;
