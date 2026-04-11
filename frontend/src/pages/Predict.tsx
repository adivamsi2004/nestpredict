import { useState } from "react";
import PriceForm from "@/components/PriceForm";
import ImagePricePredictor from "@/components/ImagePricePredictor";
import { BarChart3, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const Predict = () => {
  const [mode, setMode] = useState<"form" | "image">("form");

  return (
    <div className="py-16">
      <div className="container">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-accent p-3 text-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="mb-3 font-heading text-3xl font-bold sm:text-4xl">Predict House Price</h1>
          <p className="text-muted-foreground mb-8">Choose your preferred method for estimating the market value.</p>
          
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              variant={mode === "form" ? "default" : "outline"} 
              onClick={() => setMode("form")}
              className="rounded-full px-6 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Form Details
            </Button>
            <Button 
              variant={mode === "image" ? "default" : "outline"} 
              onClick={() => setMode("image")}
              className="rounded-full px-6 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Image Predict
            </Button>
          </div>
        </div>

        {mode === "form" ? <PriceForm /> : <ImagePricePredictor />}
      </div>
    </div>
  );
};

export default Predict;
