import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, Car, Key, Ticket, Shield, Clock, Star, Sparkles, Zap, ChevronDown, Gift, CheckCircle2, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { CarCard } from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { useSettings } from "@/hooks/useSettings";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/api";
import carGiftBow from "@/assets/car-gift-bow.png";
import heroBg from "@/assets/hero-night-car.jpg"; // Night car with dramatic lighting

/* ─── Flashcard Stack – right panel ─── */
const mockListings = [
  { name: "Mercedes-AMG GT 63", year: 2024, price: "4,200,000 Birr", tag: "Available", color: "#22c55e" },
  { name: "BMW M8 Competition",  year: 2023, price: "3,750,000 Birr", tag: "Available", color: "#22c55e" },
  { name: "Porsche 911 Turbo S", year: 2024, price: "5,100,000 Birr", tag: "New In",    color: "#f5b027" },
  { name: "Lamborghini Urus SE", year: 2024, price: "8,900,000 Birr", tag: "Available", color: "#22c55e" },
];

function FlashcardStack() {
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      className="relative w-full max-w-[320px] mx-auto"
      style={{ height: 380, perspective: 1200 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Card 2: Listings (bottom) ── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          transform: hovered
            ? "translateY(32px) rotate(4deg) translateX(18px)"
            : "translateY(18px) rotate(-3deg) translateX(12px)",
          transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 1,
        }}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10, 20, 30, 0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "none",
          }}
        >
          {/* Card header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/45">Drive Hub Fleet</p>
              <p className="text-sm font-bold text-white mt-0.5">Cars For Sale</p>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: "rgba(245,176,39,0.18)", color: "#f5b027", border: "1px solid rgba(245,176,39,0.3)" }}>
              {mockListings.length} Listed
            </span>
          </div>
          {/* Listing rows */}
          <ul className="divide-y divide-white/[0.06]">
            {mockListings.map((car, i) => (
              <li key={i} className="px-6 py-3 flex items-center justify-between group/item hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(76,191,191,0.12)" }}>
                    <Car className="h-3 w-3 text-[#4CBFBF]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white leading-none">{car.name}</p>
                    <p className="text-[9px] text-white/40 mt-0.5 font-semibold">{car.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black text-white/75 tabular-nums hidden sm:block">{car.price}</p>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${car.color}25`, color: car.color, border: `1px solid ${car.color}45` }}>
                    {car.tag}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4">
            <Link to="/cars/sale" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              View All Listings <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Card 1: Gift Hero (top) ── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          transform: hovered
            ? "translateY(-16px) rotate(-1deg) translateX(-8px)"
            : "translateY(0) rotate(0deg)",
          transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 2,
        }}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(8, 14, 28, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "none",
            height: 250,
          }}
        >
          {/* Image area */}
          <div className="relative h-[170px] overflow-hidden">
            <img
              src={carGiftBow}
              alt="The Ultimate Gift – Luxury Car"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 40%" }}
            />
            {/* Overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,12,24,0.65) 0%, transparent 60%)" }} />
            {/* Pill badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl" style={{ background: "rgba(245,176,39,0.22)", border: "1px solid rgba(245,176,39,0.4)", color: "#f5b027", backdropFilter: "blur(12px)" }}>
              <Gift className="h-2.5 w-2.5" /> {t("heroGiftBadge")}
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl" style={{ background: "rgba(34,197,94,0.22)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e", backdropFilter: "blur(12px)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> {t("heroLiveBadge")}
            </div>
          </div>
          {/* Card footer */}
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/60">{t("heroFeaturedOffer")}</p>
              <p className="text-sm font-bold text-white mt-0.5 leading-none">{t("heroPremiumFleet")}</p>
            </div>
            <Link to="/lottery">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#f5b027,#e09a10)", boxShadow: "0 4px 20px rgba(245,176,39,0.45)" }}>
                <ArrowRight className="h-4 w-4 text-black" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Glow behind the stack */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-[100px] pointer-events-none opacity-40" style={{ background: "radial-gradient(ellipse, rgba(76,191,191,0.2) 0%, transparent 70%)" }} />
    </div>
  );
}

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-primary">

      {/* ── Splitted Background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 flex">
          {/* Background image */}
          <div className="w-full h-full relative">
            <img src={heroBg} alt="Luxury Car at Night" className="w-full h-full object-cover object-center" style={{ filter: "brightness(0.6)" }} />
          </div>
        </div>
        {/* Directional overlay: dark on left (text), fades out toward right (cards) */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(5,10,20,0.85) 0%, rgba(5,10,20,0.70) 40%, rgba(5,10,20,0.25) 70%, transparent 100%)"
        }} />
        {/* Bottom fade for polish */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(5,10,20,0.5) 0%, transparent 30%)"
        }} />
      </div>

      {/* Right edge fade into footer color */}
      <div className="absolute inset-y-0 right-0 w-1/3 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, #0d1e2e)" }} />

      {/* Ambient glows for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[160px] opacity-25" style={{ background: "radial-gradient(circle, rgba(245,176,39,0.12) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20" style={{ background: "radial-gradient(circle, rgba(76,191,191,0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="relative container mx-auto px-6 lg:px-12 pt-28 pb-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="max-w-[620px]" style={{ animation: "slideInLeft 0.9s 0.1s both" }}>

            {/* Top eyebrow */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full backdrop-blur-sm" style={{ background: "rgba(76,191,191,0.12)", border: "1px solid rgba(76,191,191,0.3)" }}>
              <Sparkles className="h-3 w-3 text-[#4CBFBF]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#4CBFBF]">{t("heroEyebrow")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 leading-[0.95]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800 }}>
              <span className="block text-5xl md:text-6xl lg:text-[5.5rem] tracking-tight text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{t("heroLine1")}</span>
              <span className="block text-5xl md:text-6xl lg:text-[5.5rem] tracking-tight" style={{ color: "#4CBFBF", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>{t("heroLine2")}</span>
              <span className="block text-4xl md:text-5xl lg:text-[4rem] tracking-tight mt-2 text-white/95" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
                {t("heroLine3")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-white text-base lg:text-lg leading-relaxed mb-10 max-w-[480px]" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              {t("heroDesc")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link to="/cars/sale">
                <button
                  className="relative h-[54px] px-10 rounded-xl font-black uppercase text-xs tracking-[0.15em] text-[#071018] overflow-hidden group/btn"
                  style={{ background: "linear-gradient(135deg,#4CBFBF 0%,#3D8FB5 100%)", boxShadow: "0 8px 32px rgba(76,191,191,0.35)" }}
                >
                  <span className="relative z-10 flex items-center gap-2">{t("heroCtaExplore")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" /></span>
                </button>
              </Link>
              <Link to="/lottery">
                <button
                  className="h-[54px] px-10 rounded-xl font-black uppercase text-xs tracking-[0.15em] text-white group/btn"
                  style={{ background: "rgba(245,176,39,0.22)", border: "1.5px solid rgba(245,176,39,0.7)", boxShadow: "0 0 16px rgba(245,176,39,0.2)" }}
                >
                  <span className="flex items-center gap-2">{t("winACar")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" /></span>
                </button>
              </Link>
            </div>

            {/* Social proof bar */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["#f5b027","#4CBFBF","#3D8FB5","#e05555","#a855f7"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white" style={{ borderColor: "rgba(10, 20, 30, 1)", background: c }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">{t("heroSocialProof")}</div>
                <div className="text-[9px] text-white/65 font-semibold uppercase tracking-widest mt-0.5">{t("heroSocialProofSub")}</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Flashcard Stack ── */}
          <div className="hidden lg:block w-full max-w-[420px] ml-auto relative z-20" style={{ animation: "slideInRight 0.9s 0.25s both" }}>
            <FlashcardStack />
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60" style={{ animation: "fadeInUp 0.8s 1.2s both" }}>
        <span className="text-[9px] text-white/70 tracking-[0.2em] uppercase font-bold">Scroll</span>
        <ChevronDown className="h-5 w-5 text-white/60 animate-bounce mt-1" strokeWidth={1} />
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
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #162840 0%, #112033 100%)' }}>
      {/* Ambient light effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(ellipse, rgba(76,191,191,0.09) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(61,143,181,0.07) 0%, transparent 70%)' }} />
      </div>
      
      <div className="relative container mx-auto px-4 lg:px-8 z-10">
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border" style={{ background: 'rgba(76,191,191,0.08)', borderColor: 'rgba(76,191,191,0.28)', color: '#4CBFBF' }}>
            <Zap className="h-3 w-3" /> {t("howItWorks")}
          </div>
          <h2 className="text-4xl lg:text-5xl font-display text-white tracking-widest uppercase mb-6 leading-tight">{t("winYourNextRide")}</h2>
          <p className="mt-4 text-sm tracking-wide font-medium max-w-xl mx-auto text-white/60">{t("lotteryLandingDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {lotterySteps.map((step, i) => (
            <div
              key={step.title}
              className={`group relative rounded-xl p-10 border transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${(i + 1) * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                background: 'rgba(76,191,191,0.04)',
                borderColor: 'rgba(76,191,191,0.12)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,191,191,0.35)'; (e.currentTarget as HTMLElement).style.background = 'rgba(76,191,191,0.07)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,191,191,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(76,191,191,0.04)'; }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform" style={{ background: 'rgba(245,176,39,0.12)' }}>
                <step.icon className="h-7 w-7" strokeWidth={1.5} style={{ color: '#f5b027' }} />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#f5b027' }}>{t("step")} {i + 1}</div>
              <h3 className="text-xl font-display tracking-[0.1em] mb-4 uppercase text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed tracking-wide font-medium text-white/55">{step.desc}</p>
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
