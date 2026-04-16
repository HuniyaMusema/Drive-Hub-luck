import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, Car, Ticket, CreditCard, Users, LogOut, Hash, ChevronDown, UserCheck, Settings, Trophy, ShieldCheck, Zap, Bell, Menu, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  labelKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const lotteryItems: NavItem[] = [
  { title: "Generate Numbers", labelKey: "navGenerateNumbers",  url: "/admin/lottery",              icon: Trophy,     roles: ["admin"] },
  { title: "Lottery Payments", labelKey: "navLotteryPayments",  url: "/admin/lottery-payments",     icon: CreditCard, roles: ["admin", "lottery_staff"] },
  { title: "Number Board",     labelKey: "navNumberBoard",      url: "/admin/generate-lottery",     icon: Hash,       roles: ["admin", "lottery_staff"] },
  { title: "Participants",     labelKey: "navParticipants",      url: "/admin/lottery-participants", icon: UserCheck,  roles: ["admin", "lottery_staff"] },
];

const systemItems: NavItem[] = [
  { title: "Dashboard", labelKey: "navDashboard",  url: "/admin",          icon: LayoutDashboard, roles: ["admin", "lottery_staff"] },
  { title: "Cars",      labelKey: "adminCars",     url: "/admin/cars",     icon: Car,             roles: ["admin"] },
  { title: "Users",     labelKey: "navUsers",       url: "/admin/users",    icon: Users,           roles: ["admin"] },
  { title: "Settings",  labelKey: "settings",    url: "/admin/settings", icon: Settings,        roles: ["admin"] },
];

function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, setUser } = useAuth();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const location = useLocation();
  
  const isLotteryMode = settings?.Operational?.lotteryModuleEnabled ?? true;

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (!user || !item.roles.includes(user.role)) return false;
      const isLotteryPage = lotteryItems.some(l => l.url === item.url);
      if (!isLotteryMode && isLotteryPage && user.role !== "lottery_staff") return false;
      return true;
    });

  const visibleSystem  = filterItems(systemItems);
  const visibleLottery = filterItems(lotteryItems);

  const SidebarLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.url;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <Link
            to={item.url}
            className={cn(
              "flex items-center transition-all duration-300 group relative overflow-hidden",
              collapsed ? "justify-center p-0 h-11 w-11 rounded-2xl mx-auto" : "gap-3 px-3 py-2.5 rounded-2xl justify-start",
              isActive
                ? "text-white font-semibold shadow-lg"
                : "text-white/50 hover:text-white"
            )}
            style={isActive ? {
              background: 'linear-gradient(135deg, rgba(76,191,191,0.15) 0%, rgba(76,191,191,0.05) 100%)',
              borderLeft: collapsed ? 'none' : '2px solid rgba(76,191,191,0.6)',
            } : {}}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            {/* Active glow dot */}
            {isActive && !collapsed && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4CBFBF] shadow-[0_0_8px_rgba(76,191,191,0.8)]" />
            )}
            <div className={cn(
              "flex items-center justify-center shrink-0 rounded-xl transition-all duration-300",
              collapsed ? "w-full h-full" : "w-8 h-8",
              isActive
                ? "bg-[#4CBFBF]/20 shadow-inner"
                : "bg-white/5 group-hover:bg-white/10"
            )}>
              <item.icon className={cn(
                "h-[16px] w-[16px] shrink-0 transition-colors",
                isActive ? "text-[#4CBFBF] drop-shadow-[0_0_6px_rgba(76,191,191,0.6)]" : "text-white/40 group-hover:text-[#4CBFBF]"
              )} />
            </div>
            {!collapsed && (
              <span className="text-[12.5px] leading-none font-medium tracking-wide">{t(item.labelKey)}</span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r z-40"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(160deg, #1a2538 0%, #141e2d 50%, #0f1720 100%)',
      }} />
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(76,191,191,0.07) 0%, transparent 70%)'
      }} />
      {/* Bottom ambient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
        background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)'
      }} />

      <SidebarContent className="bg-transparent custom-scrollbar relative z-10 flex flex-col h-full">
        {/* Premium Brand Header */}
        <div className={cn(
          "flex items-center relative",
          collapsed ? "flex-col justify-center gap-2 px-0 py-5" : "justify-between px-4 py-4"
        )} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header top glow line */}
          <div className="absolute top-0 left-4 right-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(76,191,191,0.4), transparent)' }} />

          <div className={cn("flex items-center", collapsed ? "flex-col gap-1" : "gap-3")}>
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                background: 'linear-gradient(135deg, #4CBFBF 0%, #3aa8a8 100%)',
              }}>
                <Car className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#141e2d]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-white leading-none tracking-tight">{settings?.General?.platformName || "Gech"}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] mt-1" style={{ color: 'rgba(76,191,191,0.85)' }}>{t("navManagementPortal")}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "rounded-xl text-white/30 hover:text-white transition-all h-7 w-7",
              collapsed && "mt-1"
            )}
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Nav Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          <SidebarGroup>
            {!collapsed && (
              <p className="px-3 mb-2 text-[9px] font-black text-white/25 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(76,191,191,0.25), transparent)' }} />
                {t("navCoreManagement")}
                <span className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(76,191,191,0.25), transparent)' }} />
              </p>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {visibleSystem.map((item) => <SidebarLink key={item.title} item={item} />)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {visibleLottery.length > 0 && (
            <SidebarGroup>
              {!collapsed && (
                <p className="px-3 mb-2 text-[9px] font-black text-white/25 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(245,176,39,0.25), transparent)' }} />
                  {t("navLotteryOperations")}
                  <span className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, rgba(245,176,39,0.25), transparent)' }} />
                </p>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {visibleLottery.map((item) => <SidebarLink key={item.title} item={item} />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Premium bottom user strip */}
        {!collapsed && user && (
          <div className="px-3 py-3 mx-2 mb-3 rounded-2xl flex items-center gap-2.5" style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{
              background: 'linear-gradient(135deg, rgba(76,191,191,0.5), rgba(76,191,191,0.2))',
              border: '1px solid rgba(76,191,191,0.3)',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-white/90 truncate leading-none">{user.name}</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(76,191,191,0.7)' }}>{user.role.replace("_", " ")}</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <AdminSidebar  />
      <SidebarInset className="flex flex-col bg-[#f8fafc] w-full min-h-screen relative">
        <header className="h-20 shrink-0 flex items-center justify-between border-b border-slate-100 px-8 bg-white sticky top-0 z-30 shadow-sm text-slate-900 w-full mb-px">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="md:hidden text-slate-500 hover:text-[#4CBFBF] transition-colors" />
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#4CBFBF]/10 border border-[#4CBFBF]/20 active:scale-95 transition-all cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4CBFBF] animate-pulse shadow-[0_0_8px_rgba(76,191,191,0.3)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#4CBFBF]">{t("navEngineHealthy")}</span>
                </div>
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-2 lg:block hidden">
                   {user?.role === "lottery_staff" ? t("navStaffPortal") : t("navGlobalAdmin")}
                </div>
            </div>
          </div>
          
            <div className="flex items-center gap-3">
              <NotificationBell />
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-white border border-slate-200 hover:border-[#4CBFBF]/30 hover:shadow-lg transition-all duration-300 group">
                      <div className="w-8 h-8 rounded-xl bg-[#4CBFBF]/10 flex items-center justify-center text-[#4CBFBF] font-black text-xs border border-[#4CBFBF]/20 shadow-sm group-hover:scale-105 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden sm:flex flex-col items-start min-w-[80px]">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{user.name}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="h-2 w-2 text-[#f5b027]" /> {user.role.replace("_", " ")}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#4CBFBF] transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] mt-2 p-1.5 bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-[#4CBFBF]/10 focus:text-[#4CBFBF] cursor-pointer py-2.5 px-3">
                      <Link to="/profile" className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                        <Users className="h-4 w-4" />
                        {t("profile")}
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-slate-100 my-1 mx-1" />
                    <DropdownMenuItem 
                      className="rounded-xl focus:bg-red-50 focus:text-red-500 cursor-pointer py-2.5 px-3 text-red-400"
                      onClick={() => { if (setUser) setUser(null); }}
                    >
                      <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                        <LogOut className="h-4 w-4" />
                        {t("navTerminateSession")}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
