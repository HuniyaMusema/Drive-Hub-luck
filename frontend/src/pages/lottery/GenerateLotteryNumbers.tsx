import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Loader2, Hash, CheckCircle2, Clock, CircleDot, RefreshCw, LayoutGrid } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "available" | "pending" | "confirmed";

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  available: { label: "Available", bg: "bg-slate-50",      text: "text-slate-400",   border: "border-slate-200" },
  pending:   { label: "Pending",   bg: "bg-amber-400/10",  text: "text-[#f5b027]",   border: "border-amber-400/20" },
  confirmed: { label: "Confirmed", bg: "bg-[#4CBFBF]/10", text: "text-[#4CBFBF]", border: "border-[#4CBFBF]/20" },
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
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
            <Hash className="h-7 w-7 text-[#4CBFBF]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {t("glNumberBoard")}
            </h1>
            {/* Subtitle — wraps instead of clamping */}
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 leading-relaxed">
              {lottery
                ? <>
                    {t("glLiveView")} &nbsp;·&nbsp;
                    {t("glActiveDrawText")}&nbsp;
                    <span className="text-[#4CBFBF]">#{lottery.id.split('-')[0].toUpperCase()}</span>
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
          className="gap-2 rounded-2xl border-slate-200 bg-white hover:text-[#4CBFBF] transition-all shadow-sm h-12 px-6 font-black text-slate-500 uppercase tracking-widest text-[10px] shrink-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#4CBFBF]' : ''}`} />
          {t("payRefresh")}
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: t("glTotalNumbers"),    value: total,               color: "text-slate-900",    bg: "bg-white",          border: "border-slate-200",   icon: "🎰" },
          { label: t("available"),         value: stats?.available ?? 0, color: "text-slate-400",  bg: "bg-slate-50",       border: "border-slate-200",   icon: "○" },
          { label: t("lpPendingReview"),   value: stats?.pending ?? 0,  color: "text-[#f5b027]",   bg: "bg-slate-50",       border: "border-slate-200",   icon: "⏳" },
          { label: t("lpConfirmedTickets"),value: stats?.confirmed ?? 0,color: "text-[#4CBFBF]", bg: "bg-slate-50",     border: "border-slate-200", icon: "✓" },
        ].map(({ label, value, color, bg, border, icon }) => (
          <div key={label} className={`rounded-[2rem] p-8 border ${border} ${bg} shadow-xl shadow-slate-100 hover:-translate-y-1 transition-all relative overflow-hidden group`}>
             <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.05] bg-current blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ${color}`} />
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-3 leading-tight">{label}</p>
            <p className={`text-4xl font-black tabular-nums tracking-tighter ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-3 mb-8">
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
            all:       "bg-white text-slate-900 border-slate-200 shadow-xl shadow-slate-100",
            available: "bg-slate-600 text-white border-slate-600 shadow-xl shadow-slate-100",
            pending:   "bg-[#f5b027] text-white border-[#f5b027] shadow-xl shadow-amber-500/10",
            confirmed: "bg-[#4CBFBF] text-white border-[#4CBFBF] shadow-xl shadow-[#4CBFBF]/10",
          };
 
          const iconMap: Record<FilterType, typeof Hash> = {
            all: Hash, available: CircleDot, pending: Clock, confirmed: CheckCircle2,
          };
          const Icon = iconMap[key];
 
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200
                ${filter === key
                  ? activeStyles[key]
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#4CBFBF]/40 hover:text-slate-900 shadow-sm'}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{labelMap[key]}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tabular-nums transition-colors ${filter === key ? 'bg-black/10' : 'bg-slate-50 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Number Grid Panel ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-10 shadow-slate-100">
 
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-[#4CBFBF] opacity-20" />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Loading numbers…</p>
          </div>
 
        ) : !lottery ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-200 shadow-inner">
              <Hash className="h-12 w-12 text-slate-300" strokeWidth={1} />
            </div>
            <div>
              <p className="font-black text-slate-900 uppercase tracking-[0.2em] text-sm">{t("glNoActiveLottery")}</p>
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-2">{t("glGoToLotteryManagement")}</p>
            </div>
          </div>
 
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
             <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 opacity-50">
               <LayoutGrid className="h-6 w-6 text-slate-300" />
             </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t("glNoNumbersMatch")}</p>
          </div>

        ) : (
          /* Responsive number grid — uses fluid columns so numbers never overflow */
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}
          >
            {filtered
              .sort((a, b) => a.number - b.number)
              .map((n) => {
                const cfg = statusConfig[n.status] ?? statusConfig.available;
                return (
                  <div
                    key={n.id}
                    title={`#${n.number} · ${cfg.label}${n.assigned_to_name ? ` · ${n.assigned_to_name}` : ''}`}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-[12px] font-black tabular-nums
                      border transition-all duration-300 hover:scale-110 hover:shadow-xl hover:z-10 cursor-default select-none
                      ${cfg.bg} ${cfg.text} ${cfg.border} hover:border-[#4CBFBF]/30 hover:shadow-[#4CBFBF]/10`}
                  >
                    {n.number.toString().padStart(2, '0')}
                  </div>
                );
            })}
          </div>
        )}

        {/* Legend */}
        {lottery && (
          <div className="flex flex-wrap items-center gap-8 mt-12 pt-8 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Legend:</span>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span className={`w-5 h-5 rounded-lg border flex-shrink-0 ${cfg.bg} ${cfg.border}`} />
                {key === 'available' ? t("available") : key === 'pending' ? t("lpPendingReview") : t("lpConfirmedTickets")}
              </span>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
