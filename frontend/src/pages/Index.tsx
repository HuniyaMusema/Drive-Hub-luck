import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Car, Key, Ticket, Shield, Clock, Star, Sparkles, Zap, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { CarCard } from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { useSettings } from "@/hooks/useSettings";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import heroBg from "@/assets/hero-bg.jpg";

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background image & Vignette */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="Drive Hub" className="w-full h-full object-cover" style={{ objectPosition: 'center center' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.80) 100%)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-8 z-10 flex flex-col items-center text-center pt-[100px] pb-24 h-full min-h-screen justify-center">
        
        {/* Top label */}
        <div className="text-[#f5b027] text-[11px] font-semibold tracking-[0.4em] uppercase mb-6" style={{ animation: "fadeInUp 0.8s 0.2s both" }}>
          YOUR PREMIUM CAR DESTINATION
        </div>
        
        {/* Main Title */}
        <h1 className="flex flex-col items-center justify-center gap-1 mb-6 text-white" style={{ animation: "fadeInUp 0.8s 0.4s both", textShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>
          <span className="text-5xl md:text-7xl lg:text-[7rem] font-display capitalize tracking-widest leading-[0.9]">
            Gech
          </span>
          <span className="text-4xl md:text-6xl lg:text-[5rem] font-display uppercase tracking-[0.05em] leading-[0.9]" style={{ color: '#4CBFBF' }}>
            (ጌች)
          </span>
        </h1>

        {/* Sub description */}
        <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed mb-12" style={{ animation: "fadeInUp 0.8s 0.6s both" }}>
          Discover, buy, rent, and win premium vehicles — all in one place. Ethiopia's finest car marketplace.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animation: "fadeInUp 0.8s 0.8s both" }}>
          <Link to="/cars/sale">
            <Button size="xl" className="h-[52px] px-12 rounded-sm bg-[#f5b027] text-black font-extrabold uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-black transition-all">
              {t("browseFleet") || "Browse Cars"}
            </Button>
          </Link>
          <Link to="/lottery">
            <Button variant="outline" size="xl" className="h-[52px] px-12 rounded-sm bg-transparent border-white/40 text-white font-semibold uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-black transition-all">
              {t("winACar") || "Win a Car"}
            </Button>
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-80" style={{ animation: "fadeInUp 0.8s 1.2s both" }}>
          <span className="text-[9px] text-[#f5f5f5] tracking-[0.2em] uppercase font-bold">SCROLL TO EXPLORE</span>
          <ChevronDown className="h-5 w-5 text-white animate-bounce mt-1" strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  const { ref, isVisible } = useScrollReveal();
  const { t } = useLanguage();
  
  const { data: carsData = [] } = useCars();
  
  const featuredCars = useMemo(() => {
    return carsData.slice(0, 3);
  }, [carsData]);

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
  const { settings } = useSettings();

  const services = [
    { icon: Car, title: t("buyACar"), desc: t("buyACarDesc"), link: "/cars/sale", enabled: true },
    { icon: Key, title: t("rentACar"), desc: t("rentACarDesc"), link: "/cars/rent", enabled: true },
    { icon: Ticket, title: t("carLottery"), desc: t("carLotteryDesc"), link: "/lottery", enabled: true },
  ].filter(s => s.enabled);

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
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #0a1929 0%, #071018 100%)' }}>
      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(ellipse, rgba(76,191,191,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(61,143,181,0.06) 0%, transparent 70%)' }} />
      </div>
      
      <div className="relative container mx-auto px-4 lg:px-8 z-10">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border" style={{ background: 'rgba(76,191,191,0.06)', borderColor: 'rgba(76,191,191,0.25)', color: '#4CBFBF' }}>
            <Zap className="h-3 w-3" /> {t("howItWorks")}
          </div>
          <h2 className="text-4xl lg:text-5xl font-display text-white tracking-widest uppercase mb-6 leading-tight">{t("winYourNextRide")}</h2>
          <p className="mt-4 text-sm tracking-wide font-medium max-w-xl mx-auto text-white/50">{t("lotteryLandingDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {lotterySteps.map((step, i) => (
            <div
              key={step.title}
              className={`group relative rounded-xl p-10 border transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${(i + 1) * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                background: 'rgba(76,191,191,0.03)',
                borderColor: 'rgba(76,191,191,0.1)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,191,191,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(76,191,191,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,191,191,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(76,191,191,0.03)'; }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ background: 'rgba(245,176,39,0.12)' }}>
                <step.icon className="h-7 w-7" strokeWidth={1.5} style={{ color: '#f5b027' }} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#f5b027' }}>{t("step")} {i + 1}</div>
              <h3 className="text-xl font-display tracking-[0.1em] mb-4 uppercase text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed tracking-wide font-medium text-white/50">{step.desc}</p>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(245,176,39,0.10)' }} />
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <Link to="/lottery">
            <Button size="xl" className="h-[52px] px-12 rounded-sm font-extrabold uppercase text-xs tracking-[0.15em] transition-all border-0 text-white hover:text-[#071018] hover:bg-white" style={{ background: 'linear-gradient(135deg, #3D8FB5, #4CBFBF)', boxShadow: '0 0 40px rgba(76,191,191,0.25)' }}>
              {t("enterTheLottery")} <ArrowRight className="ml-3 h-4 w-4" />
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
  const { error } = useSettings();
  const { t } = useLanguage();

  if (error?.message?.includes("maintenance")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-warm p-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
          <Clock className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4 font-display">{t("systemMaintenance")}</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          {error.message}
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("retry")}
          </Button>
          <Link to="/auth/login">
            <Button variant="ghost">Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

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
