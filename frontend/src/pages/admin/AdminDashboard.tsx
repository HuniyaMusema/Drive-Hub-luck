import { AdminLayout } from "@/components/AdminLayout";
import { Ticket, CreditCard, Users, TrendingUp, Sparkles, LayoutDashboard, ArrowUpRight, Clock, ShieldCheck, Activity, Target, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useAdmin";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

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
      color: "text-[#4CBFBF]", 
      bg: "bg-[#4CBFBF]/10", 
      border: "border-[#4CBFBF]/10 shadow-xl shadow-black/50",
      link: "/admin/lottery-participants"
    },
    { 
      id: "payments",
      icon: CreditCard, 
      label: t("pendingPayments"), 
      value: stats?.pendingPayments ?? 0, 
      trend: t("actionRequired"), 
      color: "text-[#f5b027]", 
      bg: "bg-[#f5b027]/10", 
      border: "border-[#4CBFBF]/10 shadow-xl shadow-black/50",
      link: "/admin/lottery-payments"
    },
    { 
      id: "users",
      icon: Users, 
      label: t("adminUsers"), 
      value: stats?.registeredUsers ?? 0, 
      trend: t("fourThisWeek"), 
      color: "text-slate-300", 
      bg: "bg-white/5", 
      border: "border-white/5 shadow-xl shadow-black/50",
      link: "/admin/users"
    },
    { 
      id: "revenue",
      icon: TrendingUp, 
      label: t("dashEstRevenue"), 
      value: `${(stats?.revenue ?? 0).toLocaleString()}`, 
      trend: t("etbTotal"), 
      color: "text-[#4CBFBF]", 
      bg: "bg-[#4CBFBF]/10", 
      border: "border-[#4CBFBF]/10 shadow-xl shadow-black/50",
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
        <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-200 p-10 sm:p-12 shadow-xl group">
           {/* Background Accents */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CBFBF]/[0.05] rounded-full blur-[100px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f5b027]/[0.03] rounded-full blur-[100px] -ml-32 -mb-32" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4CBFBF]/10 border border-[#4CBFBF]/20 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm text-[#4CBFBF]">
                <Zap className="h-3.5 w-3.5 fill-current" />
                {user?.role === "lottery_staff" ? t("lotteryOpsPortal") : t("dashAdminCommandCenter")}
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900">
                  {getGreeting()}, <span className="text-[#4CBFBF]">{user?.name?.split(' ')[0] || "Chief"}</span>!
                </h1>
                <p className="text-slate-500 max-w-xl text-base sm:text-lg font-bold leading-relaxed lg:pl-1">
                  {t("platformRunningOpt")}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-2">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm transition-all hover:bg-slate-100 text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-[#f5b027]" />
                    <span className="text-xs font-black uppercase tracking-wider">{t("systemSecure")}</span>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm transition-all hover:bg-slate-100 text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-wider">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})} EAT</span>
                 </div>
              </div>
            </div>
            
            <div className="hidden xl:block relative">
               <div className="absolute inset-0 bg-[#4CBFBF]/5 blur-[100px] rounded-full scale-150 animate-pulse" />
               <div className="relative z-10 p-10 rounded-[3rem] bg-slate-50 border border-slate-200 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-1000">
                  <LayoutDashboard className="h-48 w-48 text-[#4CBFBF]/20" strokeWidth={0.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Activity className="h-24 w-24 text-[#f5b027]/30 drop-shadow-sm animate-pulse" strokeWidth={1} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-[#4CBFBF] rounded-full shadow-sm" />
               <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t("liveIntelligence")}</h2>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 rounded-full px-5 py-2 border border-slate-200 shadow-sm">
               {t("realTimeData")}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStats.map((stat, i) => (
              <NavLink 
                key={stat.id} 
                to={stat.link}
                className={cn(
                  "p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-100 transition-all duration-500 hover:scale-[1.03] hover:border-[#4CBFBF]/30 hover:shadow-[#4CBFBF]/10 group relative overflow-hidden",
                  ""
                )}
                style={{ animationDelay: `${(i+1)*100}ms` }}
              >
                <div className="flex justify-between items-start mb-8 text-right">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-7 w-7 transition-colors", stat.color)} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-tighter group-hover:text-[#4CBFBF] transition-colors">
                    {stat.trend}
                    <ArrowUpRight className="h-3 w-3 opacity-40" />
                  </div>
                </div>
 
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#4CBFBF] transition-colors">{stat.label}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                      {isLoading ? "---" : stat.value}
                    </p>
                    <div className="h-10 w-10 rounded-2xl bg-[#4CBFBF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-lg shadow-[#4CBFBF]/20 transform translate-x-4 group-hover:translate-x-0">
                      <ChevronRight className="h-5 w-5 text-white font-black" />
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
                 <div className="w-1.5 h-6 bg-[#4CBFBF] rounded-full" />
                 <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t("recentEvents")}</h2>
              </div>
              <NavLink to="/admin/settings" className="text-[10px] font-black text-[#4CBFBF] uppercase tracking-widest hover:underline">{t("viewFullAudit")}</NavLink>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 p-8 space-y-6">
               {isLoading ? (
                  <div className="py-24 text-center animate-pulse">
                     <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t("payFetchingLedger")}</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-200">
                           <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:text-[#4CBFBF] group-hover:bg-[#4CBFBF]/10 transition-all shadow-sm">
                              {i === 1 ? <Target className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between font-black uppercase">
                                 <p className="text-sm text-slate-900 tracking-tight leading-none group-hover:text-[#4CBFBF] transition-colors">
                                    {i === 1 ? t("audNewLottery") : i === 2 ? t("audSecurityUpdate") : t("audPaymentOverride")}
                                 </p>
                                 <span className="text-[10px] text-slate-500 tabular-nums tracking-widest">({i}0m ago)</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">{t("adminLogsDesc")}</p>
                           </div>
                           <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Quick Actions */}
         <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
               <div className="w-1.5 h-6 bg-[#f5b027] rounded-full" />
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t("operations")}</h2>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-xl shadow-slate-100 border border-slate-200 relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#f5b027]/10 flex items-center justify-center border border-[#f5b027]/20">
                     <Zap className="h-7 w-7 text-[#f5b027]" fill="currentColor" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black tracking-tighter leading-none">{t("fastLotterySetup")}</h3>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{t("initializationTools")}</p>
                  </div>
                  <div className="space-y-3">
                     <NavLink to="/admin/lottery" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-[#4CBFBF]/10 transition-all border border-slate-200 group/btn">
                        <div className="flex items-center gap-3">
                           <Ticket className="h-4 w-4 text-[#4CBFBF]" />
                           <span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover/btn:text-[#4CBFBF]">{t("newDraw")}</span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-[#f5b027] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                     </NavLink>
                     <NavLink to="/admin/lottery-payments" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-[#4CBFBF]/10 transition-all border border-slate-200 group/btn">
                        <div className="flex items-center gap-3">
                           <CreditCard className="h-4 w-4 text-[#f5b027]" />
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover/btn:text-[#4CBFBF]">{t("payLotteryPayments")}</span>
                              {(stats?.pendingPayments ?? 0) > 0 && (
                                 <span className="px-2 py-0.5 rounded-full bg-[#f5b027]/10 text-[#f5b027] text-[9px] font-black border border-[#f5b027]/20">
                                    {stats?.pendingPayments}
                                 </span>
                              )}
                           </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover/btn:text-[#4CBFBF]" />
                     </NavLink>
                     <NavLink to="/admin/lottery-participants" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-[#4CBFBF]/10 transition-all border border-slate-200 group/btn">
                        <div className="flex items-center gap-3">
                           <Users className="h-4 w-4 text-slate-400" />
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover/btn:text-[#4CBFBF]">{t("lpLotteryParticipants")}</span>
                              {(stats?.lotteryEntries ?? 0) > 0 && (
                                 <span className="px-2 py-0.5 rounded-full bg-[#4CBFBF]/10 text-[#4CBFBF] text-[9px] font-black border border-[#4CBFBF]/20">
                                    {stats?.lotteryEntries}
                                 </span>
                              )}
                           </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover/btn:text-[#4CBFBF]" />
                     </NavLink>
                     <NavLink to="/admin/generate-lottery" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-[#4CBFBF]/10 transition-all border border-slate-200 group/btn">
                        <div className="flex items-center gap-3">
                           <Target className="h-4 w-4 text-slate-400" />
                           <span className="text-xs font-black uppercase tracking-widest text-slate-700 group-hover/btn:text-[#4CBFBF]">{t("glNumberBoard")}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover/btn:text-[#4CBFBF]" />
                     </NavLink>
                  </div>
               </div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#f5b027]/[0.05] rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
            </div>
         </div>
        </div>
      </div>
    </AdminLayout>
  );
}

