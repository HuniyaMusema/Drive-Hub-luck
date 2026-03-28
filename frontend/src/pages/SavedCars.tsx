import { useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { CarCard } from "@/components/CarCard";
import { carsData } from "@/data/cars";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SavedCars() {
  const { savedCarIds } = useSavedCars();
  const { t } = useLanguage();

  const savedCars = useMemo(() => {
    return carsData.filter((car) => savedCarIds.includes(car.id));
  }, [savedCarIds]);

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
              <Heart className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground text-lg mb-6">{t("noSavedCars")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/cars/sale">
                <Button variant="default">{t("browseCars")}</Button>
              </Link>
              <Link to="/cars/rent">
                <Button variant="outline">{t("rentACar")}</Button>
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
