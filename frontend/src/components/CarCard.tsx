import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Car } from "@/hooks/useCars";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface CarCardProps {
  car: Car;
  view?: "grid" | "list";
  isVisible?: boolean;
  delay?: number;
}

export function CarCard({ car, view = "grid", isVisible = true, delay = 0 }: CarCardProps) {
  const { t } = useLanguage();
  const { isSaved, toggleSave } = useSavedCars();
  const { user } = useAuth();
  const { toast } = useToast();

  const saved = isSaved(car.id);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: t("signInToSave"),
        description: t("loginPromptDesc") || "Sign in to your account to bookmark your favorite vehicles.",
      });
      return;
    }
    
    toggleSave(car.id);
  };

  if (view === "list") {
    return (
      <Link
        to={`/cars/${car.id}`}
        className={`group flex flex-col sm:flex-row rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
        style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="relative sm:w-64 aspect-[4/3] sm:aspect-auto overflow-hidden shrink-0">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
          }}
        />
          {!car.available && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">{car.type === "sale" ? t("sold") : t("rented")}</span>
          )}
          {car.available && (
             <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{t("available")}</span>
          )}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${saved ? "bg-primary text-primary-foreground" : "bg-black/20 text-white hover:bg-black/40"}`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-card-foreground text-lg">{car.name}</h3>
              <span className="text-sm font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider text-[10px]">
                {t(car.type === "sale" ? "sale" : "rental")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{car.year} · {car.mileage} · {car.fuel} · {car.transmission}</p>
          </div>
          <p className="text-xl font-bold text-primary tabular-nums mt-3">{car.priceLabel}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/cars/${car.id}`}
      className={`group rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        <div className="absolute top-3 left-3 flex gap-2">
          {!car.available && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">{car.type === "sale" ? t("sold") : t("rented")}</span>
          )}
          {car.available && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{t("available")}</span>
          )}
          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {t(car.type === "sale" ? "sale" : "rental")}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${saved ? "bg-primary text-primary-foreground" : "bg-black/20 text-white hover:bg-black/40"}`}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-card-foreground">{car.name}</h3>
          <span className="text-sm text-muted-foreground">{car.year}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{car.mileage} · {car.fuel} · {car.transmission}</p>
        <p className="text-xl font-bold text-primary tabular-nums">{car.priceLabel}</p>
      </div>
    </Link>
  );
}
