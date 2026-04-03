import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-house.jpg";

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroImage} alt="Modern luxury house" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
    </div>

    <div className="container relative z-10 flex min-h-[600px] flex-col items-start justify-center py-24">
      <div className="animate-fade-up max-w-2xl">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
          <Sparkles className="h-4 w-4" />
          AI-Powered Predictions
        </span>
        <h1 className="mb-6 font-heading text-4xl font-extrabold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
          AI Powered House Price Prediction
        </h1>
        <p className="mb-8 max-w-lg text-lg text-primary-foreground/80">
          Estimate the market value of any property instantly using machine learning.
          Data-driven insights for smarter real estate decisions.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/predict">
            <Button size="lg" className="gap-2 text-base">
              Predict Price <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
