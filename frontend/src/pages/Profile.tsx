import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, LogOut, Loader2, Car, Ticket, Sparkles, ShieldCheck, Zap, ChevronRight, Clock, CheckCircle2, XCircle, History, Calendar, Settings2, Trash2, Edit3, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfileHistory } from "@/hooks/useLottery";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  
  const { toast } = useToast();
  const { data: history, isLoading } = useProfileHistory();

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const statusConfig = {
    pending:  { icon: Clock,          className: "text-amber-600 border-amber-500/20 bg-amber-500/5", label: "Reserved" },
    approved: { icon: CheckCircle2,   className: "text-emerald-600 border-emerald-500/20 bg-emerald-500/5", label: "Confirmed" },
    rejected: { icon: XCircle,        className: "text-destructive border-destructive/20 bg-destructive/5", label: "Rejected" },
    win:      { icon: TrophyIcon,     className: "text-primary border-primary/20 bg-primary/5 shadow-lg shadow-primary/10", label: "WINNER" },
  };

  const stats = useMemo(() => ({
    totalLotteries: history?.lotteries?.length ?? 0,
    activeRentals: history?.rentals?.length ?? 0,
    totalSpent: (history?.lotteries?.length ?? 0) * 0, // In case we wanted to calculate
  }), [history]);

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl pb-32 animate-fade-in-up">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white p-10 lg:p-14 mb-12 shadow-2xl border border-slate-800 group">
           <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="flex items-center gap-8">
                 <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                    <div className="relative w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-slate-800 flex items-center justify-center border-2 border-white/10 shadow-2xl overflow-hidden">
                       <User className="h-12 w-12 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center border-4 border-slate-900 text-white shadow-lg">
                       <Sparkles className="h-4 w-4" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <h1 className="text-4xl font-black tracking-tighter leading-none">{user?.name || "Premium User"}</h1>
                       <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary">
                          Verified Profile
                       </div>
                    </div>
                    <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                       <Calendar className="h-3.5 w-3.5" /> Platform Member since 2026
                    </p>
                    <div className="flex gap-4 pt-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                          <Ticket className="h-3 w-3 text-primary" /> {stats.totalLotteries} Entries
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
                          <Car className="h-3.5 w-3.5 text-emerald-400" /> {stats.activeRentals} Rentals
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <Button variant="outline" className="rounded-2xl h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-all" onClick={() => setEditing(!editing)}>
                    {editing ? <><CheckCircle2 className="h-5 w-5 mr-2" /> Save</> : <><Settings2 className="h-5 w-5 mr-2" /> Edit</>}
                 </Button>
                 <Button variant="ghost" className="rounded-2xl h-14 w-14 border border-white/10 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition-all" onClick={handleLogout}>
                    <LogOut className="h-6 w-6" />
                 </Button>
              </div>
           </div>
           
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left Column: Personal Information & Settings */}
           <div className="lg:col-span-5 space-y-10">
              <div className="bg-card rounded-[2.5rem] border border-border/60 p-10 shadow-xl shadow-primary/5 relative group">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                          <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-foreground tracking-tighter">Security & Identity</h2>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Profile Configuration</p>
                       </div>
                    </div>
                 </div>

                 <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">First Name</Label>
                          <Input className="h-12 rounded-2xl bg-muted/30 border-border/60 font-bold" defaultValue={user?.name?.split(' ')[0] || "User"} disabled={!editing} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Last Name</Label>
                          <Input className="h-12 rounded-2xl bg-muted/30 border-border/60 font-bold" defaultValue={user?.name?.split(' ')[1] || ""} disabled={!editing} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Email Terminal</Label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                          <Input className="h-12 rounded-2xl bg-muted/30 border-border/60 font-bold pl-12" defaultValue={user?.email || "user@email.com"} disabled={!editing} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">Contact Connection</Label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                          <Input className="h-12 rounded-2xl bg-muted/30 border-border/60 font-bold pl-12" defaultValue="+251 900 000 000" disabled={!editing} />
                       </div>
                    </div>

                    {editing && (
                       <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20" onClick={() => { setEditing(false); toast({ title: "Profile Synchronized", description: "Your changes have been prioritized and saved." }); }}>
                          Sync Changes
                       </Button>
                    )}
                 </form>
              </div>

              {/* Account Level Card */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-10 text-white shadow-2xl group transition-all hover:scale-[1.02]">
                 <div className="flex items-center justify-between mb-6">
                    <Zap className="h-10 w-10 text-white fill-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Status Level</span>
                 </div>
                 <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Core Contributor</h3>
                 <p className="text-white/60 text-xs font-bold leading-relaxed mb-8">
                    You've participated in 5+ global draws. Unlock "Platinum Access" by completing 3 more entries this month.
                 </p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[9px] font-black uppercase tracking-widest">Progress to Platinum</span>
                       <span className="text-xs font-black tabular-nums">75%</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                       <div className="h-full w-3/4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: History Feed */}
           <div className="lg:col-span-7 space-y-10">
              {/* Lottery Activity */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Recent Activity</h2>
                   </div>
                   <div className="text-[10px] font-black text-muted-foreground uppercase border border-border/60 rounded-full px-4 py-1.5 bg-card">Synchronized Ledger</div>
                </div>

                <div className="bg-card rounded-[3rem] border border-border/60 p-10 shadow-2xl shadow-primary/5 min-h-[500px]">
                   <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border/40">
                      <History className="h-6 w-6 text-primary" strokeWidth={2.5} />
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Financial & Token History</h3>
                   </div>

                   {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" strokeWidth={1} />
                        <p className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">Requesting Archives...</p>
                      </div>
                   ) : (history?.lotteries?.length ?? 0) === 0 ? (
                      <div className="py-32 text-center border-2 border-dashed border-border/60 rounded-[2.5rem] bg-muted/5 flex flex-col items-center gap-6 group">
                        <div className="w-20 h-20 rounded-3xl bg-card border border-border/40 flex items-center justify-center text-muted-foreground/20 group-hover:scale-110 transition-transform shadow-sm">
                           <Ticket className="h-10 w-10 rotate-12" strokeWidth={1} />
                        </div>
                        <div>
                           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">No Active History Found</p>
                           <p className="text-[10px] font-bold text-muted-foreground/40 mt-1">Start your journey by exploring active lotteries.</p>
                        </div>
                        <Button className="mt-4 rounded-2xl h-12 px-8 font-black uppercase tracking-widest" onClick={() => navigate("/lottery")}>Explore Draws</Button>
                      </div>
                   ) : (
                      <div className="space-y-6">
                        {history?.lotteries.map((l) => {
                          let s = statusConfig.pending;
                          let label = "Pending";

                          if (l.status === 'confirmed' || l.payment_status === 'approved') {
                             s = statusConfig.approved;
                             label = "Confirmed Entry";
                          } else if (l.payment_status === "pending") {
                             s = { icon: Clock, className: "text-blue-600 border-blue-500/20 bg-blue-500/5", label: "Verifying Receipt" };
                             label = "Verifying Receipt";
                          } else if (l.status === "pending" && !l.payment_status) {
                             s = { icon: Clock, className: "text-amber-600 border-amber-500/20 bg-amber-500/5", label: "Awaiting Payment" };
                             label = "Awaiting Payment";
                          } else if (l.status === 'win') {
                             s = statusConfig.win;
                             label = "WINNER";
                          } else if (l.payment_status === 'rejected') {
                             s = statusConfig.rejected;
                             label = "Rejected";
                          }

                          const Icon = s.icon;
                          
                          return (
                            <div 
                              key={l.id} 
                              onClick={() => label.startsWith("Awaiting") && navigate("/payment", { state: { tickets: [l] } })}
                              className={cn(
                                "group relative bg-card rounded-3xl border border-border/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-1 transition-all overflow-hidden",
                                label.startsWith("Awaiting") && "cursor-pointer"
                              )}
                            >
                               <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", s.className.split(' ')[0])} />
                               <div className="flex items-center gap-6">
                                  <div className="relative">
                                     <div className="w-16 h-16 rounded-[1.25rem] bg-muted/40 border border-border/60 flex items-center justify-center shadow-inner group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                        <Ticket className="h-8 w-8 text-muted-foreground/20 group-hover:text-primary/20 transition-all" />
                                        <span className="absolute text-xl font-black text-foreground tabular-nums tracking-tighter">{l.number.toString().padStart(2, '0')}</span>
                                     </div>
                                     {l.status === 'win' && <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber-500 animate-bounce" />}
                                  </div>
                                  <div className="space-y-1.5 text-center sm:text-left">
                                     <p className="text-sm font-black text-foreground uppercase tracking-tight leading-none">Standard Entry • <span className="text-primary">#{l.number}</span></p>
                                     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                           <Calendar className="h-3.5 w-3.5" /> {new Date(l.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                           <Clock className="h-3.5 w-3.5" /> {new Date(l.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex flex-col items-center sm:items-end gap-3">
                                  <div className={cn("inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border shadow-sm transition-all", s.className)}>
                                     <Icon className={cn("h-3.5 w-3.5", label.includes("Awaiting") || label.includes("Verifying") ? 'animate-pulse' : '')} strokeWidth={2.5} />
                                     {label}
                                  </div>
                                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                     <ChevronRight className="h-4 w-4 text-primary" strokeWidth={3} />
                                  </div>
                               </div>
                            </div>
                          );
                        })}
                        
                        <div className="pt-8 flex flex-col items-center gap-4 border-t border-border/40">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">End of History Stream</p>
                           <Button variant="ghost" className="rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                               Request Full Audit Data
                           </Button>
                        </div>
                      </div>
                   )}
                </div>
              </div>

              {/* Active Rentals Hook (Future Feature Hint) */}
              <div className="bg-surface-warm rounded-[2.5rem] border border-border/40 p-8 flex items-center justify-between group overflow-hidden relative">
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-background border border-border/60 flex items-center justify-center text-emerald-500 shadow-xl group-hover:rotate-3 transition-transform">
                       <Car className="h-8 w-8" strokeWidth={2.5} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Fleet Access</h4>
                       <p className="text-xs font-bold text-muted-foreground opacity-60">Total active rental contracts: <span className="text-emerald-600">{stats.activeRentals}</span></p>
                    </div>
                 </div>
                 <div className="relative z-10">
                    <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-border/60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                       Manage Fleet
                    </Button>
                 </div>
                 <div className="absolute right-0 top-0 opacity-[0.03] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000">
                    <Car className="h-48 w-48" strokeWidth={0.5} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </PageShell>
  );
}

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
