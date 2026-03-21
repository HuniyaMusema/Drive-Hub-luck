import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { carsData } from "@/data/cars";
import { Search, Calendar, Fuel } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function CarsForRent() {
  const [search, setSearch] = useState("");

  const cars = useMemo(() => {
    return carsData
      .filter((c) => c.type === "rental")
      .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Rentals</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Cars for Rent</h1>
        </div>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rentals..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car, i) => (
            <div
              key={car.id}
              className={`group rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${car.available ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                  {car.available ? "Available" : "Rented"}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-card-foreground mb-2">{car.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {car.year}</span>
                  <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {car.fuel}</span>
                  <span>{car.seats} seats</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-primary tabular-nums">{car.priceLabel}</p>
                  <Link to={`/cars/${car.id}`}>
                    <Button size="sm" disabled={!car.available}>
                      {car.available ? "Rent Now" : "Unavailable"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
