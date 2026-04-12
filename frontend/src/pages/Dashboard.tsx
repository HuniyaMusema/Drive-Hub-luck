import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Car, Ticket, CreditCard, User, ArrowRight, Heart, Trophy, Clock, History, Settings } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileHistory } from "@/hooks/useLottery";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedCarsCount } = useSavedCars();
  const { data: history, isLoading } = useProfileHistory();

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'lottery_staff') {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const stats = useMemo(() => {
    const lotteries = history?.lotteries || [];
    const pending = lotteries.filter(l => l.status === 'pending' || l.payment_status === 'pending').length;
    const confirmed = lotteries.filter(l => l.status === 'confirmed' || l.payment_status === 'approved').length;
    return [
      { icon: Ticket,   label: t("activeEntries"),   value: confirmed.toString(),      color: "text-[#4CBFBF]", bg: "bg-[#4CBFBF]/10", to: "/profile?tab=history" },
      { icon: CreditCard, label: t("pendingPayments"), value: pending.toString(),       color: "text-amber-500", bg: "bg-amber-500/10",  to: "/profile?tab=history" },
      { icon: Heart,    label: t("savedVehicles"),    value: savedCarsCount.toString(), color: "text-rose-500",  bg: "bg-rose-500/10",   to: "/saved-cars" },
    ];
  }, [history, t, savedCarsCount]);

  const quickLinks = [
    { icon: Car,       label: t("browseCarsForSale"),              to: "/cars/sale",           desc: t("buyACarDesc").slice(0, 40) + "…", color: "bg-blue-500" },
    { icon: Ticket,    label: t("enterLotteryAction"),             to: "/lottery",             desc: t("carLotteryDesc").slice(0, 40) + "…", color: "bg-[#4CBFBF]" },
    { icon: CreditCard,label: t("payment"),                        to: "/payment",             desc: t("paymentPageDesc").slice(0, 40) + "…", color: "bg-amber-500" },
    { icon: User,      label: t("myProfile"),                      to: "/profile",             desc: t("profProfileConfiguration"),       color: "bg-slate-600" },
    { icon: History,   label: t("activityHistory") || "History",   to: "/profile?tab=history", desc: t("profFinancialHistory"),           color: "bg-indigo-500" },
  ];

  return (
    <PageShell>
      <div className="bg-[#f0f2f5] min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 py-10 max-w-5xl">

          {/* Welcome Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">{t("userAccountTier")}</p>
              <h1 className="text-2xl font-bold text-slate-800">
                {t("welcomeBack")}, <span className="text-[#4CBFBF]">{user?.name?.split(' ')[0] || "User"}</span> 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t("dashboardSubtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium">
                  <Settings className="h-4 w-4 mr-1.5" /> {t("myProfile")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                onClick={() => navigate(s.to)}
                className={cn(
                  "bg-white rounded-2xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                    <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#4CBFBF] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-slate-800 tabular-nums mb-1">{s.value}</p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-[#4CBFBF] rounded-full" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t("quickActions")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((link, i) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all group",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
                  )}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0", link.color)}>
                    <link.icon className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#4CBFBF] transition-colors truncate">{link.label}</span>
                    <span className="block text-xs text-slate-400 truncate">{link.desc}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#4CBFBF] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={cn("space-y-4 pb-10", isVisible ? "opacity-100" : "opacity-0")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-[#4CBFBF] rounded-full" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t("profRecentActivity")}</h2>
              </div>
              <Link to="/profile?tab=history" className="text-xs text-[#4CBFBF] hover:underline font-medium">{t("profSynchronizedLedger")} →</Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-slate-50 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : (history?.lotteries?.length ?? 0) === 0 ? (
                <div className="py-16 text-center">
                  <History className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500 mb-1">{t("profNoActiveHistory")}</p>
                  <p className="text-xs text-slate-400 mb-4">{t("profStartJourney")}</p>
                  <Link to="/lottery">
                    <Button size="sm" className="rounded-xl bg-[#4CBFBF] hover:bg-[#3fb0b0] text-white border-0 text-xs">{t("enterLotteryAction")}</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {history?.lotteries?.slice(0, 5).map((l: any) => {
                    const isConfirmed = l.status === 'confirmed' || l.payment_status === 'approved';
                    const isPending = l.payment_status === 'pending';
                    const isAwaiting = !isConfirmed && !isPending;
                    return (
                      <div
                        key={l.id}
                        onClick={() => isAwaiting && navigate("/payment", { state: { tickets: [l] } })}
                        className={cn("flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group", isAwaiting && "cursor-pointer")}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm tabular-nums shrink-0">
                          #{l.number.toString().padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-[#4CBFBF] transition-colors truncate">{t("profStandardEntry")}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {new Date(l.date || l.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 border",
                          isConfirmed ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          isPending   ? "bg-blue-50   text-blue-600   border-blue-200"    :
                                        "bg-amber-50  text-amber-600  border-amber-200"
                        )}>
                          {isConfirmed ? t("profConfirmedEntry") : isPending ? t("payUnderReview") : t("profAwaitingPayment")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
