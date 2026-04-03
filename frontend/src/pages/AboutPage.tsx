import AboutSection from "@/components/About";
import Features from "@/components/Features";

const AboutPage = () => (
  <div className="py-16">
    <div className="container mb-12 text-center">
      <h1 className="mb-4 font-heading text-3xl font-bold sm:text-4xl">About NestPredict</h1>
      <p className="mx-auto max-w-xl text-muted-foreground">
        We leverage AI to solve one of real estate's oldest problems — accurate property valuation. Our model is trained on thousands of data points for reliable predictions.
      </p>
    </div>
    <AboutSection />
    <Features />
  </div>
);

export default AboutPage;
