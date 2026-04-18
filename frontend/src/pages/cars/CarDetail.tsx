import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/useCars";
import { ArrowLeft, Fuel, Gauge, Settings2, Users, Calendar, CheckCircle2, Heart, MessageSquare, Phone, MapPin, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export default function CarDetail() {
  const { id } = useParams();
  const { data: carsData = [], isLoading } = useCars();
  const car = carsData.find((c) => c.id === id);
  const { t } = useLanguage();
  const { isSaved, toggleSave } = useSavedCars();
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useSettings();

  const phone = settings?.General?.contactPhone || "+251911701849";
  const address = settings?.General?.physicalAddress || "Jemo3 beside Taf gas station";



  const saved = car ? isSaved(car.id) : false;

  const handleToggleSave = () => {
    if (!car) return;
    if (!user) {
      toast({
        title: t("signInToSave"),
        description: t("loginPromptDesc") || "Sign in to your account to bookmark your favorite vehicles.",
      });
      return;
    }
    toggleSave(car.id);
  };

  if (!car) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("vehicleNotFound")}</h1>
          <Link to="/cars/sale"><Button variant="outline">{t("backToListings")}</Button></Link>
        </div>
      </PageShell>
    );
  }

  const specs = [
    { icon: Calendar, label: t("year"), value: String(car.year) },
    { icon: Gauge, label: t("mileage"), value: car.mileage },
    { icon: Fuel, label: t("fuel"), value: car.fuel },
    { icon: Settings2, label: t("transmission"), value: car.transmission },
    { icon: Users, label: t("seats"), value: String(car.seats) },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <Link
          to={car.type === "sale" ? "/cars/sale" : "/cars/rent"}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> {car.type === "sale" ? t("backToSales") : t("backToRentals")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          <div className="rounded-2xl overflow-hidden bg-card shadow-sm">
            <img 
              src={car.image} 
              alt={car.name} 
              className="w-full aspect-[4/3] object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549317661-bd32c0e5a809";
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${car.available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {car.available ? t("available") : car.type === "sale" ? t("sold") : t("rented")}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {car.type === "sale" ? t("forSale") : t("forRent")}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">{car.name}</h1>
            <p className="text-sm text-muted-foreground mb-6">{car.brand} · {car.year}</p>
            <p className="text-3xl font-bold text-primary tabular-nums mb-8">{car.priceLabel}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{car.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {specs.map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 shadow-sm">
                  <s.icon className="h-4 w-4 text-accent mb-2" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold text-card-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {car.available ? (
                <Link to="/contact" className="flex-1 min-w-[160px]">
                  <Button size="xl" className="w-full">
                    <CheckCircle2 className="h-5 w-5 mr-1" /> {car.type === "sale" ? t("contactToBuy") : t("contactForRental")}
                  </Button>
                </Link>
              ) : (
                <Button size="xl" disabled className="flex-1 min-w-[160px]">
                  <CheckCircle2 className="h-5 w-5 mr-1" /> {car.type === "sale" ? t("noLongerAvailable") : t("currentlyRented")}
                </Button>
              )}
              <Button
                variant={saved ? "default" : "outline"}
                size="xl"
                onClick={handleToggleSave}
                className={`w-14 px-0 shrink-0 ${saved ? "bg-primary text-primary-foreground" : ""}`}
              >
                <Heart className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Inquiry Portal Section */}
            <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                     <Info className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">{t("inquiryPortal")}</h3>
               </div>
               
               <p className="text-xs text-slate-500 leading-relaxed mb-6 italic">
                  "{t("catalogDisclaimer")}"
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href={`tel:${phone}`} className="flex-1">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 hover:bg-white hover:border-primary transition-all">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <Phone className="h-4 w-4" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t("callForDetails")}</p>
                          <p className="text-xs font-bold text-slate-700 leading-none">{phone}</p>
                       </div>
                    </Button>
                  </a>
                  
                  <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 hover:bg-white hover:border-primary transition-all">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <MessageSquare className="h-4 w-4" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t("chatOnWhatsApp")}</p>
                          <p className="text-xs font-bold text-slate-700 leading-none">WhatsApp</p>
                       </div>
                    </Button>
                  </a>

                  <div className="sm:col-span-2">
                    <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                       <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                          <MapPin className="h-4 w-4" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t("visitOffice")}</p>
                          <p className="text-xs font-bold text-slate-700 leading-none">{address}</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
