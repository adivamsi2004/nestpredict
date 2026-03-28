import { IndianRupee, TrendingUp } from "lucide-react";

const PredictionResult = ({ price, location }: { price: number; location?: string }) => {

  return (
    <div className="animate-pop-in mt-8 rounded-2xl border-2 border-secondary bg-card p-8 text-center shadow-result">
      <div className="mx-auto mb-4 inline-flex rounded-full bg-secondary/10 p-3">
        <IndianRupee className="h-8 w-8 text-secondary" />
      </div>
      <p className="mb-1 text-sm font-medium text-muted-foreground">Predicted Property Value</p>
      <p className="font-heading text-4xl font-extrabold text-secondary sm:text-5xl">
        ₹{Math.round(price)}
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
        <TrendingUp className="h-3.5 w-3.5" />
        High confidence prediction
      </div>

      {location === "Kurnool" && (
        <div className="mt-8 overflow-hidden rounded-xl border border-secondary/20 bg-background text-left">
          <table className="w-full text-sm">
            <thead className="bg-secondary/10 text-secondary border-b border-secondary/20">
              <tr>
                <th className="px-4 py-3 font-medium">Property Type</th>
                <th className="px-4 py-3 font-medium">Avg. Price (2000 sq ft)</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">Standard Apartment</td>
                <td className="px-4 py-3">₹60L - ₹75L</td>
                <td className="px-4 py-3 text-muted-foreground">Resale</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">Independent House</td>
                <td className="px-4 py-3">₹70L - ₹90L</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">Your Match</td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">Luxury Gated Villa</td>
                <td className="px-4 py-3">₹1.2Cr+</td>
                <td className="px-4 py-3 text-muted-foreground">New/Premium</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
