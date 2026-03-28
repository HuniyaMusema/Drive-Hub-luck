import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const rentals = [
  { id: "RNT-401", user: "Sarah Chen", car: "Prestige Sedan S", dates: "Mar 14–17", status: "active" },
  { id: "RNT-402", user: "James Okafor", car: "Metro City 200", dates: "Mar 18–19", status: "pending" },
  { id: "RNT-403", user: "Lucia Gomez", car: "Rugged Trail Pro", dates: "Mar 20–23", status: "pending" },
  { id: "RNT-404", user: "Marcus Rivera", car: "Prestige Sedan S", dates: "Mar 10–12", status: "completed" },
];

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-amber-50 text-amber-600",
  completed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminRentals() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Rental Management</h1>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Dates</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium tabular-nums">{r.id}</td>
                  <td className="px-4 py-3">{r.user}</td>
                  <td className="px-4 py-3">{r.car}</td>
                  <td className="px-4 py-3 tabular-nums">{r.dates}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Check className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
