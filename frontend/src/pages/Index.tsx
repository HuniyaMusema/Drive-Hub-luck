import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Car, Key, Ticket, Shield, Clock, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { CarCard } from "@/components/CarCard";
import { carsData } from "@/data/cars";
import heroBg from "@/assets/hero-bg.jpg";

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
      </div>
      <div className="relative container mx-auto px-4 lg:px-8 py-32">
        <div className="max-w-2xl" style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">{t("heroTagline")}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-primary-foreground/75 leading-relaxed mb-8 max-w-lg">
            {t("heroDesc")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/cars/sale">
              <Button variant="hero" size="xl">
                {t("browseCars")} <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/lottery">
              <Button variant="hero-outline" size="xl">
                {t("enterLottery")}
              </Button>
            </Link>
          </div>
        </div>

        <div
          className="mt-16 grid grid-cols-3 gap-6 max-w-md"
          style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
        >
          {[
            { value: "240+", label: t("vehicles") },
            { value: "1.2K", label: t("happyClients") },
            { value: "18", label: t("lotteryDraws") },
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
  const { t } = useLanguage();
  
  const featuredCars = useMemo(() => {
    return carsData.filter(car => [1, 2, 3].includes(car.id));
  }, []);

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("featured")}</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">{t("handpickedVehicles")}</h2>
            </div>
            <Link to="/cars/sale" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t("viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car, i) => (
              <CarCard key={car.id} car={car} view="grid" isVisible={isVisible} delay={(i + 1) * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { ref, isVisible } = useScrollReveal();
  const { t } = useLanguage();

  const services = [
    { icon: Car, title: t("buyACar"), desc: t("buyACarDesc"), link: "/cars/sale" },
    { icon: Key, title: t("rentACar"), desc: t("rentACarDesc"), link: "/cars/rent" },
    { icon: Ticket, title: t("carLottery"), desc: t("carLotteryDesc"), link: "/lottery" },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-surface-warm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("whatWeOffer")}</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">{t("threeWays")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <Link
              to={s.link}
              key={s.title}
              className={`group relative bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${(i + 1) * 100}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
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
  const { t } = useLanguage();

  const lotterySteps = [
    { icon: Ticket, title: t("pickYourNumbers"), desc: t("pickNumbersDesc") },
    { icon: Shield, title: t("confirmAndPay"), desc: t("confirmPayDesc") },
    { icon: Star, title: t("winBig"), desc: t("winBigDesc") },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">{t("howItWorks")}</p>
          <h2 className="text-3xl lg:text-4xl font-bold">{t("winYourNextRide")}</h2>
          <p className="mt-4 text-primary-foreground/65 max-w-lg mx-auto">{t("lotteryLandingDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {lotterySteps.map((step, i) => (
            <div
              key={step.title}
              className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${(i + 1) * 120}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <step.icon className="h-6 w-6 text-accent" />
              </div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{t("step")} {i + 1}</div>
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
              {t("enterTheLottery")} <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const { ref, isVisible } = useScrollReveal();
  const { t } = useLanguage();

  const stats = [
    { icon: Shield, value: "100%", label: t("verifiedVehicles") },
    { icon: Clock, value: "24h", label: t("averageResponse") },
    { icon: Star, value: "4.9", label: t("customerRating") },
  ];

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
              style={{ transitionDelay: `${i * 100}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
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
