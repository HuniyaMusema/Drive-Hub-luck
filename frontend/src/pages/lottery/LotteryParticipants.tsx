import { AdminLayout } from "@/components/AdminLayout";
import { Users } from "lucide-react";

const participants = [
  { id: "u1", name: "Sarah Chen", email: "sarah@example.com", numbers: [5, 14, 28], tickets: 3, joined: "Mar 18, 2026" },
  { id: "u2", name: "James Okafor", email: "james@example.com", numbers: [9, 42], tickets: 2, joined: "Mar 18, 2026" },
  { id: "u3", name: "Marcus Rivera", email: "marcus@example.com", numbers: [9, 42, 55], tickets: 3, joined: "Mar 17, 2026" },
  { id: "u4", name: "Lucia Gomez", email: "lucia@example.com", numbers: [17, 33, 68, 91], tickets: 4, joined: "Mar 16, 2026" },
  { id: "u5", name: "Yonas Tadesse", email: "yonas@example.com", numbers: [3, 77], tickets: 2, joined: "Mar 15, 2026" },
];

export default function LotteryParticipants() {
  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Lottery Participants</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl shadow-sm p-5 border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Participants</p>
          <p className="text-3xl font-bold text-foreground">{participants.length}</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-5 border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Tickets</p>
          <p className="text-3xl font-bold text-foreground">{participants.reduce((s, p) => s + p.tickets, 0)}</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-5 border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Draw</p>
          <p className="text-3xl font-bold text-foreground">#18</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left bg-muted/30">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Selected Numbers</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Tickets</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.numbers.map((n) => (
                        <span
                          key={n}
                          className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full tabular-nums"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium">{p.tickets}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
