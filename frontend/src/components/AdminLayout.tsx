import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, Car, Ticket, CreditCard, Users, LogOut, Hash, ChevronDown, UserCheck, Settings, Trophy, ShieldCheck, Zap, Bell, Menu, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import NotificationBell from "@/components/NotificationBell";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";

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
  { title: "Users",     labelKey: "navUsers",       url: "/admin/users",    icon: Users,           roles: ["admin"] },
  { title: "Settings",  labelKey: "settings",    url: "/admin/settings", icon: Settings,        roles: ["admin"] },
];

function AdminSidebar() {
  const { state } = useSidebar();
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
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
               isActive 
                ? "bg-[#3df0a2]/15 border border-[#3df0a2]/30 text-[#3df0a2] shadow-lg shadow-[#3df0a2]/10 font-black" 
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              isActive ? "text-[#3df0a2]" : "text-slate-500 group-hover:text-[#3df0a2]"
            )} />
            {!collapsed && <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">{t(item.labelKey)}</span>}
            {isActive && !collapsed && (
               <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#3df0a2] animate-pulse shadow-[0_0_8px_rgba(61,240,162,0.6)]" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 z-40 overflow-hidden" style={{ background: 'transparent' }}>
      {/* Hero-matching background */}
      <div className="absolute inset-0 bg-slate-950 z-0" />
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" style={{ objectPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
        {/* Glowing orbs matching hero */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
      </div>

      <SidebarContent className="bg-transparent custom-scrollbar relative z-10">
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center gap-3 mb-2">
          <div className="bg-[#3df0a2] p-2.5 rounded-2xl shadow-xl shadow-[#3df0a2]/20 text-slate-950 shrink-0 rotate-3 transition-transform hover:rotate-0 cursor-pointer">
             <Car className="h-5 w-5" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">{settings?.General?.platformName || "Drive Hub"}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3df0a2] mt-1.5">{t("navManagementPortal")}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        {!collapsed && <div className="mx-6 mb-6 h-px bg-gradient-to-r from-transparent via-[#3df0a2]/20 to-transparent" />}

        <SidebarGroup>
          <div className="px-6 py-2 mb-2 font-black text-[10px] uppercase tracking-[0.25em] text-slate-500">
            {!collapsed ? t("navCoreManagement") : "•••"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-3">
              {visibleSystem.map((item) => <SidebarLink key={item.title} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleLottery.length > 0 && (
          <SidebarGroup className="mt-6">
            {!collapsed && <div className="mx-6 mb-4 h-px bg-gradient-to-r from-transparent via-[#3df0a2]/15 to-transparent" />}
            <div className="px-6 py-2 mb-2 font-black text-[10px] uppercase tracking-[0.25em] text-[#3df0a2]/50">
               {!collapsed ? t("navLotteryOperations") : "•••"}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5 px-3">
                {visibleLottery.map((item) => <SidebarLink key={item.title} item={item} />)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Card & Logout */}
        <div className="mt-auto p-4 space-y-3">
          {!collapsed && user && (
            <div className="p-4 rounded-[1.75rem] bg-white/5 border border-[#3df0a2]/10 shadow-2xl group overflow-hidden relative backdrop-blur-xl">
               <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#3df0a2]/[0.06] opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-[#3df0a2]/10 flex items-center justify-center text-[#3df0a2] font-black text-base border border-[#3df0a2]/20 shadow-lg shadow-[#3df0a2]/5 transition-transform group-hover:scale-105">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                   <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate uppercase tracking-tighter leading-none mb-1">{user.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 mt-0.5">
                       <Sparkles className="h-2.5 w-2.5 text-[#3df0a2]" /> {user.role.replace("_", " ")}
                    </p>
                  </div>
               </div>
            </div>
          )}

          <SidebarMenu>
            <SidebarMenuItem className="px-1">
              <SidebarMenuButton asChild>
                <Link 
                  to="/" 
                  onClick={() => { if (setUser) setUser(null); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 font-black"
                >
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span className="text-[11px] uppercase font-black tracking-widest">{t("navTerminateSession")}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-900 font-sans">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-20 shrink-0 flex items-center justify-between border-b border-slate-100 px-8 bg-white sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-slate-400 hover:text-amber-500 transition-all p-2 rounded-xl hover:bg-slate-50 active:scale-95" />
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 active:scale-95 transition-all cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t("navEngineHealthy")}</span>
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-2">
                     {user?.role === "lottery_staff" ? t("navStaffPortal") : t("navGlobalAdmin")}
                  </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-500">
                 <ShieldCheck className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} /> {t("navSystemId")}: <span className="text-slate-900">#7B591</span>
              </div>
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12 custom-scrollbar-light">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
