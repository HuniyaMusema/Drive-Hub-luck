import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Loader2, Hash, CheckCircle2, Clock, CircleDot, RefreshCw, LayoutGrid } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "available" | "pending" | "confirmed";

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  available: { label: "Available", bg: "bg-slate-50",    text: "text-slate-500",   border: "border-slate-200" },
  pending:   { label: "Pending",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200" },
  confirmed: { label: "Confirmed", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
};

export default function GenerateLotteryNumbers() {
  const { data: numbers = [], isLoading: numbersLoading } = useLotteryNumbers();
  const { data: lotteryData, isLoading: lotteryLoading } = useCurrentLottery();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [filter, setFilter] = useState<FilterType>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lottery = lotteryData?.lottery;
  const stats   = lotteryData?.number_stats;

  const lotteryNumbers = useMemo(() => {
    if (!lottery) return numbers;
    return numbers.filter(n => n.lottery_id === lottery?.id);
  }, [numbers, lottery]);

  const filtered = useMemo(() =>
    filter === "all" ? lotteryNumbers : lotteryNumbers.filter(n => n.status === filter),
  [lotteryNumbers, filter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['lottery', 'numbers'] });
    await queryClient.invalidateQueries({ queryKey: ['lottery', 'current'] });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const isLoading = numbersLoading || lotteryLoading;
  const total = (stats?.available ?? 0) + (stats?.pending ?? 0) + (stats?.confirmed ?? 0);

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
            <Hash className="h-6 w-6 text-[#10b981]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {t("glNumberBoard")}
            </h1>
            {/* Subtitle — wraps instead of clamping */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-relaxed">
              {lottery
                ? <>
                    {t("glLiveView")} &nbsp;·&nbsp;
                    {t("glActiveDrawText")}&nbsp;
                    <span className="text-[#10b981]">#{lottery.id.split('-')[0].toUpperCase()}</span>
                    &nbsp;·&nbsp;
                    {t("glRangeText")} {lottery.start_number}–{lottery.end_number}
                  </>
                : t("glNumbersGeneratedAuto")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-2xl border-slate-200 bg-white hover:border-[#10b981]/40 hover:text-slate-900 transition-all shadow-sm h-10 px-5 font-black text-slate-500 uppercase tracking-widest text-[10px] shrink-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#10b981]' : ''}`} />
          {t("payRefresh")}
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("glTotalNumbers"),    value: total,               color: "text-slate-900",    bg: "bg-white",          border: "border-slate-200",   icon: "🎰" },
          { label: t("available"),         value: stats?.available ?? 0, color: "text-slate-600",  bg: "bg-slate-50",       border: "border-slate-100",   icon: "○" },
          { label: t("lpPendingReview"),   value: stats?.pending ?? 0,  color: "text-amber-700",   bg: "bg-amber-50",       border: "border-amber-100",   icon: "⏳" },
          { label: t("lpConfirmedTickets"),value: stats?.confirmed ?? 0,color: "text-emerald-700", bg: "bg-emerald-50",     border: "border-emerald-100", icon: "✓" },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} className={`rounded-2xl p-5 border ${border} ${bg} hover:-translate-y-1 transition-all`}>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 leading-tight">{label}</p>
            <p className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "available", "pending", "confirmed"] as FilterType[]).map((key) => {
          const count = key === "all"
            ? lotteryNumbers.length
            : lotteryNumbers.filter(n => n.status === key).length;

          const labelMap: Record<FilterType, string> = {
            all:       t("payAll"),
            available: t("available"),
            pending:   t("lpPendingReview"),
            confirmed: t("lpConfirmedTickets"),
          };

          const activeStyles: Record<FilterType, string> = {
            all:       "bg-slate-900 text-white border-slate-900 shadow-lg",
            available: "bg-slate-600 text-white border-slate-600 shadow-lg",
            pending:   "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200",
            confirmed: "bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-emerald-200",
          };

          const iconMap: Record<FilterType, typeof Hash> = {
            all: Hash, available: CircleDot, pending: Clock, confirmed: CheckCircle2,
          };
          const Icon = iconMap[key];

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200
                ${filter === key
                  ? activeStyles[key]
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 shadow-sm'}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{labelMap[key]}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tabular-nums ${filter === key ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Number Grid Panel ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#10b981] opacity-40" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading numbers…</p>
          </div>

        ) : !lottery ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Hash className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-black text-slate-700 uppercase tracking-widest text-sm">{t("glNoActiveLottery")}</p>
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">{t("glGoToLotteryManagement")}</p>
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <LayoutGrid className="h-8 w-8 text-slate-300" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t("glNoNumbersMatch")}</p>
          </div>

        ) : (
          /* Responsive number grid — uses fluid columns so numbers never overflow */
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))' }}
          >
            {filtered
              .sort((a, b) => a.number - b.number)
              .map((n) => {
                const cfg = statusConfig[n.status] ?? statusConfig.available;
                return (
                  <div
                    key={n.id}
                    title={`#${n.number} · ${cfg.label}${n.assigned_to_name ? ` · ${n.assigned_to_name}` : ''}`}
                    className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-extrabold tabular-nums
                      border transition-all duration-150 hover:scale-110 hover:shadow-md cursor-default select-none
                      ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {n.number.toString().padStart(2, '0')}
                  </div>
                );
            })}
          </div>
        )}

        {/* Legend */}
        {lottery && (
          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legend:</span>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                <span className={`w-4 h-4 rounded-lg border flex-shrink-0 ${cfg.bg} ${cfg.border}`} />
                {key === 'available' ? t("available") : key === 'pending' ? t("lpPendingReview") : t("lpConfirmedTickets")}
              </span>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
