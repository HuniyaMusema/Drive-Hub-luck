import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { LayoutDashboard, Car, Ticket, CreditCard, Users, LogOut, Hash, ChevronDown, UserCheck, Settings, Trophy, ShieldCheck, Zap, Bell, Menu } from "lucide-react";
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
  { title: "Generate Numbers", labelKey: "Generate Numbers",  url: "/admin/lottery",              icon: Trophy,     roles: ["admin"] },
  { title: "Lottery Payments", labelKey: "Lottery Payments",  url: "/admin/lottery-payments",     icon: CreditCard, roles: ["admin", "lottery_staff"] },
  { title: "Number Board",     labelKey: "Number Board",      url: "/admin/generate-lottery",     icon: Hash,       roles: ["admin", "lottery_staff"] },
  { title: "Participants",     labelKey: "Participants",      url: "/admin/lottery-participants", icon: UserCheck,  roles: ["admin", "lottery_staff"] },
];

const systemItems: NavItem[] = [
  { title: "Dashboard", labelKey: "Dashboard",  url: "/admin",          icon: LayoutDashboard, roles: ["admin", "lottery_staff"] },
  { title: "Users",     labelKey: "Users",       url: "/admin/users",    icon: Users,           roles: ["admin"] },
  { title: "Settings",  labelKey: "Settings",    url: "/admin/settings", icon: Settings,        roles: ["admin"] },
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
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              isActive ? "text-primary-foreground" : "text-sidebar-foreground/40 group-hover:text-primary"
            )} />
            {!collapsed && <span className="text-xs uppercase tracking-widest leading-none mt-0.5">{item.title}</span>}
            {isActive && !collapsed && (
               <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl z-40">
      <SidebarContent className="bg-transparent">
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20 text-primary-foreground shrink-0 rotate-3 transition-transform hover:rotate-0 cursor-pointer">
             <Car className="h-5 w-5" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black text-foreground tracking-tighter leading-none">{settings?.General?.platformName || "Drive Hub"}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">Management Portal</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <div className="px-6 py-2 mb-2 font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
            {!collapsed ? "Core Management" : "•••"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-3">
              {visibleSystem.map((item) => <SidebarLink key={item.title} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleLottery.length > 0 && (
          <SidebarGroup className="mt-4">
            <div className="px-6 py-2 mb-2 font-black text-[9px] uppercase tracking-[0.2em] text-primary/50">
               {!collapsed ? "Lottery Operations" : "•••"}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5 px-3">
                {visibleLottery.map((item) => <SidebarLink key={item.title} item={item} />)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4 space-y-4">
          {!collapsed && user && (
            <div className="p-4 rounded-3xl bg-sidebar-accent/30 border border-sidebar-border/50 shadow-inner group overflow-hidden relative">
               <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate uppercase tracking-tighter">{user.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-1">
                       <Zap className="h-2 w-2 text-primary" /> {user.role.replace("_", " ")}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground font-bold shadow-sm"
                >
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span className="text-[10px] uppercase font-black tracking-widest">Terminate Session</span>}
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
      <div className="min-h-screen flex w-full bg-[#f8f9fc]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-20 shrink-0 flex items-center justify-between border-b border-border/40 px-8 bg-white/60 backdrop-blur-2xl sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-muted-foreground hover:text-primary transition-all p-2 rounded-xl hover:bg-primary/5 active:scale-95" />
              <div className="h-6 w-px bg-border/60" />
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 active:scale-95 transition-all cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Engine Healthy</span>
                 </div>
                 <div className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/30 ml-2">
                    {user?.role === "lottery_staff" ? "staff portal" : "global admin"}
                 </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted/50 border border-border/40">
                 <ShieldCheck className="h-3 w-3 text-primary" /> System ID: <span className="text-foreground">#7B591</span>
              </div>
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
