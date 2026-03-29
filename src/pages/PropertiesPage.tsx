import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Home, Building, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Mock property data
const initialProperties = [
  {
    id: 1,
    title: "Modern Glass Villa",
    type: "Villa",
    location: "Ongole",
    price: 12000000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Luxury Sky Apartment",
    type: "Apartment",
    location: "Nellore",
    price: 8500000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "Classic Suburban House",
    type: "House",
    location: "Kurnool",
    price: 6500000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "Sea-View Penthouse",
    type: "Apartment",
    location: "Ongole",
    price: 25000000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    title: "Cozy Garden Villa",
    type: "Villa",
    location: "Nandyala",
    price: 9500000,
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    title: "Downtown Studio",
    type: "Apartment",
    location: "Nellore",
    price: 4500000,
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    image: "https://images.unsplash.com/photo-1502672260266-1c1e506ab68d?auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    title: "Riverside Family Home",
    type: "House",
    location: "Ongole",
    price: 7800000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
  },
  {
    id: 8,
    title: "Elegant Townhouse",
    type: "House",
    location: "Ongole",
    price: 11000000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    image: "https://images.unsplash.com/photo-1600607687931-570a2c5ea60f?auto=format&fit=crop&q=80",
  },
  {
    id: 9,
    title: "Sunset Boulevard Apartment",
    type: "Apartment",
    location: "Nellore",
    price: 6200000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80",
  },
  {
    id: 10,
    title: "Tranquil Oasis Villa",
    type: "Villa",
    location: "Nellore",
    price: 15500000,
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    image: "https://images.unsplash.com/photo-1600566752355-32e0dd79afaa?auto=format&fit=crop&q=80",
  },
  {
    id: 11,
    title: "City Center Loft",
    type: "Apartment",
    location: "Kurnool",
    price: 5400000,
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&q=80",
  },
  {
    id: 12,
    title: "Heritage Mansion",
    type: "Villa",
    location: "Kurnool",
    price: 28000000,
    bedrooms: 5,
    bathrooms: 5,
    area: 4500,
    image: "https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&q=80",
  },
  {
    id: 13,
    title: "Green Meadows Estate",
    type: "House",
    location: "Kurnool",
    price: 8900000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1900,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80",
  },
  {
    id: 14,
    title: "Hilltop Panorama Villa",
    type: "Villa",
    location: "Nandyala",
    price: 14500000,
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4ea0d?auto=format&fit=crop&q=80",
  },
  {
    id: 15,
    title: "Orchard Farmhouse",
    type: "House",
    location: "Nandyala",
    price: 7200000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    image: "https://images.unsplash.com/photo-1588880331179-bc9b9c4aadcb?auto=format&fit=crop&q=80",
  },
  {
    id: 16,
    title: "Lakeside Retreat",
    type: "House",
    location: "Nandyala",
    price: 10500000,
    bedrooms: 3,
    bathrooms: 3,
    area: 2100,
    image: "https://images.unsplash.com/photo-1528909514045-2f446ecbc7ea?auto=format&fit=crop&q=80",
  }
];

const PropertiesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [assessingId, setAssessingId] = useState<number | null>(null);

  const handleAssess = async (prop: any) => {
    setAssessingId(prop.id);
    const toastId = toast.loading(`Assessing ${prop.title} with Gemini AI...`);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_BASE_URL}/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: prop.image,
          bedrooms: prop.bedrooms,
          area: prop.area,
          location: prop.location,
          property_type: prop.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assess property.");
      }

      const data = await response.json();
      toast.success(`AI Predicted Value: ₹${data.price.toLocaleString("en-IN")}`, { 
        id: toastId, 
        duration: 8000,
        description: `Source: ${data.source}`
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to contact Gemini API.", { id: toastId });
    } finally {
      setAssessingId(null);
    }
  };

  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${API_BASE_URL}/properties`);
        if (response.ok) {
          const data = await response.json();
          // Merge db properties with initial mock properties
          if (data.properties && Array.isArray(data.properties)) {
            setProperties([...data.properties, ...initialProperties]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch properties from database", error);
        // Fallback to local storage just in case backend fails
        const saved = localStorage.getItem("listedProperties");
        if (saved) {
          try {
            setProperties([...JSON.parse(saved), ...initialProperties]);
          } catch (e) {}
        }
      } finally {
        setLoadingProperties(false);
      }
    };
    
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = prop.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prop.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || prop.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Available Properties
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse our curated selection of houses, villas, and apartments available for sale.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by location or name..." 
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 bg-card p-1 rounded-lg border border-border overflow-x-auto">
          {["All", "House", "Villa", "Apartment"].map((type) => (
            <Button 
              key={type}
              variant={filterType === type ? "default" : "ghost"}
              onClick={() => setFilterType(type)}
              className="rounded-md"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((prop) => (
            <div key={prop.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-lg">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {prop.type}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-heading text-xl font-bold line-clamp-1">{prop.title}</h3>
                
                <div className="mt-2 flex items-center text-muted-foreground">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  <span className="text-sm">{prop.location}</span>
                </div>
                
                <div className="mt-4 flex justify-between text-sm text-foreground/80 border-t border-border pt-4">
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-primary" />
                    <span>{prop.bedrooms} Bed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-primary" />
                    <span>{prop.area} sqft</span>
                  </div>
                </div>
                
                <div className="mt-5 flex items-center justify-between">
                  <div className="font-heading text-2xl font-bold text-primary">
                    ₹{prop.price.toLocaleString('en-IN')}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAssess(prop)}
                    disabled={assessingId === prop.id}
                  >
                    {assessingId === prop.id ? (
                      <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Assessing</>
                    ) : "Assess"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
