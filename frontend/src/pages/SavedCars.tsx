import { useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { CarCard } from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SavedCars() {
  const { savedCarIds } = useSavedCars();
  const { data: carsData = [] } = useCars();
  const { t } = useLanguage();

  const savedCars = useMemo(() => {
    return carsData.filter((car) => savedCarIds.includes(car.id));
  }, [savedCarIds, carsData]);

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("savedCars")}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{t("savedCars")}</h1>
        </div>

        {savedCars.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border animate-fade-in-up">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground text-lg mb-6">{t("noSavedCars")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/cars/sale">
                <Button className="h-[52px] px-12 rounded-sm font-extrabold uppercase text-xs tracking-[0.15em] transition-all border-0 text-white hover:text-[#071018] hover:bg-white" style={{ background: 'linear-gradient(135deg, #3D8FB5, #4CBFBF)', boxShadow: '0 0 40px rgba(76,191,191,0.25)' }}>
                  {t("browseCars")}
                </Button>
              </Link>
              <Link to="/cars/rent">
                <Button variant="outline" className="h-[48px] px-8 rounded-sm bg-transparent border-foreground/20 text-foreground font-semibold uppercase text-xs tracking-[0.15em] hover:border-[#4CBFBF] hover:text-[#4CBFBF] transition-all">
                  {t("rentACar")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCars.map((car, i) => (
              <CarCard key={car.id} car={car} delay={i * 80} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
