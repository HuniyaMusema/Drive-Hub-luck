import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Users, Loader2, Search, Trophy, Hash, CheckCircle2, Clock } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending:   { label: "Pending",   className: "bg-amber-50 text-amber-700 border-amber-200" },
  available: { label: "Available", className: "bg-slate-50 text-slate-400 border-slate-200" },
};

export default function LotteryParticipants() {
  const { data: numbers = [], isLoading } = useLotteryNumbers();
  const { data: lotteryData } = useCurrentLottery();
  const [search, setSearch] = useState("");
  const { t } = useLanguage();

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
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("lpLotteryParticipants")}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 line-clamp-1">
              {t("lpActiveDraw")} <span className="text-emerald-600">#{lotteryData?.lottery?.id.split('-')[0].toUpperCase() ?? "None"}</span>
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 rounded-2xl bg-white border-slate-200 focus-visible:ring-emerald-500/20 h-10 font-black text-slate-900 px-5"
            placeholder={t("lpSearchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: t("lpTotalParticipants"), value: participants.length, icon: Users, color: "text-slate-900", bg: "bg-white", border: "border-slate-200 shadow-sm" },
          { label: t("lpConfirmedTickets"),  value: confirmedCount,      icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/30", border: "border-emerald-200/50" },
          { label: t("lpPendingReview"),     value: pendingCount,        icon: Clock,  color: "text-amber-600", bg: "bg-amber-50/30", border: "border-amber-200/50" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-3xl p-8 border ${border} ${bg} hover:translate-y-[-4px] transition-all relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] bg-current blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ${color}`} />
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">{label}</p>
            <div className="flex items-end justify-between">
              <p className={`text-4xl font-black tabular-nums tracking-tighter ${color}`}>{value}</p>
              <Icon className={`h-8 w-8 ${color} opacity-20 group-hover:scale-110 transition-transform`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden shadow-slate-200/50 mb-10">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-emerald-500 opactiy-20" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <Users className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-widest text-xs">{search ? t("lpNoParticipantsMatching") : t("lpNoVerifiedParticipants")}</p>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">{t("lpParticipantsAppearOnce")}</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-slate-50/50">
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">#</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t("lpParticipant")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">{t("lpTicketNumbers")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-center">{t("lpCount")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-right">{t("lpJoined")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const hasConfirmed = p.statuses.includes("confirmed");
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 tabular-nums text-slate-400 text-[10px] font-black">{i + 1}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 border transition-all ${hasConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-black text-slate-900 tracking-tighter uppercase text-[11px] group-hover:text-emerald-600 transition-colors">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2 max-w-sm">
                          {p.numbers.sort((a, b) => a - b).map((n, idx) => {
                            const st = p.statuses[idx];
                            return (
                              <span key={n} className={`text-[10px] font-black px-3 py-1 rounded-xl border tabular-nums shadow-sm transition-all hover:scale-110 ${statusConfig[st]?.className ?? ''}`}>
                                {n.toString().padStart(3, '0')}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-6 tabular-nums font-black text-center text-2xl text-emerald-600 tracking-tighter">{p.numbers.length}</td>
                      <td className="px-8 py-6 text-slate-400 tabular-nums text-right text-[10px] font-black uppercase tracking-widest">
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
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
            <span>{t("lpShowingParticipants")} <span className="text-slate-900">{filtered.length}</span> {t("lpOf")} <span className="text-slate-900">{participants.length}</span></span>
            {search && (
              <button onClick={() => setSearch("")} className="text-emerald-600 hover:text-emerald-700 font-black tracking-widest">{t("lpClearSearch")}</button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
