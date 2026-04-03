import { BarChart3, Layers, Timer, Smile, LineChart } from "lucide-react";

const features = [
  { icon: BarChart3, title: "ML Price Prediction", desc: "Advanced regression models trained on real estate datasets." },
  { icon: Layers, title: "Multi-Feature Analysis", desc: "Considers area, bedrooms, location, condition, and more." },
  { icon: Timer, title: "Instant Estimation", desc: "Results in under a second with our optimized pipeline." },
  { icon: Smile, title: "User-Friendly Interface", desc: "Clean, intuitive design anyone can use." },
  { icon: LineChart, title: "Real Estate Insights", desc: "Understand market trends and make informed decisions." },
];

const Features = () => (
  <section className="py-20">
    <div className="container">
      <h2 className="mb-12 text-center font-heading text-3xl font-bold sm:text-4xl">Key Features</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-0.5"
          >
            <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="mb-1 font-heading text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
