import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Car, Key, Ticket, Shield, Clock, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

const featuredCars = [
  { id: 1, name: "Horizon LX 450", price: "$42,800", type: "Sale", year: 2025, image: car1 },
  { id: 2, name: "Prestige Sedan S", price: "$85/day", type: "Rental", year: 2024, image: car2 },
  { id: 3, name: "Apex GT Coupe", price: "$67,500", type: "Sale", year: 2025, image: car3 },
];

const lotterySteps = [
  { icon: Ticket, title: "Pick Your Numbers", desc: "Choose from the available number grid — each number is yours exclusively." },
  { icon: Shield, title: "Confirm & Pay", desc: "Upload your payment receipt and wait for admin approval." },
  { icon: Star, title: "Win Big", desc: "When the draw happens, matching numbers take home the grand prize." },
];

function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
      </div>
      <div className="relative container mx-auto px-4 lg:px-8 py-32">
        <div className="max-w-2xl" style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Car Sales · Rental · Lottery</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6">
            Drive Your Dream, Starting Today
          </h1>
          <p className="text-lg text-primary-foreground/75 leading-relaxed mb-8 max-w-lg">
            Browse premium vehicles for sale or rent, and try your luck in our exciting car lottery — all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/cars/sale">
              <Button variant="hero" size="xl">
                Browse Cars <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/lottery">
              <Button variant="hero-outline" size="xl">
                Join Lottery
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="mt-16 grid grid-cols-3 gap-6 max-w-md"
          style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
        >
          {[
            { value: "240+", label: "Vehicles" },
            { value: "1.2K", label: "Happy Clients" },
            { value: "18", label: "Lottery Draws" },
          ].map((stat) => (
            <div key={stat.label} className="text-primary-foreground">
              <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
              <div className="text-xs text-primary-foreground/50 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Featured</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">Handpicked Vehicles</h2>
            </div>
            <Link to="/cars/sale" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car, i) => (
              <div
                key={car.id}
                className={`group rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${(i + 1) * 100}ms`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {car.type}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-card-foreground">{car.name}</h3>
                    <span className="text-sm text-muted-foreground">{car.year}</span>
                  </div>
                  <p className="text-xl font-bold text-primary tabular-nums">{car.price}</p>
                  <Link to={`/cars/${car.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref, isVisible } = useScrollReveal();

  const services = [
    { icon: Car, title: "Buy a Car", desc: "Browse our curated inventory of premium vehicles with transparent pricing and detailed specs.", link: "/cars/sale" },
    { icon: Key, title: "Rent a Car", desc: "Flexible daily rentals with competitive rates. Pick up today, return when you're done.", link: "/cars/rent" },
    { icon: Ticket, title: "Car Lottery", desc: "Select your lucky numbers, pay your ticket, and stand a chance to win incredible prizes.", link: "/lottery" },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-surface-warm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">What We Offer</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Three Ways to Drive</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <Link
              to={s.link}
              key={s.title}
              className={`group relative bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${(i + 1) * 100}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LotterySection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">How It Works</p>
          <h2 className="text-3xl lg:text-4xl font-bold">Win Your Next Ride</h2>
          <p className="mt-4 text-primary-foreground/65 max-w-lg mx-auto">
            Our car lottery gives everyone a fair shot at winning premium vehicles. Here's how to enter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {lotterySteps.map((step, i) => (
            <div
              key={step.title}
              className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${(i + 1) * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <step.icon className="h-6 w-6 text-accent" />
              </div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Step {i + 1}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-primary-foreground/60 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-12 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <Link to="/lottery">
            <Button variant="hero" size="xl">
              Enter the Lottery <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const { ref, isVisible } = useScrollReveal();

  const stats = [
    { icon: Shield, value: "100%", label: "Verified Vehicles" },
    { icon: Clock, value: "24h", label: "Average Response" },
    { icon: Star, value: "4.9", label: "Customer Rating" },
  ];

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
              style={{
                transitionDelay: `${i * 100}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedSection />
      <ServicesSection />
      <LotterySection />
      <TrustSection />
      <Footer />
    </div>
  );
}
