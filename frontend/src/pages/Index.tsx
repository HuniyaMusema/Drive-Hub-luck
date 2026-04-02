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
  const { settings } = useSettings();
  const isLotteryEnabled = true;
  const isSalesEnabled = true;

  const { data: stats } = useQuery({
    queryKey: ["publicStats"],
    queryFn: () => apiFetch("/settings/stats"),
  });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a2820 100%)' }}>
      {/* Background image — more visible */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-55" style={{ objectPosition: 'center 30%' }} />
        {/* Lighter gradient — only covers left side strongly */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(10,22,40,0.88) 0%, rgba(10,22,40,0.55) 55%, rgba(10,22,40,0.15) 100%)' }} />
        {/* Vibrant glowing orbs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[160px] -mr-48 -mt-48" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[130px] -mb-48" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(100,200,255,0.10) 0%, transparent 70%)' }} />
      </div>

      <div className="relative container mx-auto px-4 lg:px-8 py-32 z-10">
        <div className="max-w-2xl" style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border" style={{ background: 'rgba(61,240,162,0.12)', borderColor: 'rgba(61,240,162,0.3)', color: '#3df0a2' }}>
            <Sparkles className="h-3 w-3" /> {t("heroTagline")}
          </div>

          {/* Hero headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.92] mb-6 tracking-tighter uppercase" style={{ color: '#ffffff', textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
            {t("heroTitle")}
          </h1>

          {/* Subtext — lighter color for contrast */}
          <p className="text-lg font-medium leading-relaxed mb-10 max-w-lg" style={{ color: 'rgba(200,220,210,0.85)' }}>
            {t("heroDesc")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            {isSalesEnabled && (
              <Link to="/cars/sale">
                <Button size="xl" className="h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-wider transition-all hover:scale-105 active:scale-95 border-0" style={{ background: '#3df0a2', color: '#0a1628', boxShadow: '0 0 40px rgba(61,240,162,0.35), 0 8px 32px rgba(61,240,162,0.2)' }}>
                  {t("browseCars")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            {isLotteryEnabled && (
              <Link to="/lottery">
                <Button size="xl" className="h-14 px-8 rounded-2xl font-black uppercase text-sm tracking-wider transition-all hover:scale-105 active:scale-95 border" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)', color: '#ffffff', backdropFilter: 'blur(12px)' }}>
                  {t("enterLottery")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className="mt-24 flex flex-wrap gap-12 max-w-xl"
          style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both" }}
        >
          {[
            { value: stats ? `${stats.vehicles}+` : "240+", label: t("vehicles") },
            { value: stats ? `${(stats.happyClients / 1000).toFixed(1)}K` : "1.2K", label: t("happyClients") },
            { value: stats ? stats.lotteryDraws.toString() : "18", label: t("lotteryDraws") },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <div className="text-4xl font-black tabular-nums tracking-tighter mb-1 transition-colors" style={{ color: '#ffffff' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#3df0a2')}
                onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
              >{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(150,200,180,0.7)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <ChevronDown className="h-5 w-5 text-white" />
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
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden relative" style={{ background: 'linear-gradient(160deg, #0d1f35 0%, #0a2e22 50%, #0d1f35 100%)' }}>
      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(ellipse, rgba(61,240,162,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.08) 0%, transparent 70%)' }} />
      </div>
      
      <div className="relative container mx-auto px-4 lg:px-8 z-10">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border" style={{ background: 'rgba(61,240,162,0.10)', borderColor: 'rgba(61,240,162,0.25)', color: '#3df0a2' }}>
            <Zap className="h-3 w-3" /> {t("howItWorks")}
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase mb-6 text-white">{t("winYourNextRide")}</h2>
          <p className="mt-4 text-lg font-medium max-w-xl mx-auto" style={{ color: 'rgba(180,210,200,0.75)' }}>{t("lotteryLandingDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {lotterySteps.map((step, i) => (
            <div
              key={step.title}
              className={`group relative rounded-[2.5rem] p-10 border transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${(i + 1) * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(61,240,162,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(61,240,162,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ background: 'rgba(61,240,162,0.12)' }}>
                <step.icon className="h-7 w-7" style={{ color: '#3df0a2' }} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#3df0a2' }}>{t("step")} {i + 1}</div>
              <h3 className="text-xl font-black tracking-tight mb-3 uppercase text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(180,210,200,0.70)' }}>{step.desc}</p>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(61,240,162,0.08)' }} />
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <Link to="/lottery">
            <Button size="xl" className="h-16 px-12 rounded-2xl font-black uppercase text-sm tracking-wider transition-all hover:scale-105 active:scale-95 border-0" style={{ background: '#3df0a2', color: '#0a1628', boxShadow: '0 0 50px rgba(61,240,162,0.40), 0 8px 32px rgba(61,240,162,0.25)' }}>
              {t("enterTheLottery")} <ArrowRight className="ml-2 h-5 w-5" />
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
