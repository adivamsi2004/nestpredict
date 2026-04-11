import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Home, IndianRupee, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { addProperty } from "@/lib/firestore";
import { compressImage } from "@/lib/imageUtils";
import { predictImagePrice } from "@/lib/functions";
import { Loader2, Sparkles } from "lucide-react";

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalDataUrl = reader.result as string;
        try {
          // Compress immediately to ensure it fits in Firestore (under 1MB)
          const compressed = await compressImage(originalDataUrl, 800, 800, 0.7);
          setImage(compressed);
        } catch (err) {
          console.error("Compression failed:", err);
          setImage(originalDataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiPredict = async () => {
    if (predicting) return;
    if (!image) {
      toast.error("Please upload an image first.");
      return;
    }

    if (!formData.location) {
      toast.warning("Location not selected", {
        description: "Selecting a location first helps the AI provide a more accurate price estimate."
      });
    }

    setPredicting(true);
    const toastId = toast.loading("Analyzing property with AI...");
    try {
      const base64Data = image.split(",")[1];
      const res = await predictImagePrice({
        imageBase64: base64Data,
        mimeType: "image/jpeg",
        location: formData.location,
      });
      
      setFormData(prev => ({ ...prev, price: res.price.toString() }));
      toast.success(`AI suggested a price of ₹${res.price.toLocaleString("en-IN")}`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "AI prediction failed. Please enter price manually.", { id: toastId });
    } finally {
      setPredicting(false);
    }
  };

  const setField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.type || !formData.location || !formData.price || !image) {
      toast.error("Required Field Missing", {
        description: "Please fill Title, Type, Location, Price, and upload an image.",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      await addProperty({
        title: formData.title,
        type: formData.type || "House",
        location: formData.location,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area: Number(formData.area) || 0,
        image: image!,
        description: formData.description || "",
      });
      toast.success("Property listed successfully!");
      navigate("/properties");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to list property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl flex items-center justify-center gap-3">
          <Home className="h-10 w-10 text-primary" />
          List Your Property
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Sell your house, villa, or apartment directly to customers using our platform. Upload an image and set your price.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image Upload Area */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Property Image</Label>
            <div className="relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted overflow-hidden">
              {image ? (
                <>
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium flex items-center gap-2">
                      <ImagePlus className="w-5 h-5" /> Change Image
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="mb-4 h-10 w-10" />
                  <p className="mb-2 font-medium">Click to upload an image</p>
                  <p className="text-sm">SVG, PNG, JPG or GIF</p>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 cursor-pointer opacity-0" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

            <div className="grid gap-6 md:grid-cols-2 p-1 border-y border-border/50 py-6 mb-6">
              
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  Property Title <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Modern Glass Villa" 
                  className="h-12 border-primary/20 focus:border-primary"
                  value={formData.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(v) => setField("type", v)}>
                  <SelectTrigger className="h-12 border-primary/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Independent House / Bungalow">Bungalow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2">
              
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Location <span className="text-destructive">*</span>
                </Label>
              <Select value={formData.location} onValueChange={(v) => setField("location", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ongole">Ongole</SelectItem>
                  <SelectItem value="Nellore">Nellore</SelectItem>
                  <SelectItem value="Kurnool">Kurnool</SelectItem>
                  <SelectItem value="Nandyala">Nandyala</SelectItem>
                  <SelectItem value="Other">Other Locations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">Asking Price (₹)</Label>
                {image && (
                  <button
                    type="button"
                    onClick={handleAiPredict}
                    disabled={predicting}
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    {predicting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Suggest with AI
                  </button>
                )}
              </div>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="price" 
                  type="number"
                  placeholder="e.g. 15000000" 
                  className="pl-9"
                  value={formData.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input 
                id="bedrooms" 
                type="number" 
                placeholder="e.g. 3" 
                value={formData.bedrooms}
                onChange={(e) => setField("bedrooms", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Total Area (sq ft)</Label>
              <Input 
                id="area" 
                type="number" 
                placeholder="e.g. 2000" 
                value={formData.area}
                onChange={(e) => setField("area", e.target.value)}
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Property Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Tell customers more about your property..." 
              className="resize-none h-32"
              value={formData.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading}>
            {loading ? "Listing Property..." : "Publish Listing"}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            By listing, you agree that you are legally authorized to sell this property.
          </p>

        </form>
      </div>
    </div>
  );
};

export default ListPropertyPage;
