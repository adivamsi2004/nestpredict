import PriceForm from "@/components/PriceForm";
import { BarChart3 } from "lucide-react";

const Predict = () => (
  <div className="py-16">
    <div className="container">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-accent p-3 text-primary">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h1 className="mb-3 font-heading text-3xl font-bold sm:text-4xl">Predict House Price</h1>
        <p className="text-muted-foreground">Enter your property details below and our AI model will estimate the market value.</p>
      </div>
      <PriceForm />
    </div>
  </div>
);

export default Predict;
