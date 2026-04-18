import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
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
        className={`group flex flex-col sm:flex-row rounded-[2rem] overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
        style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="relative sm:w-80 aspect-[4/3] sm:aspect-auto overflow-hidden shrink-0">
          <img 
            src={car.image} 
            alt={car.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
            }}
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {!car.available && (
              <span className="bg-destructive/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                {car.type === "sale" ? t("sold") : t("rented")}
              </span>
            )}
            {car.available && (
               <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 {t("available")}
               </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleToggleSave}
            className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all ${saved ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-black/20 text-white hover:bg-black/40 border border-white/10"}`}
          >
            <FileText className={`h-4.5 w-4.5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="p-8 flex flex-col justify-between flex-1 relative overflow-hidden group/card shadow-inner">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="font-black text-foreground text-2xl tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors">{car.name}</h3>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{car.year}</span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t(car.type === "sale" ? "forSale" : "forRent")}</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{car.priceLabel}</p>
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-40">Verified Listing</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border/40 mb-6">
               {[
                 { label: car.mileage, icon: "gauge" },
                 { label: car.fuel, icon: "fuel" },
                 { label: car.transmission, icon: "settings" },
                 { label: "Premium", icon: "shield" }
               ].map((spec, i) => (
                 <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{spec.icon}</span>
                    <span className="text-[11px] font-bold text-foreground truncate">{spec.label}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted text-[8px] flex items-center justify-center font-black">U{i}</div>
                ))}
                <div className="text-[9px] font-black text-muted-foreground ml-4 flex items-center">8+ Interested</div>
             </div>
             <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest group/btn border border-border/40 hover:border-primary/40 hover:bg-primary/5">
                Explore Vehicle <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
             </Button>
          </div>
          {/* Abstract Bg */}
          <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/cars/${car.id}`}
      className={`group rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden group">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
           {!car.available ? (
             <span className="bg-destructive/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {car.type === "sale" ? t("sold") : t("rented")}
             </span>
           ) : (
             <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
               {t("available")}
             </span>
           )}
           <span className="bg-white/20 backdrop-blur-md border border-white/10 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-lg w-fit">
              {t(car.type === "sale" ? "sale" : "rental")}
           </span>
        </div>
        <button
          type="button"
          onClick={handleToggleSave}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${saved ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : "bg-black/20 text-white hover:bg-black/40 border border-white/10 hover:scale-105"}`}
        >
          <FileText className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} strokeWidth={saved ? 0 : 2} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
             <h3 className="font-black text-foreground text-base tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{car.name}</h3>
             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{car.year}</p>
          </div>
          <div className="text-right">
             <p className="text-base font-black text-foreground tabular-nums tracking-tight leading-none">{car.priceLabel}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/40">
           <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground/60 uppercase">
              <div className="flex items-center gap-1">
                 <span className="w-1 h-1 rounded-full bg-primary" />
                 {car.mileage}
              </div>
              <div className="flex items-center gap-1">
                 <span className="w-1 h-1 rounded-full bg-primary" />
                 {car.transmission}
              </div>
           </div>
           <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
           </div>
        </div>
      </div>
    </Link>
  );
}

const ArrowRight = ({ className, strokeWidth }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth || 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
