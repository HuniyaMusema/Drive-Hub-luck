import { AdminLayout } from "@/components/AdminLayout";
import { Car, CalendarCheck, Ticket, CreditCard, Users, TrendingUp } from "lucide-react";

const cards = [
  { icon: Car, label: "Total Vehicles", value: "47", change: "+3 this month" },
  { icon: CalendarCheck, label: "Active Rentals", value: "12", change: "4 pending" },
  { icon: Ticket, label: "Lottery Entries", value: "73", change: "Draw #18 active" },
  { icon: CreditCard, label: "Pending Payments", value: "8", change: "2 new today" },
  { icon: Users, label: "Registered Users", value: "318", change: "+24 this week" },
  { icon: TrendingUp, label: "Revenue (MTD)", value: "$14,280", change: "+12%" },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground tabular-nums">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.change}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
