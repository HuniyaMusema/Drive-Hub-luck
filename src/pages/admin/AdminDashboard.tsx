import { AdminLayout } from "@/components/AdminLayout";
import { Car, CalendarCheck, Ticket, CreditCard, Users, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const cards = [
  { icon: Car, label: "Total Vehicles", value: "47", change: "+3 this month", color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50" },
  { icon: CalendarCheck, label: "Active Rentals", value: "12", change: "4 pending", color: "text-green-500", bg: "bg-green-500/10", border: "hover:border-green-500/50" },
  { icon: Ticket, label: "Lottery Entries", value: "73", change: "Draw #18 active", color: "text-purple-500", bg: "bg-purple-500/10", border: "hover:border-purple-500/50" },
  { icon: CreditCard, label: "Pending Lottery Payments", value: "8", change: "2 new today", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
  { icon: Users, label: "Registered Users", value: "318", change: "+24 this week", color: "text-pink-500", bg: "bg-pink-500/10", border: "hover:border-pink-500/50" },
  { icon: TrendingUp, label: "Revenue (MTD)", value: "$14,280", change: "+12%", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 to-primary/80 text-primary-foreground p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary/20">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase shadow-sm w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                {user?.role === "lottery_staff" ? "Lottery Portal" : "Admin Command Center"}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                {getGreeting()}, {user?.name?.split(' ')[0] || "Admin"}!
              </h1>
              <p className="text-white/90 max-w-lg text-sm sm:text-base font-medium">
                Here's what's happening with Gech today. Review your pending items and monitor business operations seamlessly.
              </p>
            </div>
            
            <div className="hidden lg:block relative group">
               <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full transition-all duration-700 group-hover:scale-110 group-hover:bg-white/40" />
               <Car className="h-32 w-32 relative z-10 opacity-90 drop-shadow-2xl transform -rotate-6 transition-all duration-700 group-hover:rotate-0 group-hover:scale-105" strokeWidth={1} color="white" />
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Stats Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Overview Metrics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.filter(c => user?.role === "admin" || c.icon === Ticket || c.icon === CreditCard).map((c, i) => (
              <div 
                key={c.label} 
                className={`bg-card rounded-2xl p-6 shadow-sm border border-border/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${c.border} cursor-default relative overflow-hidden group`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${c.bg} group-hover:scale-110 group-hover:shadow-sm`}>
                    <c.icon className={`h-6 w-6 ${c.color}`} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground leading-tight">{c.label}</span>
                </div>
                <div className="flex items-end justify-between relative z-10">
                  <p className="text-3xl font-extrabold text-card-foreground tabular-nums tracking-tighter">
                    {c.value}
                  </p>
                  <p className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/50 text-accent-foreground border border-accent`}>
                    {c.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
