import { Star } from "lucide-react";

const testimonials = [
  { name: "Sarah Mitchell", role: "Home Buyer", text: "Very helpful tool for estimating property values. It gave me confidence before making an offer." },
  { name: "James Parker", role: "Real Estate Agent", text: "Simple and powerful AI prediction. I use it daily to give clients quick estimates." },
  { name: "Priya Sharma", role: "Property Investor", text: "The accuracy is impressive. It's now an essential part of my investment analysis workflow." },
];

const Testimonials = () => (
  <section className="bg-card py-20">
    <div className="container">
      <h2 className="mb-12 text-center font-heading text-3xl font-bold sm:text-4xl">What People Say</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-2xl border border-border bg-background p-6 shadow-card">
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
            <div>
              <p className="font-heading text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
