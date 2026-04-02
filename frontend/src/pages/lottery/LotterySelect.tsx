import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Check, ShoppingCart, Loader2, Sparkles, AlertCircle, Info, ChevronRight, Hash, Ticket, ShieldCheck, Zap, Lock as LockIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { useCurrentLottery, useTakenNumbers, useParticipateLottery, useProfileHistory } from "@/hooks/useLottery";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LotterySelect() {
  const { data: lotteryData, isLoading: loadingLottery } = useCurrentLottery();
  const { data: takenNumbersList = [], isLoading: loadingTaken } = useTakenNumbers();
  const { data: history } = useProfileHistory();
  const participateMutation = useParticipateLottery();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [reservedTickets, setReservedTickets] = useState<any[] | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'lottery_staff';

  const lottery = lotteryData?.lottery;
  const takenNumbers = useMemo(() => new Set(takenNumbersList), [takenNumbersList]);
  
  const userPendingTickets = useMemo(() => {
    return (history?.lotteries || []).filter(l => l.status === 'pending' && !l.payment_status);
  }, [history]);

  const userPendingNumbers = useMemo(() => {
    return new Set(userPendingTickets.map(t => t.number));
  }, [userPendingTickets]);

  const { settings } = useSettings();
  const ticketPrice = settings?.Lottery?.ticketPrice || 0;
  const currency = settings?.General?.defaultCurrency || 'ETB';

  const toggle = (n: number) => {
    if (takenNumbers.has(n)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 5) next.add(n);
      else {
        toast({ title: "Limit Reached", description: "You can select up to 5 numbers per transaction." });
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    try {
      const result = await participateMutation.mutateAsync([...selected]);
      if (result && result.tickets) {
        setReservedTickets(result.tickets);
      }
      setConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (confirmed) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 lg:px-8 text-center py-24 animate-fade-in-up flex flex-col items-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl rotate-3">
              <Check className="h-12 w-12" strokeWidth={3} />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-4 uppercase">{t("l_numbersReserved")}</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto font-medium">
            {t("l_reservedSuccess")} <span className="text-primary font-black tabular-nums">{[...selected].sort((a,b)=>a-b).join(", ")}</span>. 
            {t("l_finalizeEntry")}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
            <Button size="xl" className="rounded-2xl font-black shadow-2xl shadow-primary/30 h-16 flex-1" onClick={() => navigate("/payment", { state: { tickets: reservedTickets } })}>
              {t("goToPayment")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" className="rounded-2xl font-bold h-16 flex-1" onClick={() => navigate("/lottery")}>
              {t("l_backToLottery")}
            </Button>
          </div>
          
          <div className="mt-16 flex items-center gap-6 opacity-30">
             <div className="h-px w-12 bg-foreground" />
             <ShieldCheck className="h-6 w-6" />
             <div className="h-px w-12 bg-foreground" />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 pb-32">
        <div className="flex items-center justify-between mb-12">
            <Link to="/lottery" className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              </div>
              {t("l_backToLottery")}
            </Link>
            
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{t("l_selectionStep")}</span>
                  <span className="text-xs font-black text-foreground">{t("l_pickLuckyPath")}</span>
               </div>
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Selection Area */}
          <div className="lg:col-span-8 space-y-10 animate-fade-in-up">
            <div>
               <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-3 border border-primary/20">
                <Sparkles className="h-3 w-3" /> Select Numbers
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter mb-4">{t("selectYourNumbers")}</h1>
              <p className="text-muted-foreground font-medium text-lg">{t("pickUpTo5")}</p>
            </div>

            {loadingLottery || loadingTaken ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 bg-card/50 rounded-[2.5rem] border border-border/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">{t("l_syncingBoard")}</p>
              </div>
            ) : isAdminOrStaff ? (
              <div className="bg-card rounded-[2.5rem] p-16 text-center shadow-xl border border-dashed border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <LockIcon className="h-8 w-8 text-primary" />
                   </div>
                   <h2 className="text-2xl font-black text-foreground tracking-tight uppercase mb-2">{t("l_restrictedAccess")}</h2>
                   <p className="text-muted-foreground font-medium max-w-md mx-auto">
                     {t("l_managementRestriction")}
                   </p>
                </div>
              </div>
            ) : !lottery ? (
              <div className="bg-card rounded-[2.5rem] p-20 text-center shadow-xl border border-dashed border-border/60">
                <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                <p className="text-lg font-black uppercase tracking-tight text-muted-foreground opacity-50">{t("l_boardOffline")}</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {Array.from({ length: lottery.end_number - lottery.start_number + 1 }, (_, i) => i + lottery.start_number).map((n) => {
                    const taken = takenNumbers.has(n);
                    const selectedItem = selected.has(n);
                    const isUserPending = userPendingNumbers.has(n);
                    
                    return (
                      <button
                        key={n}
                        disabled={taken && !isUserPending}
                        onClick={() => {
                          if (isUserPending) {
                            const ticket = userPendingTickets.find(t => t.number === n);
                            navigate("/payment", { state: { tickets: [ticket] } });
                            return;
                          }
                          toggle(n);
                        }}
                        className={cn(
                          "aspect-square rounded-2xl text-lg font-black tabular-nums transition-all duration-300 relative group overflow-hidden border-2",
                          taken && !isUserPending 
                            ? "bg-muted border-muted text-muted-foreground/30 cursor-not-allowed opacity-50" 
                            : isUserPending
                              ? "bg-amber-50 border-amber-500 text-amber-600 shadow-lg shadow-amber-500/10 animate-pulse"
                              : selectedItem 
                                ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/40 scale-105 active:scale-95" 
                                : "bg-card border-border/60 text-foreground hover:border-primary/40 hover:bg-primary/5 hover:scale-110 active:scale-90"
                        )}
                      >
                        {selectedItem && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                        )}
                        <span className="relative z-10">{n.toString().padStart(2, '0')}</span>
                        {!taken && !selectedItem && (
                           <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-6 p-6 rounded-3xl bg-muted/20 border border-border/40">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-lg bg-card border-2 border-border/60 shadow-sm" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("available")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-lg bg-primary shadow-md" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("selected")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-lg bg-amber-50 border-2 border-amber-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">My Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-lg bg-muted border-2 border-muted opacity-50" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{t("taken")}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                     <Info className="h-3.5 w-3.5" />
                     Live Status Updated
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout / Summary Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 border border-border/60 relative overflow-hidden group/card animate-slide-in-right">
              {/* Card Decoration */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                       <ShoppingCart className="h-6 w-6 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-foreground tracking-tighter leading-none">{t("yourSelection")}</h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1.5">Checkout Summary</p>
                    </div>
                  </div>
                </div>

                {selected.size === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-border/40 rounded-[2rem] flex flex-col items-center gap-3">
                      <Hash className="h-10 w-10 text-muted-foreground opacity-10" strokeWidth={1} />
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 opacity-80">{t("noNumbersSelected")}</p>
                      <p className="text-[10px] text-muted-foreground/30 font-medium px-6">Click on tiles to the left to select your entries.</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">
                    <div className="flex flex-wrap gap-2.5">
                      {[...selected].sort((a, b) => a - b).map((n) => (
                        <div key={n} className="bg-primary px-4 py-2.5 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all hover:scale-110 active:scale-95 cursor-default">
                           <span className="text-primary-foreground font-black tabular-nums text-lg">{n.toString().padStart(2, '0')}</span>
                           <button onClick={() => toggle(n)} className="text-white/40 hover:text-white transition-colors">
                             <X className="h-3.5 w-3.5" />
                           </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-border/60">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                        <span>Items Count</span>
                        <span className="text-foreground text-sm">{selected.size} × {t("ticket")}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                        <span>Price Per Unit</span>
                        <span className="text-foreground text-sm tabular-nums">{ticketPrice.toLocaleString()} {currency}</span>
                      </div>
                      <div className="flex justify-between items-end pt-6 border-t border-border/60">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t("total")}</span>
                           <h3 className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                             {(selected.size * ticketPrice).toLocaleString()}
                           </h3>
                        </div>
                        <span className="pb-1.5 text-xs font-black text-primary uppercase">{currency}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-10 rounded-2xl h-16 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 group/submit" 
                  disabled={selected.size === 0 || participateMutation.isPending || isAdminOrStaff} 
                  onClick={handleConfirm}
                >
                  {participateMutation.isPending ? (
                    <><Loader2 className="h-6 w-6 animate-spin mr-2" /> PROCESSING...</>
                  ) : isAdminOrStaff ? (
                    <><LockIcon className="h-5 w-5 mr-2" /> RESTRICTED ROLE</>
                  ) : (
                    <>
                      {t("confirmSelection")}
                      <div className="ml-3 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover/submit:translate-x-1 transition-transform">
                         <ChevronRight className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                    </>
                  )}
                </Button>
                
                <p className="text-[9px] text-center mt-6 text-muted-foreground font-black uppercase tracking-[0.15em] opacity-40 flex items-center justify-center gap-2">
                   <ShieldCheck className="h-3 w-3" /> Secure Transaction Guaranteed
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 rounded-3xl bg-surface-warm border border-border/40 space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Ticket className="h-3.5 w-3.5" /> Selection Guide
               </h4>
               <ul className="space-y-2">
                  <li className="text-[11px] font-bold text-muted-foreground/80 flex items-start gap-2">
                    <div className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                    Double-click to remove a number from selection.
                  </li>
                  <li className="text-[11px] font-bold text-muted-foreground/80 flex items-start gap-2">
                    <div className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                    You have 15 minutes to complete payment after choosing.
                  </li>
               </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Selection Bar */}
      {selected.size > 0 && !confirmed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden p-4 bg-background/80 backdrop-blur-xl border-t border-primary/20 animate-slide-in-up">
           <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Selection ({selected.size})</span>
                 <span className="text-sm font-black text-foreground tabular-nums">{(selected.size * ticketPrice).toLocaleString()} {currency}</span>
              </div>
              <Button 
                onClick={handleConfirm} 
                disabled={participateMutation.isPending}
                className="flex-1 rounded-2xl h-14 font-black shadow-2xl shadow-primary/30"
              >
                {participateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>RESERVE NOW <ChevronRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
           </div>
        </div>
      )}
    </PageShell>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
