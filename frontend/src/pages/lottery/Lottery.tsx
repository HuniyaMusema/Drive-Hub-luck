import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Ticket, Shield, Star, ArrowRight, Trophy, Hash, Loader2, Sparkles, AlertCircle, Info, CheckCircle2, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentLottery } from "@/hooks/useLottery";
import { useSettings } from "@/hooks/useSettings";

export default function Lottery() {
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: detailsRef, isVisible: detailsVisible } = useScrollReveal();
  const { t } = useLanguage();
  const { data: lotteryData, isLoading: lotteryLoading } = useCurrentLottery();
  const { settings } = useSettings();

  const activeLottery = lotteryData?.lottery;
  const stats = lotteryData?.number_stats;
  const ticketPrice = settings?.Lottery?.ticketPrice || 0;
  const currency = settings?.General?.defaultCurrency || 'ETB';

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <Sparkles className="h-3 w-3" /> {t("lotteryTagline")}
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-6">
            {t("lotteryTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            {t("lotteryDesc")}
          </p>
        </div>

        {/* Dynamic Lottery Card */}
        {lotteryLoading ? (
          <div className="max-w-4xl mx-auto mb-20 aspect-[21/9] rounded-[2.5rem] bg-muted/30 animate-pulse flex items-center justify-center border border-border/40">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Syncing with Live Draw...</p>
             </div>
          </div>
        ) : activeLottery ? (
          <div
            ref={detailsRef}
            className={`max-w-4xl mx-auto mb-24 relative group transition-all duration-1000 ${detailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-card rounded-[2.5rem] overflow-hidden border border-border/60 shadow-2xl flex flex-col lg:flex-row">
               {/* Media/Prize Section */}
               <div className="lg:w-2/5 relative bg-primary overflow-hidden min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
                  
                  {/* Abstract Decoration */}
                  <div className="absolute inset-0 opacity-10">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -ml-32 -mb-32" />
                  </div>

                  <div className="relative z-10 h-full p-10 flex flex-col justify-between text-primary-foreground">
                     <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-tighter">
                           <Trophy className="h-3 w-3 text-amber-400 fill-amber-400" /> {t("currentDraw")}
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter mt-4 leading-none">{t("grandPrize")}</h2>
                     </div>

                     <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Platform Verified</p>
                           <p className="text-xl font-bold leading-tight">{activeLottery.prize_text || "Premium Vehicle Experience"}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                           <Shield className="h-4 w-4" /> Secure Blockchain Selection
                        </div>
                     </div>
                  </div>
               </div>

               {/* Logistics Section */}
               <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-between bg-card">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t("ticketPrice")}</p>
                      <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                        {ticketPrice.toLocaleString()} <span className="text-xs text-primary">{currency}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t("numberRange")}</p>
                      <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                        {activeLottery.start_number}<span className="mx-1 opacity-20">–</span>{activeLottery.end_number}
                      </p>
                    </div>

                    <div className="col-span-2 space-y-4 mt-4">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground">{t("ticketsLeft")}</span>
                          <span className="text-primary">{stats?.available ?? 0} {t("available")}</span>
                       </div>
                       <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/40 p-0.5">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                            style={{ width: `${Math.max(10, ((stats?.available ?? 0) / (activeLottery.end_number - activeLottery.start_number + 1)) * 100)}%` }}
                          />
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
                    <Link to="/lottery/select" className="w-full sm:w-auto overflow-hidden rounded-2xl group/btn">
                      <Button className="h-16 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3 w-full">
                        {t("selectYourNumbers")} 
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                           <ArrowRight className="h-5 w-5" />
                        </div>
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                       <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                       Active Now
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-24 p-12 rounded-[2.5rem] bg-muted/30 border border-dashed border-border/60 text-center">
             <div className="w-16 h-16 rounded-3xl bg-card border border-border/40 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground opacity-40" />
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-2">No Active Sweepstakes</h2>
             <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">We're currently preparing our next grand draw. Please check back soon or follow our Telegram updates.</p>
          </div>
        )}

        {/* How it Works / Social Proof */}
        <div ref={stepsRef} className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-black text-foreground tracking-tight uppercase mb-2">
               {t("howItWorks")}
             </h2>
             <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Ticket, title: t("chooseNumbers"), desc: t("chooseNumbersDesc"), bg: "bg-indigo-500/5", text: "text-indigo-600" },
              { icon: Shield, title: t("submitPayment"), desc: t("submitPaymentDesc"), bg: "bg-emerald-500/5", text: "text-emerald-600" },
              { icon: Star, title: t("waitForDraw"), desc: t("waitForDrawDesc"), bg: "bg-amber-500/5", text: "text-amber-600" },
            ].map((step, i) => (
              <div
                key={i}
                className={`relative group p-8 rounded-[2rem] bg-card border border-border/60 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 border border-border/40 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-inner`}>
                  <step.icon className={`h-8 w-8 ${step.text}`} strokeWidth={2.5} />
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">{t("step")} 0{i + 1}</div>
                <h3 className="text-xl font-extrabold text-foreground mb-3 leading-tight uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                
                {i < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
                     <ChevronRight className="h-8 w-8 text-muted-foreground opacity-20" strokeWidth={3} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rules Section */}
        <div className="max-w-4xl mx-auto mt-32 px-12 py-12 rounded-[3rem] bg-surface-warm border border-border/40 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="h-32 w-32" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
                    <Info className="h-5 w-5" />
                 </div>
                 <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{t("lotteryRules")}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                 {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-start gap-3 group/rule">
                       <div className="mt-1 w-1 h-1 rounded-full bg-primary group-hover/rule:scale-150 transition-transform" />
                       <p className="text-sm font-semibold text-muted-foreground/80 leading-snug">{t(`rule${i}`)}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </PageShell>
  );
}

const ChevronRight = ({ className, strokeWidth }: { className?: string, strokeWidth?: number }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
