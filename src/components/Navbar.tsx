import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3, Info, Mail, Menu, X, Upload, Building, PlusCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import Logo from "./Logo";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Predict Price", path: "/predict", icon: BarChart3 },
  { label: "Properties", path: "/properties", icon: Building },
  { label: "List Property", path: "/list-property", icon: PlusCircle },
  { label: "About", path: "/about", icon: Info },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const toastId = toast.loading("Analyzing image...");
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE_URL}/predict-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "Image prediction failed";
        try {
          const errData = await response.json();
          if (errData.detail) errMsg = errData.detail;
        } catch (e) { }
        throw new Error(errMsg);
      }

      const data = await response.json();
      toast.success(`Estimated Price from Image: ₹${data.price.toLocaleString("en-IN")}`, { id: toastId, duration: 8000 });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze image. Ensure backend is running.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Logo className="h-8 w-auto" />
          NestPredict
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${location.pathname === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="ml-3 gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            Image Predict
          </Button>
          <Link to="/predict">
            <Button className="ml-3">Predict Now</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${location.pathname === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button
            variant="outline"
            className="mt-2 w-full gap-2"
            onClick={() => {
              setOpen(false);
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Image Predict"}
          </Button>
          <Link to="/predict" onClick={() => setOpen(false)}>
            <Button className="mt-2 w-full">Predict Now</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
