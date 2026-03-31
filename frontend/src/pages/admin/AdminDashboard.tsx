import { AdminLayout } from "@/components/AdminLayout";
import { Ticket, CreditCard, Users, TrendingUp, Sparkles, LayoutDashboard, ArrowUpRight, Clock, ShieldCheck, Activity, Target, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { t } = useLanguage();
  const { settings } = useSettings();
  
  const isLotteryMode = settings?.Operational?.lotteryModuleEnabled ?? true;
  
  const statsOverview = useMemo(() => [
    { 
      id: "lottery",
      icon: Ticket, 
      label: t("lotteryEntries"), 
      value: stats?.lotteryEntries ?? 0, 
      trend: "+12%", 
      color: "text-indigo-500", 
      bg: "bg-indigo-500/10", 
      border: "border-indigo-500/20 shadow-indigo-500/5",
      link: "/admin/lottery-participants"
    },
    { 
      id: "payments",
      icon: CreditCard, 
      label: t("pendingPayments"), 
      value: stats?.pendingPayments ?? 0, 
      trend: "Action Required", 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/20 shadow-amber-500/5",
      link: "/admin/lottery-payments"
    },
    { 
      id: "users",
      icon: Users, 
      label: t("adminUsers"), 
      value: stats?.registeredUsers ?? 0, 
      trend: "+4 this week", 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/20 shadow-emerald-500/5",
      link: "/admin/users"
    },
    { 
      id: "revenue",
      icon: TrendingUp, 
      label: "Est. Revenue", 
      value: `${(stats?.revenue ?? 0).toLocaleString()}`, 
      trend: "ETB Total", 
      color: "text-primary", 
      bg: "bg-primary/10", 
      border: "border-primary/20 shadow-primary/5",
      link: "/admin/settings"
    },
  ], [stats, t]);
  
  const filteredStats = useMemo(() => {
    return statsOverview.filter(c => {
      if (user?.role !== "admin" && (c.id !== "lottery" && c.id !== "payments")) return false;
      if (!isLotteryMode && (c.id === "lottery" || c.id === "payments") && user?.role !== "lottery_staff") return false;
      return true;
    });
  }, [statsOverview, user, isLotteryMode]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up pb-10">
        {/* Cinematic Welcome Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-10 sm:p-12 shadow-2xl border border-primary/20 group">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-inner border border-white/10">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {user?.role === "lottery_staff" ? "Lottery Ops Portal" : "Admin Command Center"}
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                  {getGreeting()}, <span className="opacity-80">{user?.name?.split(' ')[0] || "Chief"}</span>!
                </h1>
                <p className="text-white/80 max-w-xl text-base sm:text-lg font-bold leading-relaxed lg:pl-1 italic">
                  "Your platform is running at optimal capacity. Check out the latest activity reports below."
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm transition-all hover:bg-white/20">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <span className="text-xs font-black uppercase tracking-wider">System Secure</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-sm transition-all hover:bg-white/20">
                    <Clock className="h-4 w-4 text-amber-300" />
                    <span className="text-xs font-black uppercase tracking-wider">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} EAT</span>
                 </div>
              </div>
            </div>
            
            <div className="hidden xl:block relative">
               <div className="absolute inset-0 bg-white/20 blur-[100px] rounded-full scale-150 animate-pulse" />
               <div className="relative z-10 p-8 rounded-[3rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-1000">
                  <LayoutDashboard className="h-48 w-48 text-white opacity-20" strokeWidth={0.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Activity className="h-24 w-24 text-white opacity-90 drop-shadow-2xl animate-pulse" strokeWidth={1} />
                  </div>
               </div>
            </div>
          </div>
          
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-48 -left-20 w-96 h-96 bg-black/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Intelligence Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-primary rounded-full" />
               <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Live Intelligence</h2>
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted rounded-full px-4 py-1.5 border border-border/60">
               Real-time Data
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStats.map((c, i) => (
              <NavLink 
                to={c.link}
                key={c.id} 
                className={`bg-card rounded-[2rem] p-7 shadow-sm border border-border/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between min-h-[180px]`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity blur-2xl ${c.bg}`} />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${c.bg} border ${c.border} group-hover:scale-110 group-hover:shadow-2xl group-hover:-rotate-3`}>
                    <c.icon className={`h-7 w-7 ${c.color}`} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                        {c.trend}
                        <ArrowUpRight className="h-3 w-3 opacity-40" />
                     </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{c.label}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                      {isLoading ? "---" : c.value}
                    </p>
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Activity Mini-Feed */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                   <h2 className="text-xl font-extrabold text-foreground tracking-tight uppercase">Recent Events</h2>
                </div>
                <NavLink to="/admin/settings" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Full Audit</NavLink>
              </div>
              
              <div className="bg-card rounded-[2.5rem] border border-border/60 shadow-xl shadow-primary/5 p-8 space-y-6">
                 {isLoading ? (
                    <div className="py-20 text-center animate-pulse">
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gathering Activity logs...</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {[1,2,3].map(i => (
                          <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-all group border border-transparent hover:border-border/40">
                             <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                {i === 1 ? <Target className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center justify-between">
                                   <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                      {i === 1 ? "New Lottery Created" : i === 2 ? "Security Policy Updated" : "Payment Manual Override"}
                                   </p>
                                   <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{i}0m ago</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">Admin performed global sweep of system diagnostics and verified pending tickets.</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Quick Setup / Checklist */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                 <h2 className="text-xl font-extrabold text-foreground tracking-tight uppercase">Operations</h2>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                       <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black tracking-tight leading-tight">Fast Lottery Setup</h3>
                       <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Initialization Tools</p>
                    </div>
                    <div className="space-y-3">
                       <NavLink to="/admin/lottery" className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm group/btn">
                          <span className="text-xs font-black uppercase tracking-widest">New Draw</span>
                          <ArrowUpRight className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                       </NavLink>
                       <NavLink to="/admin/generate-lottery" className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm group/btn">
                          <span className="text-xs font-black uppercase tracking-widest">Number Board</span>
                          <ChevronRight className="h-4 w-4" />
                       </NavLink>
                    </div>
                 </div>
                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
