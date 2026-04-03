import { Brain, Zap, TrendingUp } from "lucide-react";

const cards = [
  { icon: Brain, title: "Smart Prediction", desc: "Our AI model analyzes dozens of property features to deliver accurate price estimates." },
  { icon: Zap, title: "Real-Time Estimation", desc: "Get instant results powered by optimized algorithms — no waiting required." },
  { icon: TrendingUp, title: "Data-Driven Insights", desc: "Backed by real market data so you can make confident buying and selling decisions." },
];

const AboutSection = () => (
  <section id="about" className="bg-card py-20">
    <div className="container">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="mb-4 font-heading text-3xl font-bold sm:text-4xl">Why Choose NestPredict?</h2>
        <p className="text-muted-foreground">
          Traditional property valuation is slow and subjective. Our AI model removes guesswork, giving buyers, sellers, and agents a clear picture of market value.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="group rounded-2xl border border-border bg-background p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-5 inline-flex rounded-xl bg-accent p-3 text-primary">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold">{c.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
