import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ShoppingCart, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentLottery, useTakenNumbers, useParticipateLottery } from "@/hooks/useLottery";
import { useToast } from "@/hooks/use-toast";

export default function LotterySelect() {
  const { data: lotteryData, isLoading: loadingLottery } = useCurrentLottery();
  const { data: takenNumbersList = [], isLoading: loadingTaken } = useTakenNumbers();
  const participateMutation = useParticipateLottery();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const lottery = lotteryData?.lottery;
  const takenNumbers = useMemo(() => new Set(takenNumbersList), [takenNumbersList]);

  const toggle = (n: number) => {
    if (takenNumbers.has(n)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 5) next.add(n);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    try {
      await participateMutation.mutateAsync([...selected]);
      setConfirmed(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (confirmed) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 lg:px-8 text-center py-16 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("numbersReserved")}</h1>
          <p className="text-muted-foreground mb-2">{t("youSelected")} {[...selected].sort((a, b) => a - b).join(", ")}</p>
          <p className="text-sm text-muted-foreground mb-8">{t("completePayment")}</p>
          <div className="flex justify-center gap-3">
            <Link to="/payment"><Button size="lg">{t("goToPayment")}</Button></Link>
            <Link to="/lottery"><Button variant="outline" size="lg">{t("backToLottery")}</Button></Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <Link to="/lottery" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> {t("backToLottery")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t("selectYourNumbers")}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t("pickUpTo5")}</p>

            {loadingLottery || loadingTaken ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
            ) : !lottery ? (
              <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-dashed mb-6">
                <p className="text-sm text-muted-foreground font-medium">No lottery numbers currently available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
                {Array.from({ length: lottery.end_number - lottery.start_number + 1 }, (_, i) => i + lottery.start_number).map((n) => {
                  const taken = takenNumbers.has(n);
                  const active = selected.has(n);
                  return (
                    <button
                      key={n}
                      disabled={taken}
                      onClick={() => toggle(n)}
                      className={`aspect-square rounded-lg text-sm font-bold tabular-nums transition-all duration-200 active:scale-95 border
                        ${taken ? "bg-muted text-muted-foreground/40 cursor-not-allowed border-muted"
                          : active ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/50 border-primary"
                          : "bg-card text-card-foreground shadow-sm hover:shadow-md hover:bg-card/80 border-border"}`}
                    >
                      {n.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 mt-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-card shadow-sm border" /> {t("available")}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> {t("selected")}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted" /> {t("taken")}</span>
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="bg-card rounded-2xl shadow-xl p-6 sticky top-24 border border-border/50 shadow-primary/5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                   <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-bold text-card-foreground text-lg">{t("yourSelection")}</h2>
              </div>

              {selected.size === 0 ? (
                <div className="py-10 text-center border border-dashed rounded-xl">
                    <p className="text-xs text-muted-foreground italic">{t("noNumbersSelected")}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[...selected].sort((a, b) => a - b).map((n) => (
                      <span key={n} className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg tabular-nums shadow-sm">{n}</span>
                    ))}
                  </div>
                  <div className="border-t pt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("tickets")}</span>
                      <span className="font-bold text-card-foreground">{selected.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("priceEach")}</span>
                      <span className="font-bold text-card-foreground tabular-nums">$15.00</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-xl border-t pt-4">
                      <span>{t("total")}</span>
                      <span className="text-primary tabular-nums">${(selected.size * 15).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              <Button 
                className="w-full mt-8 rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20" 
                size="lg" 
                disabled={selected.size === 0 || participateMutation.isPending} 
                onClick={handleConfirm}
              >
                {participateMutation.isPending ? "Reserving..." : t("confirmSelection")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
