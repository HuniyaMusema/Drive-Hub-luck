import { useParams, Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { carsData } from "@/data/cars";
import { ArrowLeft, Fuel, Gauge, Settings2, Users, Calendar, CheckCircle2 } from "lucide-react";

export default function CarDetail() {
  const { id } = useParams();
  const car = carsData.find((c) => c.id === Number(id));

  if (!car) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Vehicle Not Found</h1>
          <Link to="/cars/sale"><Button variant="outline">Back to Listings</Button></Link>
        </div>
      </PageShell>
    );
  }

  const specs = [
    { icon: Calendar, label: "Year", value: String(car.year) },
    { icon: Gauge, label: "Mileage", value: car.mileage },
    { icon: Fuel, label: "Fuel", value: car.fuel },
    { icon: Settings2, label: "Transmission", value: car.transmission },
    { icon: Users, label: "Seats", value: String(car.seats) },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <Link to={car.type === "sale" ? "/cars/sale" : "/cars/rent"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to {car.type === "sale" ? "Sales" : "Rentals"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-card shadow-sm">
            <img src={car.image} alt={car.name} className="w-full aspect-[4/3] object-cover" />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${car.available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {car.available ? "Available" : car.type === "sale" ? "Sold" : "Rented"}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {car.type === "sale" ? "For Sale" : "For Rent"}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">{car.name}</h1>
            <p className="text-sm text-muted-foreground mb-6">{car.brand} · {car.year}</p>

            <p className="text-3xl font-bold text-primary tabular-nums mb-8">{car.priceLabel}</p>

            <p className="text-muted-foreground leading-relaxed mb-8">{car.description}</p>

            {/* Specs grid */}
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
              {car.type === "sale" ? (
                <Button size="xl" disabled={!car.available} className="flex-1 min-w-[160px]">
                  <CheckCircle2 className="h-5 w-5 mr-1" /> {car.available ? "Contact to Buy" : "No Longer Available"}
                </Button>
              ) : (
                <Button size="xl" disabled={!car.available} className="flex-1 min-w-[160px]">
                  <CheckCircle2 className="h-5 w-5 mr-1" /> {car.available ? "Book Rental" : "Currently Rented"}
                </Button>
              )}
              <Link to="/payment">
                <Button variant="outline" size="xl">Payment Info</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
