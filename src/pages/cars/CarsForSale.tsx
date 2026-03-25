import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { carsData, brands } from "@/data/cars";
import { Search, Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { CarCard } from "@/components/CarCard";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CarsForSale() {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  const cars = useMemo(() => {
    return carsData
      .filter((c) => c.type === "sale")
      .filter((c) => !selectedBrand || c.brand === selectedBrand)
      .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, selectedBrand]);

  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("inventory")}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{t("carsForSale")}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchVehicles")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> {t("filters")}
          </Button>
          <div className="flex border rounded-lg overflow-hidden ml-auto">
            <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"} transition-colors`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"} transition-colors`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-4 bg-card rounded-xl shadow-sm animate-fade-in-up">
            <p className="text-sm font-semibold text-foreground mb-3">{t("brand")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBrand(null)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!selectedBrand ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {t("all")}
              </button>
              {brands.filter(b => carsData.some(c => c.type === "sale" && c.brand === b)).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${selectedBrand === b ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={ref}>
          {cars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t("noVehiclesMatch")}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearch(""); setSelectedBrand(null); }}>
                {t("clearFilters")}
              </Button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, i) => (
                <CarCard key={car.id} car={car} view="grid" isVisible={isVisible} delay={i * 80} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {cars.map((car, i) => (
                <CarCard key={car.id} car={car} view="list" isVisible={isVisible} delay={i * 80} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
