import { DollarSign, TrendingUp } from "lucide-react";

const PredictionResult = ({ price }: { price: number }) => (
  <div className="animate-pop-in mt-8 rounded-2xl border-2 border-secondary bg-card p-8 text-center shadow-result">
    <div className="mx-auto mb-4 inline-flex rounded-full bg-secondary/10 p-3">
      <DollarSign className="h-8 w-8 text-secondary" />
    </div>
    <p className="mb-1 text-sm font-medium text-muted-foreground">Estimated Price</p>
    <p className="font-heading text-4xl font-extrabold text-secondary sm:text-5xl">
      ${price.toLocaleString()}
    </p>
    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
      <TrendingUp className="h-3.5 w-3.5" />
      High confidence prediction
    </div>
  </div>
);

export default PredictionResult;
