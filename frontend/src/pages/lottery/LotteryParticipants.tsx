import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Users, Loader2, Search, Trophy, Hash, CheckCircle2, Clock } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { Input } from "@/components/ui/input";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  pending:   { label: "Pending",   className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  available: { label: "Available", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

export default function LotteryParticipants() {
  const { data: numbers = [], isLoading } = useLotteryNumbers();
  const { data: lotteryData } = useCurrentLottery();
  const [search, setSearch] = useState("");

  const participants = useMemo(() => {
    const map = new Map<string, { id: string; name: string; numbers: number[]; statuses: string[]; joined: string }>();
    numbers.forEach((n) => {
      if (!n.user_id) return;
      if (!map.has(n.user_id)) {
        map.set(n.user_id, {
          id: n.user_id,
          name: n.assigned_to_name || "Unknown User",
          numbers: [],
          statuses: [],
          joined: n.created_at,
        });
      }
      const p = map.get(n.user_id)!;
      p.numbers.push(n.number);
      p.statuses.push(n.status);
    });
    return Array.from(map.values());
  }, [numbers]);

  const filtered = useMemo(() =>
    search.trim()
      ? participants.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.numbers.some(n => n.toString().includes(search))
        )
      : participants,
  [participants, search]);

  const confirmedCount = useMemo(() => numbers.filter(n => n.status === "confirmed").length, [numbers]);
  const pendingCount   = useMemo(() => numbers.filter(n => n.status === "pending").length, [numbers]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Lottery Participants</h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Active Draw: <span className="font-bold text-primary">#{lotteryData?.lottery?.id.split('-')[0].toUpperCase() ?? "None"}</span>
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-primary/30"
            placeholder="Search by name or ticket #…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Participants", value: participants.length, icon: Users, color: "text-foreground", bg: "bg-primary/5", border: "border-primary/10" },
          { label: "Confirmed Tickets",  value: confirmedCount,      icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/5", border: "border-green-500/10" },
          { label: "Pending Review",     value: pendingCount,        icon: Clock,  color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-2xl shadow-sm p-6 border ${border} ${bg} hover:shadow-md transition-all duration-200 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-current blur-2xl -mr-8 -mt-8" />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">{label}</p>
            <div className="flex items-end justify-between">
              <p className={`text-4xl font-extrabold tabular-nums ${color}`}>{value}</p>
              <Icon className={`h-7 w-7 ${color} opacity-30`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-xl shadow-primary/5 overflow-hidden border border-border/60">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground opacity-40" />
              </div>
              <p className="font-bold text-foreground">{search ? "No participants matching your search." : "No verified participants found yet."}</p>
              <p className="text-muted-foreground text-xs">Participants appear once a payment has been submitted.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">#</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Participant</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Ticket Numbers</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-center">Count</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const hasConfirmed = p.statuses.includes("confirmed");
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="px-5 py-4 tabular-nums text-muted-foreground text-xs font-bold">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${hasConfirmed ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {p.numbers.sort((a, b) => a - b).map((n, idx) => {
                            const st = p.statuses[idx];
                            return (
                              <span key={n} className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border tabular-nums shadow-sm ${statusConfig[st]?.className ?? ''}`}>
                                {n.toString().padStart(3, '0')}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 tabular-nums font-extrabold text-center text-lg text-foreground">{p.numbers.length}</td>
                      <td className="px-5 py-4 text-muted-foreground tabular-nums text-right text-xs font-medium">
                        {new Date(p.joined).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between">
            <span>Showing {filtered.length} of {participants.length} participants</span>
            {search && (
              <button onClick={() => setSearch("")} className="text-primary hover:underline font-bold">Clear search</button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
