import { Link } from "react-router-dom";
import { Home, Github, Linkedin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container grid gap-8 sm:grid-cols-3">
      <div>
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
          <Logo className="h-6 w-auto" />
          NestPredict
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">AI-powered house price predictions for smarter real estate decisions.</p>
      </div>
      <div>
        <h4 className="mb-3 font-heading text-sm font-semibold">Quick Links</h4>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/predict" className="hover:text-foreground">Predict</Link>
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-heading text-sm font-semibold">Connect</h4>
        <div className="flex gap-3">
          <a href="#" className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
    <div className="container mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
      © 2026 House Price Predictor. All rights reserved.
    </div>
  </footer>
);

export default Footer;
