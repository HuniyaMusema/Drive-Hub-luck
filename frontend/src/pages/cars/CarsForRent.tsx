import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCars } from "@/hooks/useCars";
import { Search, Calendar, Fuel } from "lucide-react";
import { CarCard } from "@/components/CarCard";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CarsForRent() {
  const [search, setSearch] = useState("");
  const { t } = useLanguage();
  
  const { data: carsData = [], isLoading } = useCars();

  const cars = useMemo(() => {
    return carsData
      .filter((c) => c.type === "rental")
      .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, carsData]);

  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("rentalsLabel")}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{t("carsForRent")}</h1>
        </div>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("searchRentals")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car, i) => (
            <CarCard key={car.id} car={car} view="grid" isVisible={isVisible} delay={i * 100} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
