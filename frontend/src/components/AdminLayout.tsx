import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { LayoutDashboard, Car, Ticket, CreditCard, Users, LogOut, Dices, ChevronDown, UserCheck, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";
import NotificationBell from "@/components/NotificationBell";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin", "lottery_staff"] },
  { title: "Cars", url: "/admin/cars", icon: Car, roles: ["admin"] },

  { title: "Lottery", url: "/admin/lottery", icon: Ticket, roles: ["admin"] },
  { title: "Users", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Lottery Payments", url: "/admin/lottery-payments", icon: CreditCard, roles: ["admin", "lottery_staff"] },
  { title: "Generate Numbers", url: "/admin/generate-lottery", icon: Dices, roles: ["admin", "lottery_staff"] },
  { title: "Participants", url: "/admin/lottery-participants", icon: UserCheck, roles: ["admin", "lottery_staff"] },
  { title: "Settings", url: "/admin/settings", icon: Settings, roles: ["admin"] },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, setUser } = useAuth();
  const { settings } = useSettings();
  const [isLotteryMode, setIsLotteryMode] = useState(() => {
    const op = localStorage.getItem("gech-operational");
    if (op) {
      try {
        const parsed = JSON.parse(op);
        return parsed.lotteryModuleEnabled ?? true;
      } catch {}
    }
    return true;
  });

  useEffect(() => {
    const loadMode = () => {
      const op = localStorage.getItem("gech-operational");
      if (op) {
        try {
          const parsed = JSON.parse(op);
          setIsLotteryMode(parsed.lotteryModuleEnabled ?? true);
        } catch {}
      }
    };
    loadMode();
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.type === "storage" || (customEvent.type === "settings-updated" && customEvent.detail === "gech-operational")) {
        loadMode();
      }
    };
    window.addEventListener("settings-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("settings-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (!user || !item.roles.includes(user.role)) return false;
    
    const isLotteryPage = ["Lottery", "Lottery Payments", "Generate Numbers", "Participants"].includes(item.title);
    
    // Admin users hide lottery pages if lottery mode is off. Staff always see their pages.
    if (!isLotteryMode && isLotteryPage && user.role !== "lottery_staff") return false;
    
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border shadow-2xl bg-sidebar z-40">
      <SidebarContent className="bg-transparent">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border mb-3">
          <div className="bg-sidebar-primary p-2 rounded-xl shadow-sm text-sidebar-primary-foreground shrink-0">
             <Car className="h-5 w-5" />
          </div>
          {!collapsed && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 font-display tracking-tight transition-all">{settings?.General?.platformName || "Drive Hub"}</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-bold px-5 mb-2">
            {user?.role === "lottery_staff" ? "Lottery Ops" : "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-3">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="px-3 py-2.5 rounded-xl transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group" 
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm"
                    >
                      <item.icon className="mr-3 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4 flex flex-col gap-2">
          {!collapsed && user && (
            <div className="p-3 rounded-2xl bg-sidebar-accent/30 border border-sidebar-border/50 shadow-sm transition-all hover:bg-sidebar-accent/50 group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider font-bold mb-1.5">{user.role.replace("_", " ")}</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-bold text-xs ring-1 ring-sidebar-primary/30">
                   {user.name.charAt(0)}
                 </div>
                 <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
              </div>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem className="px-1">
              <SidebarMenuButton asChild>
                <Link 
                  to="/" 
                  onClick={() => { if (setUser) setUser(null); }}
                  className="px-3 py-2.5 rounded-xl text-sidebar-foreground/70 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground group flex w-full"
                >
                  <LogOut className="mr-3 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  {!collapsed && <span className="font-medium">{user?.role === "lottery_staff" ? "Exit Lottery Staff" : "Exit Admin"}</span>}
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/40 px-6 bg-background/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-border max-md:hidden" />
              <span className="text-xs font-bold tracking-widest text-muted-foreground/60 max-md:hidden uppercase">
                {user?.role === "lottery_staff" ? "Lottery Portal" : "Administration"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
