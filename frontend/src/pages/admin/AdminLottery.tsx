import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Square, Trophy } from "lucide-react";

const participants = [
  { user: "Sarah Chen", numbers: [5, 14, 28] },
  { user: "James Okafor", numbers: [9, 42] },
  { user: "Marcus Rivera", numbers: [9, 42, 55] },
  { user: "Lucia Gomez", numbers: [17, 33, 68, 91] },
];

export default function AdminLottery() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Lottery Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Current Draw #18</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Number Range</Label>
              <div className="flex gap-2">
                <Input type="number" defaultValue={1} className="w-20" />
                <span className="self-center text-muted-foreground">to</span>
                <Input type="number" defaultValue={100} className="w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ticket Price ($)</Label>
              <Input type="number" defaultValue={25} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1"><Play className="h-4 w-4 mr-1" /> Start</Button>
              <Button size="sm" variant="outline" className="flex-1"><Square className="h-4 w-4 mr-1" /> Stop</Button>
            </div>
          </form>
        </div>

        {/* Participants */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-card-foreground">Participants ({participants.length})</h2>
            <Button size="sm" variant="outline"><Trophy className="h-4 w-4 mr-1" /> Draw Winner</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2 font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground">Numbers</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.user} className="border-b last:border-0">
                    <td className="px-4 py-3">{p.user}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {p.numbers.map((n) => (
                          <span key={n} className="bg-accent/10 text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full tabular-nums">{n}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.numbers.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
