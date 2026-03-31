import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Ticket, 
  CreditCard, 
  User, 
  ArrowRight, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Zap, 
  Clock, 
  History,
  Settings,
  Bell
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileHistory } from "@/hooks/useLottery";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: history, isLoading } = useProfileHistory();

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'lottery_staff') {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const stats = useMemo(() => {
    const lotteries = history?.lotteries || [];
    const pending = lotteries.filter(l => l.status === 'pending').length;
    const confirmed = lotteries.filter(l => l.status === 'confirmed' || l.payment_status === 'approved').length;
    
    return [
      { 
        icon: Ticket, 
        label: t("activeEntries") || "Active Entries", 
        value: confirmed.toString(), 
        sub: "Verified Tickets",
        color: "text-primary", 
        bg: "bg-primary/10",
        progress: 75 
      },
      { 
        icon: CreditCard, 
        label: t("pendingPayments") || "Pending Action", 
        value: pending.toString(), 
        sub: "Awaiting Verification",
        color: "text-amber-500", 
        bg: "bg-amber-500/10",
        progress: 30
      },
      { 
        icon: Heart, 
        label: t("savedVehicles") || "Saved Assets", 
        value: "4", 
        sub: "Watching Status",
        color: "text-rose-500", 
        bg: "bg-rose-500/10",
        progress: 45
      },
    ];
  }, [history, t]);

  const quickLinks = [
    { icon: Car, label: t("browseCarsForSale"), to: "/cars/sale", desc: "Find your next masterpiece", color: "bg-blue-500" },
    { icon: Ticket, label: t("enterLotteryAction"), to: "/lottery", desc: "Win a premium vehicle", color: "bg-primary" },
    { icon: CreditCard, label: t("payment"), to: "/payment", desc: "Submit your draw receipts", color: "bg-amber-500" },
    { icon: User, label: t("myProfile"), to: "/profile", desc: "Security and preferences", color: "bg-slate-700" },
    { icon: History, label: t("activityHistory") || "Activity Ledger", to: "/profile?tab=history", desc: "Your full transaction log", color: "bg-indigo-500" },
  ];

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Cinematic Welcome Header */}
        <div className="relative mb-16 rounded-[3rem] overflow-hidden bg-slate-900 p-12 lg:p-20 shadow-2xl animate-fade-in-up">
           <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                 <ShieldCheck className="w-64 h-64 text-primary" />
              </div>
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
              <div className="max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
                    <Sparkles className="h-3 w-3" /> {t("userAccountTier") || "Premium Member"}
                 </div>
                 <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                    {t("welcomeBack")}, <br />
                    <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-8">
                       {user?.name?.split(' ')[0] || "User"}
                    </span>
                 </h1>
                 <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                    {t("dashboardSubtitle") || "Your command center for luxury acquisitions and active sweepstakes management."}
                 </p>
              </div>
              <div className="flex gap-4">
                 <Link to="/profile">
                   <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest transition-all">
                      <Settings className="mr-2 h-4 w-4" /> Manage Profile
                   </Button>
                 </Link>
                 <Link to="/lottery">
                   <Button className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-transform">
                      <Trophy className="mr-2 h-4 w-4" /> New Draw
                   </Button>
                 </Link>
              </div>
           </div>
        </div>

        {/* Dynamic Stats Board */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "group relative bg-card rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-700 overflow-hidden",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110", s.bg, s.color)}>
                <s.icon className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <div className="flex items-end justify-between mb-4">
                 <div>
                    <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{s.value}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                 </div>
                 <div className="text-right">
                    <p className={cn("text-xs font-black uppercase tracking-widest", s.color)}>{s.sub}</p>
                 </div>
              </div>
              {/* Progress bar visual */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className={cn("h-full transition-all duration-1000 delay-500", s.color.replace('text-', 'bg-'))} 
                    style={{ width: isVisible ? `${s.progress}%` : '0%' }}
                 />
              </div>
              
              {/* Abstract hover bg */}
              <div className={cn("absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity", s.bg)} />
            </div>
          ))}
        </div>

        {/* Global Action Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("quickActions")}</h2>
             <div className="h-px bg-slate-100 flex-1 mx-8 hidden md:block" />
             <div className="flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Clock className="h-4 w-4" /></div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Bell className="h-4 w-4" /></div>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "group flex items-center justify-between bg-card rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500",
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:rotate-12", link.color)}>
                     <link.icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 text-lg tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors">{link.label}</span>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{link.desc}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" strokeWidth={3} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Drawing Stream */}
        <div className={cn("animate-fade-in-up space-y-8 pb-32", isVisible ? "opacity-100" : "opacity-0")}>
           <div className="flex items-center justify-between mb-2 px-4">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary rounded-full" />
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none text-white">Recent Drawing Stream</h2>
              </div>
              <Link to="/profile?tab=history" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline transition-all group-hover:text-white">Full Registry →</Link>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                 Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-28 rounded-[2rem] bg-slate-50 border border-slate-100 animate-pulse" />
                 ))
              ) : (history?.lotteries?.length ?? 0) === 0 ? (
                 <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white/5 shadow-2xl relative overflow-hidden group">
                    <History className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-white tracking-tighter mb-2 uppercase">No Active Participations</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto text-center">
                       You haven't entered any draws in this session. Start your journey by picking your lucky numbers.
                    </p>
                    <Link to="/lottery">
                       <Button className="rounded-full h-14 px-8 font-black uppercase tracking-widest text-xs">Enter a Draw Now</Button>
                    </Link>
                 </div>
              ) : (
                 history?.lotteries?.slice(0, 3).map((l: any) => {
                    const isConfirmed = l.status === 'confirmed' || l.payment_status === 'approved';
                    const isPending = l.payment_status === 'pending';
                    const isAwaiting = !isConfirmed && !isPending;

                    return (
                       <div 
                         key={l.id} 
                         onClick={() => {
                           if (isAwaiting) {
                             navigate("/payment", { state: { tickets: [l] } });
                           }
                         }}
                         className={cn(
                           "group relative bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 transition-all overflow-hidden shadow-xl",
                           isAwaiting && "cursor-pointer"
                         )}
                       >
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-all text-white font-black text-2xl tabular-nums">
                                #{l.number.toString().padStart(2, '0')}
                             </div>
                             <div className="space-y-1.5 text-center sm:text-left">
                                <p className="text-sm font-black text-white uppercase tracking-tight leading-none group-hover:text-primary transition-colors">Lottery Participation Entry</p>
                                <div className="flex items-center justify-center sm:justify-start gap-3 opacity-40">
                                   <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-300">
                                      <Clock className="h-3.5 w-3.5" /> {new Date(l.date || l.created_at).toLocaleDateString()}
                                   </div>
                                   <div className="w-1 h-1 rounded-full bg-slate-700" />
                                   <div className="text-[10px] font-black uppercase tracking-widest text-primary">ID: {l.id.slice(0,8)}</div>
                                 </div>
                             </div>
                          </div>
                          
                          <div className={cn(
                             "px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg min-w-[160px] text-center transition-all",
                             isConfirmed ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                             isPending ? "bg-blue-600 text-white shadow-blue-500/20 animate-pulse" : 
                             "bg-amber-500 text-white shadow-amber-500/20 hover:scale-105 active:scale-95"
                          )}>
                             {isConfirmed ? "Confirmed Entry" : isPending ? "Under Review" : "Awaiting payment"}
                          </div>
                       </div>
                    );
                 })
              )}
           </div>
        </div>
      </div>
    </PageShell>
  );
}
