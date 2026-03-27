import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TOTAL = 100;
const takenNumbers = new Set([3, 7, 12, 15, 22, 34, 41, 56, 63, 71, 78, 85, 88, 92, 99]);

export default function LotterySelect() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const { t } = useLanguage();

  const toggle = (n: number) => {
    if (takenNumbers.has(n)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 5) next.add(n);
      return next;
    });
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

            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
                const taken = takenNumbers.has(n);
                const active = selected.has(n);
                return (
                  <button
                    key={n}
                    disabled={taken}
                    onClick={() => toggle(n)}
                    className={`aspect-square rounded-lg text-sm font-bold tabular-nums transition-all duration-200 active:scale-95
                      ${taken ? "bg-muted text-muted-foreground/40 cursor-not-allowed"
                        : active ? "bg-accent text-accent-foreground shadow-md ring-2 ring-accent/50"
                        : "bg-card text-card-foreground shadow-sm hover:shadow-md hover:bg-card/80"}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-card shadow-sm border" /> {t("available")}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent" /> {t("selected")}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted" /> {t("taken")}</span>
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="bg-card rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-card-foreground">{t("yourSelection")}</h2>
              </div>

              {selected.size === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noNumbersSelected")}</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[...selected].sort((a, b) => a - b).map((n) => (
                      <span key={n} className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-full tabular-nums">{n}</span>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("tickets")}</span>
                      <span className="font-medium text-card-foreground">{selected.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("priceEach")}</span>
                      <span className="font-medium text-card-foreground tabular-nums">$25.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{t("total")}</span>
                      <span className="text-primary tabular-nums">${(selected.size * 25).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              <Button className="w-full mt-6" size="lg" disabled={selected.size === 0} onClick={() => setConfirmed(true)}>
                {t("confirmSelection")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
