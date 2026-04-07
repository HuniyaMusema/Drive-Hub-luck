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
              "flex items-center transition-all duration-300 group relative",
              collapsed ? "justify-center p-0 h-12 w-12 rounded-xl mx-auto" : "gap-3 px-4 py-3.5 rounded-2xl justify-start",
               isActive 
                ? "bg-[#4CBFBF]/15 border border-[#4CBFBF]/30 text-[#4CBFBF] shadow-lg shadow-[#4CBFBF]/10 font-black" 
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              collapsed ? "" : "shrink-0",
              isActive ? "text-[#4CBFBF]" : "text-slate-500 group-hover:text-[#4CBFBF]"
            )} />
            {!collapsed && <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">{t(item.labelKey)}</span>}
            {isActive && !collapsed && (
               <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#4CBFBF] animate-pulse shadow-[0_0_8px_rgba(76,191,191,0.6)]" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-white/20 z-40 overflow-hidden shadow-2xl" 
      style={{ 
        background: 'transparent',
        // @ts-ignore - custom property
        "--sidebar-width-icon": "5rem" 
      }}
    >
      {/* Hero-matching background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#071018]">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40 mix-blend-overlay" style={{ objectPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071018]/80 to-transparent" />
        {/* Subtle glowing orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CBFBF]/10 rounded-full blur-[120px] -mr-32 -mt-32" />
      </div>

      <SidebarContent className="bg-transparent custom-scrollbar relative z-10">
        {/* Brand Header */}
        <div className={cn(
          "pb-4 flex mb-2 transition-all duration-300",
          collapsed ? "flex-col items-center px-0 pt-6" : "items-center justify-between p-6"
        )}>
          <div className={cn("flex items-center", collapsed ? "flex-col justify-center gap-0" : "gap-3")}>
            <div className="bg-[#4CBFBF] p-2.5 rounded-2xl shadow-xl shadow-[#4CBFBF]/20 text-[#050505] shrink-0 rotate-3 transition-transform hover:rotate-0 cursor-pointer mx-auto mb-1">
               <Car className="h-5 w-5" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter leading-none">{settings?.General?.platformName || "Drive Hub"}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4CBFBF] mt-1.5">{t("navManagementPortal")}</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className={cn(
              "hover:bg-white/10 rounded-xl transition-all",
              collapsed ? "text-[#4CBFBF] mt-2 scale-110" : "text-white/40 hover:text-white"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Divider */}
        {!collapsed && <div className="mx-6 mb-6 h-px bg-gradient-to-r from-transparent via-[#4CBFBF]/20 to-transparent" />}

        <SidebarGroup>
          {!collapsed && (
            <div className="px-6 py-2 mb-2 font-black text-[10px] uppercase tracking-[0.25em] text-slate-500">
              {t("navCoreManagement")}
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-1.5", collapsed ? "px-0" : "px-3")}>
              {visibleSystem.map((item) => <SidebarLink key={item.title} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleLottery.length > 0 && (
          <SidebarGroup className="mt-6">
            {!collapsed && (
              <>
                <div className="mx-6 mb-4 h-px bg-gradient-to-r from-transparent via-[#4CBFBF]/15 to-transparent" />
                <div className="px-6 py-2 mb-2 font-black text-[10px] uppercase tracking-[0.25em] text-[#4CBFBF]/50">
                   {t("navLotteryOperations")}
                </div>
              </>
            )}
            <SidebarGroupContent>
              <SidebarMenu className={cn("gap-1.5", collapsed ? "px-0" : "px-3")}>
                {visibleLottery.map((item) => <SidebarLink key={item.title} item={item} />)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Removed User Card & Logout from sidebar based on user request */}
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
      <SidebarInset className="flex flex-col bg-[#f8fafc] w-full min-h-screen relative overflow-x-hidden">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
