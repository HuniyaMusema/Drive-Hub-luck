import { Link } from "react-router-dom";
import React from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Ticket, Shield, Star, ArrowRight, Trophy, Hash, Loader2, Sparkles, AlertCircle, Info, CheckCircle2, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentLottery } from "@/hooks/useLottery";
import { useSettings } from "@/hooks/useSettings";

export default function Lottery() {
  console.log('========== LOTTERY COMPONENT RENDERING ==========');
  
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: detailsRef, isVisible: detailsVisible } = useScrollReveal();
  const { t } = useLanguage();
  
  // TEMPORARY: Use simple state instead of React Query
  const [lotteryData, setLotteryData] = React.useState<any>(null);
  const [lotteryLoading, setLotteryLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  
  React.useEffect(() => {
    console.log('[Lottery] Fetching lottery data...');
    fetch('/api/lottery/current')
      .then(res => {
        console.log('[Lottery] Response:', res.status);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        console.log('[Lottery] Raw data from API:', JSON.stringify(data, null, 2));
        console.log('[Lottery] data.lottery:', data?.lottery);
        console.log('[Lottery] data.number_stats:', data?.number_stats);
        setLotteryData(data);
        setLotteryLoading(false);
      })
      .catch(err => {
        console.error('[Lottery] Error:', err);
        setError(err);
        setLotteryLoading(false);
      });
  }, []);
  
  const { settings } = useSettings();

  const activeLottery = lotteryData?.lottery;
  const stats = lotteryData?.number_stats;
  
  console.log('[Lottery] activeLottery details:', {
    activeLottery,
    type: typeof activeLottery,
    isObject: typeof activeLottery === 'object',
    isNull: activeLottery === null,
    isUndefined: activeLottery === undefined,
    hasId: activeLottery?.id,
    hasPrizeText: activeLottery?.prize_text,
    keys: activeLottery ? Object.keys(activeLottery) : 'N/A'
  });
  
  const ticketPrice = parseFloat(activeLottery?.ticket_price as any) || settings?.Lottery?.ticketPrice || 0;
  const currency = settings?.General?.defaultCurrency || 'ETB';

  // Debug logging
  console.log('[Lottery] State:', { 
    lotteryData, 
    activeLottery, 
    isLoading: lotteryLoading, 
    error,
    hasData: !!lotteryData,
    hasLottery: !!activeLottery
  });
  
  console.log('[Lottery] Will render:', {
    showLoading: lotteryLoading && !lotteryData,
    showError: !!error,
    showLottery: !!activeLottery,
    showEmpty: !lotteryLoading && !error && !activeLottery
  });

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 pb-20">
        {/* Hero Section */}
        <div className="relative text-center mb-24 py-24 rounded-[3rem] overflow-hidden shadow-2xl animate-fade-in-up border" style={{ background: 'linear-gradient(135deg, #071018 0%, #0a1929 50%, #071018 100%)', borderColor: 'rgba(76,191,191,0.15)' }}>
           <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] -mr-48 -mt-48" style={{ background: 'radial-gradient(circle, rgba(76,191,191,0.18) 0%, transparent 70%)' }} />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[130px] -ml-48 -mb-48" style={{ background: 'radial-gradient(circle, rgba(61,143,181,0.14) 0%, transparent 70%)' }} />
             <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(76,191,191,0.06) 0%, transparent 60%)' }} />
           </div>

           <div className="relative z-10 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border" style={{ background: 'rgba(76,191,191,0.10)', borderColor: 'rgba(76,191,191,0.30)', color: '#4CBFBF' }}>
                <Sparkles className="h-3 w-3" /> {t("lotteryTagline")}
              </div>
              <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase max-w-4xl" style={{ textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
                {t("lotteryTitle")}
              </h1>
              <p className="max-w-2xl mx-auto text-lg font-medium leading-relaxed" style={{ color: 'rgba(190,220,210,0.80)' }}>
                {t("lotteryDesc")}
              </p>
           </div>
        </div>

        {/* Dynamic Lottery Card */}
        {lotteryLoading && !lotteryData ? (
          <div className="max-w-4xl mx-auto mb-20 aspect-[21/9] rounded-[2.5rem] bg-muted/30 animate-pulse flex items-center justify-center border border-border/40">
             <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">{t("l_syncingDraw")}</p>
             </div>
          </div>
        ) : error ? (
          <div className="max-w-3xl mx-auto mb-24 p-12 rounded-[2.5rem] bg-red-50 border border-red-200 text-center">
             <div className="w-16 h-16 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-500" />
             </div>
             <h2 className="text-2xl font-black tracking-tight mb-2 text-red-900">Connection Error</h2>
             <p className="text-red-600 font-medium text-sm max-w-xs mx-auto mb-4">{(error as Error)?.message || 'Failed to load lottery'}</p>
             <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
               Retry
             </Button>
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
               <div className="lg:w-2/5 relative bg-slate-900 overflow-hidden min-h-[350px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
                  
                  {/* Neon Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50" />

                  <div className="relative z-10 h-full p-12 flex flex-col justify-between text-white">
                     <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-[#3df0a2]">
                           <Trophy className="h-3 w-3 fill-[#3df0a2]" /> {t("currentDraw")}
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mt-6 leading-none uppercase">{t("grandPrize")}</h2>
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3df0a2] mb-3">{t("l_platformVerified")}</p>
                           <p className="text-2xl font-black leading-tight tracking-tight uppercase">{activeLottery.prize_text || t("l_premiumVehicleExp")}</p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <Shield className="h-4 w-4 text-emerald-500" /> {t("l_secureBlockchain")}
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
                        {ticketPrice.toLocaleString()} <span className="text-xs text-[#3df0a2]">{currency}</span>
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
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
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
                       {t("l_activeNow")}
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
             <h2 className="text-2xl font-black tracking-tight mb-2">{t("l_noActiveSweepstakes")}</h2>
             <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">{t("l_preparingNextDraw")}</p>
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
