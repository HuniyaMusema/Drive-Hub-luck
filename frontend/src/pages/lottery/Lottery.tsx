import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Ticket, Shield, Star, ArrowRight, Trophy, DollarSign, Hash } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Lottery() {
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: detailsRef, isVisible: detailsVisible } = useScrollReveal();
  const { t } = useLanguage();

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{t("lotteryTagline")}</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">{t("lotteryTitle")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">{t("lotteryDesc")}</p>
        </div>

        <div
          ref={detailsRef}
          className={`max-w-3xl mx-auto mb-16 bg-primary rounded-2xl overflow-hidden shadow-lg transition-all duration-700 ${detailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="p-8 lg:p-12 text-primary-foreground">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-accent font-semibold text-sm uppercase tracking-widest">{t("currentDraw")}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">{t("grandPrize")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">{t("ticketPrice")}</p>
                  <p className="font-bold text-lg tabular-nums">$25.00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Hash className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">{t("numberRange")}</p>
                  <p className="font-bold text-lg tabular-nums">1 – 100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Ticket className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">{t("ticketsLeft")}</p>
                  <p className="font-bold text-lg tabular-nums">73 / 100</p>
                </div>
              </div>
            </div>
            <Link to="/lottery/select" className="mt-8 inline-block">
              <Button variant="hero" size="xl">
                {t("selectYourNumbers")} <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div ref={stepsRef} className="max-w-3xl mx-auto">
          <h2 className={`text-2xl font-bold text-foreground text-center mb-10 transition-all duration-700 ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {t("howItWorks")}
          </h2>
          <div className="space-y-6">
            {[
              { icon: Ticket, title: t("chooseNumbers"), desc: t("chooseNumbersDesc") },
              { icon: Shield, title: t("submitPayment"), desc: t("submitPaymentDesc") },
              { icon: Star, title: t("waitForDraw"), desc: t("waitForDrawDesc") },
            ].map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-5 bg-card rounded-xl p-6 shadow-sm transition-all duration-700 ${stepsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
                style={{ transitionDelay: `${(i + 1) * 120}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-widest mb-1">{t("step")} {i + 1}</div>
                  <h3 className="font-semibold text-card-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-16 bg-surface-warm rounded-2xl p-8">
          <h3 className="font-bold text-foreground mb-4">{t("lotteryRules")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t("rule1")}</li>
            <li>• {t("rule2")}</li>
            <li>• {t("rule3")}</li>
            <li>• {t("rule4")}</li>
            <li>• {t("rule5")}</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
