import { useMemo, useState } from "react";
import { getAllStates, getDistrictsByState } from "@/data/indiaGeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PredictionResult from "./PredictionResult";
import { predictPrice } from "@/lib/functions";
import { estimatePriceHeuristic } from "@/lib/priceHeuristic";
import { PROPERTY_TYPES } from "@/lib/propertyOptions";
import { toast } from "sonner";

interface FormData {
  area: string;
  bedrooms: string;
  state: string;
  district: string;
  propertyType: string;
  bathrooms: string;
  garage: string;
  floors: string;
  condition: string;
  yearBuilt: string;
  location: string;
}

const initialForm: FormData = {
  area: "",
  bedrooms: "",
  state: "",
  district: "",
  propertyType: "",
  bathrooms: "",
  garage: "",
  floors: "",
  condition: "",
  yearBuilt: "",
  location: "",
};

const isLandLikeType = (t: string) =>
  t === "Agricultural Land" || t === "Residential Plot / Land";

const PriceForm = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [price, setPrice] = useState<number | null>(null);
  const [estimateSource, setEstimateSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const states = useMemo(() => [...getAllStates()].sort((a, b) => a.localeCompare(b)), []);
  const districts = useMemo(() => {
    if (!form.state) return [];
    return getDistrictsByState(form.state) ?? [];
  }, [form.state]);

  const landLike = isLandLikeType(form.propertyType);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.area || Number(form.area) <= 0) e.area = "Enter a valid area (sq ft)";
    if (!form.state) e.state = "Select state";
    if (!form.district) e.district = "Select district";
    if (!form.propertyType) e.propertyType = "Select property type";

    if (landLike) {
      if (form.bedrooms === "" || Number(form.bedrooms) < 0) e.bedrooms = "Use 0 if not applicable";
    } else {
      if (!form.bedrooms || Number(form.bedrooms) < 1) e.bedrooms = "At least 1";
    }
    if (form.yearBuilt && (Number(form.yearBuilt) < 1800 || Number(form.yearBuilt) > new Date().getFullYear() + 5)) {
      e.yearBuilt = "Invalid year";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setPrice(null);
    setEstimateSource(null);

    const payload = {
      area: Number(form.area),
      bedrooms: Number(form.bedrooms) || 0,
      state: form.state,
      district: form.district,
      propertyType: form.propertyType,
      ...(form.bathrooms && { bathrooms: Number(form.bathrooms) }),
      ...(form.garage && { garage: Number(form.garage) }),
      ...(form.floors && { floors: Number(form.floors) }),
      ...(form.condition && { condition: form.condition }),
      ...(form.yearBuilt && { yearBuilt: Number(form.yearBuilt) }),
      ...(form.location && { location: form.location }),
    };

    try {
      const data = await predictPrice(payload);
      const n = Number(data.price);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error("Invalid price from server");
      }
      setPrice(n);
      setEstimateSource(data.source ?? "OpenRouter AI");
    } catch (error) {
      console.error(error);
      const fallback = estimatePriceHeuristic(payload);
      setPrice(fallback.price);
      setEstimateSource(fallback.source);
      toast.warning("Could not reach the prediction service. Showing a local estimate.", {
        description:
          "Deploy Cloud Functions and set the OPENROUTER_API_KEY secret. See backend/functions/.env.example.",
      });
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof FormData, val: string) =>
    setForm((p) => {
      const next = { ...p, [key]: val };
      if (key === "state") next.district = "";
      if (key === "propertyType") {
        const land = isLandLikeType(val);
        if (land) {
          next.bedrooms = next.bedrooms || "0";
        }
      }
      return next;
    });

  const searchQuery = [form.location, form.district, form.state, "India"]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Specific Location / Locality (Optional)</Label>
            <Input
              type="text"
              placeholder="e.g. MG Road, Andheri West"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label>State / UT</Label>
            <Select value={form.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-[min(280px,50vh)]">
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label>District</Label>
            <Select value={form.district} onValueChange={(v) => set("district", v)} disabled={!form.state}>
              <SelectTrigger>
                <SelectValue placeholder={form.state ? "Select district" : "Choose a state first"} />
              </SelectTrigger>
              <SelectContent className="max-h-[min(320px,55vh)]">
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.district && <p className="mt-1 text-xs text-destructive">{errors.district}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label>Property / building type</Label>
            <Select value={form.propertyType} onValueChange={(v) => set("propertyType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType && <p className="mt-1 text-xs text-destructive">{errors.propertyType}</p>}
          </div>

          <div>
            <Label htmlFor="area">Area (sq ft)</Label>
            <Input
              id="area"
              type="number"
              placeholder="e.g. 2000"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            />
            {errors.area && <p className="mt-1 text-xs text-destructive">{errors.area}</p>}
          </div>

          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              placeholder={landLike ? "0 for land" : "e.g. 3"}
              value={form.bedrooms}
              onChange={(e) => set("bedrooms", e.target.value)}
            />
            {errors.bedrooms && <p className="mt-1 text-xs text-destructive">{errors.bedrooms}</p>}
          </div>
          
          {!landLike && (
            <>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={0}
                  placeholder="e.g. 2"
                  value={form.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="garage">Garage (Cars)</Label>
                <Input
                  id="garage"
                  type="number"
                  min={0}
                  placeholder="e.g. 1"
                  value={form.garage}
                  onChange={(e) => set("garage", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="floors">Floors</Label>
                <Input
                  id="floors"
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={form.floors}
                  onChange={(e) => set("floors", e.target.value)}
                />
              </div>

              <div>
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Poor", "Fair", "Average", "Good", "Excellent"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  min={1800}
                  placeholder="e.g. 2015"
                  value={form.yearBuilt}
                  onChange={(e) => set("yearBuilt", e.target.value)}
                />
                {errors.yearBuilt && <p className="mt-1 text-xs text-destructive">{errors.yearBuilt}</p>}
              </div>
            </>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full text-base sm:col-span-2" disabled={loading}>
          {loading ? "Predicting..." : "Predict Price"}
        </Button>
      </form>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Location Map</h3>
          {form.state || form.location ? (
            <iframe
              className="flex-1 w-full rounded-xl"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex-1 w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Enter location or select state/district to see map
            </div>
          )}
        </div>

        {price !== null && (
          <PredictionResult
            price={price}
            location={[form.location, form.district, form.state].filter(Boolean).join(", ")}
            source={estimateSource ?? undefined}
          />
        )}
      </div>
    </div>
  );
};

export default PriceForm;
