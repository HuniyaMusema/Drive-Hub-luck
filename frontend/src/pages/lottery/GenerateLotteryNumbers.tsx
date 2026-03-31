import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Loader2, Hash, CheckCircle2, Clock, CircleDot, RefreshCw } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "available" | "pending" | "confirmed";

const statusConfig: Record<string, { label: string; bg: string; text: string; ring: string }> = {
  available: { label: "Available", bg: "bg-muted/60",           text: "text-muted-foreground/60",  ring: "ring-border/30" },
  pending:   { label: "Pending",   bg: "bg-amber-500/15",       text: "text-amber-700",             ring: "ring-amber-500/30" },
  confirmed: { label: "Confirmed", bg: "bg-green-500/15",       text: "text-green-700",             ring: "ring-green-500/30" },
};

const filterConfig: { key: FilterType; label: string; icon: typeof Hash; color: string }[] = [
  { key: "all",       label: "All",       icon: Hash,          color: "text-foreground" },
  { key: "available", label: "Available", icon: CircleDot,     color: "text-muted-foreground" },
  { key: "pending",   label: "Pending",   icon: Clock,         color: "text-amber-600" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2,  color: "text-green-600" },
];

export default function GenerateLotteryNumbers() {
  const { data: numbers = [], isLoading: numbersLoading } = useLotteryNumbers();
  const { data: lotteryData, isLoading: lotteryLoading } = useCurrentLottery();
  const queryClient = useQueryClient();

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

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Number Board</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Live view of all ticket numbers and their current status for the active draw.
              {lottery
                ? <> Active draw <span className="font-bold text-primary">#{lottery.id.split('-')[0].toUpperCase()}</span> · Range {lottery.start_number} – {lottery.end_number}</>
                : " Numbers are generated automatically when Admin creates a new lottery."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-border/60 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Numbers", value: (stats?.available ?? 0) + (stats?.pending ?? 0) + (stats?.confirmed ?? 0), color: "text-foreground", bg: "bg-primary/5", border: "border-primary/10" },
          { label: "Available",     value: stats?.available ?? 0, color: "text-blue-600",   bg: "bg-blue-500/5",  border: "border-blue-500/10" },
          { label: "Pending",       value: stats?.pending   ?? 0, color: "text-amber-600",  bg: "bg-amber-500/5", border: "border-amber-500/10" },
          { label: "Confirmed",     value: stats?.confirmed ?? 0, color: "text-green-600",  bg: "bg-green-500/5", border: "border-green-500/10" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl p-5 border ${border} ${bg} hover:shadow-md transition-all`}>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterConfig.map(({ key, label, icon: Icon, color }) => {
          const count = key === "all" ? lotteryNumbers.length : lotteryNumbers.filter(n => n.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150
                ${filter === key
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground shadow-sm'}`}
            >
              <Icon className={`h-3.5 w-3.5 ${filter === key ? '' : color}`} />
              {label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums
                ${filter === key ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Number Grid */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
          </div>
        ) : !lottery ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Hash className="h-8 w-8 text-muted-foreground opacity-30" />
            </div>
            <p className="font-bold text-foreground">No active lottery found.</p>
            <p className="text-muted-foreground text-xs">Go to Lottery Management to create and start a new draw.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm font-medium">No numbers match the current filter.</p>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
            {filtered
              .sort((a, b) => a.number - b.number)
              .map((n) => {
                const cfg = statusConfig[n.status] ?? statusConfig.available;
                return (
                  <div
                    key={n.id}
                    title={`#${n.number} · ${cfg.label}${n.assigned_to_name ? ` · ${n.assigned_to_name}` : ''}`}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-extrabold tabular-nums
                      ring-1 transition-all duration-150 hover:scale-110 hover:shadow-md cursor-default select-none
                      ${cfg.bg} ${cfg.text} ${cfg.ring}`}
                  >
                    {n.number.toString().padStart(2, '0')}
                  </div>
                );
            })}
          </div>
        )}

        {/* Legend */}
        {lottery && (
          <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-border/40">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className={`w-3 h-3 rounded-md ring-1 ${cfg.bg} ${cfg.ring}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
