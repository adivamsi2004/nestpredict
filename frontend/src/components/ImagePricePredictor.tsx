import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImagePlus, Loader2, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import { predictImagePrice } from "@/lib/functions";
import { compressImage } from "@/lib/imageUtils";
import PredictionResult from "./PredictionResult";

const ImagePricePredictor = () => {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalDataUrl = reader.result as string;
        try {
          const compressed = await compressImage(originalDataUrl, 800, 800, 0.7);
          setImage(compressed);
          setPrice(null); // Reset price if image changes
        } catch (err) {
          console.error("Compression failed:", err);
          setImage(originalDataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      toast.error("Please upload an image first.");
      return;
    }

    setPredicting(true);
    const toastId = toast.loading("Analyzing property image with AI...");
    try {
      const base64Data = image.split(",")[1];
      const res = await predictImagePrice({
        imageBase64: base64Data,
        mimeType: "image/jpeg",
        location: location,
      });
      
      setPrice(res.price);
      setSource(res.source);
      toast.success("Analysis complete!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "AI prediction failed.", { id: toastId });
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="space-y-3">
          <Label className="text-base font-semibold">Upload Property Image</Label>
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
                <Upload className="mb-4 h-10 w-10 text-primary/60" />
                <p className="mb-2 font-medium">Click to upload an image</p>
                <p className="text-sm">JPG, PNG or GIF</p>
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

        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Select Location (Optional but recommended)
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-12 border-primary/20">
              <SelectValue placeholder="Select location for better accuracy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ongole">Ongole</SelectItem>
              <SelectItem value="Nellore">Nellore</SelectItem>
              <SelectItem value="Kurnool">Kurnool</SelectItem>
              <SelectItem value="Nandyala">Nandyala</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Other">Other Locations</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Specifying the location helps the AI understand local market trends.
          </p>
        </div>

        <Button 
          onClick={handlePredict} 
          size="lg" 
          className="w-full text-base h-12" 
          disabled={predicting || !image}
        >
          {predicting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Image...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze & Predict Price
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col justify-center">
        {price !== null ? (
          <PredictionResult
            price={price}
            location={location || "Location not specified"}
            source={source ?? "Gemini AI Vision"}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Price Analysis</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Upload an image of the property and we'll use advanced computer vision to estimate its market value.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePricePredictor;
