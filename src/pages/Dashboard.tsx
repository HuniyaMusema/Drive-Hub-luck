import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Car, Key, Ticket, CreditCard, User, ArrowRight, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { t } = useLanguage();

  const stats = [
    { icon: Key, label: t("activeRentals"), value: "1", color: "bg-primary/10 text-primary" },
    { icon: Ticket, label: t("lotteryEntries"), value: "3", color: "bg-accent/10 text-accent" },
    { icon: CreditCard, label: t("pendingPayments"), value: "1", color: "bg-amber-50 text-amber-600" },
  ];

  const quickLinks = [
    { icon: Car, label: t("browseCarsForSale"), to: "/cars/sale" },
    { icon: Key, label: t("rentACar"), to: "/cars/rent" },
    { icon: Heart, label: t("savedCars"), to: "/saved-cars" },
    { icon: Ticket, label: t("enterLotteryAction"), to: "/lottery" },
    { icon: CreditCard, label: t("payment"), to: "/payment" },
    { icon: User, label: t("myProfile"), to: "/profile" },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-1">{t("welcomeBack")}, Marcus</h1>
          <p className="text-muted-foreground">{t("activitySummary")}</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`bg-card rounded-xl p-6 shadow-sm transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-card-foreground tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-foreground mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-card-foreground text-sm">{link.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
