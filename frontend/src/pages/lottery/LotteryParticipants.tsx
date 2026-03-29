import { AdminLayout } from "@/components/AdminLayout";
import { Users, Loader2 } from "lucide-react";
import { useLotteryNumbers, useCurrentLottery } from "@/hooks/useLottery";
import { useMemo } from "react";

export default function LotteryParticipants() {
  const { data: numbers = [], isLoading } = useLotteryNumbers();
  const { data: lotteryData } = useCurrentLottery();

  const participants = useMemo(() => {
    const map = new Map();
    numbers.forEach((n) => {
      if (!n.user_id) return;
      if (!map.has(n.user_id)) {
        map.set(n.user_id, {
          id: n.user_id,
          name: n.assigned_to_name || "Unknown User",
          email: "N/A", // Email not in the numbers join currently
          numbers: [],
          joined: n.created_at,
        });
      }
      map.get(n.user_id).numbers.push(n.number);
    });
    return Array.from(map.values());
  }, [numbers]);

  const totalTickets = useMemo(() => 
    numbers.filter(n => n.user_id).length, 
  [numbers]);

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Lottery Participants</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/60 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Total Participants</p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums">{participants.length}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/60 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Confirmed Tickets</p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums font-display">{totalTickets}</p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border/60 hover:shadow-md transition-shadow">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Active Draw</p>
          <p className="text-3xl font-extrabold text-primary tabular-nums font-display">#{lotteryData?.lottery?.id.split('-')[0].toUpperCase() || "None"}</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border/60">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Name</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Numbers</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-center">Tickets</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground bg-muted/20">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-10 w-10 opacity-20" />
                        <p className="font-medium">No verified participants found yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {p.numbers.sort((a: number, b: number) => a - b).map((n: number) => (
                            <span
                              key={n}
                              className="bg-primary/5 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-primary/10 tabular-nums shadow-sm"
                            >
                              {n.toString().padStart(3, '0')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 tabular-nums font-bold text-center text-base">{p.numbers.length}</td>
                      <td className="px-5 py-4 text-muted-foreground tabular-nums text-right font-medium">
                        {new Date(p.joined).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
