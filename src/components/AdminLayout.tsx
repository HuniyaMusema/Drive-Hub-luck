import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Car, CalendarCheck, Ticket, CreditCard, Users, LogOut, Dices, ChevronDown, UserCheck, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Cars", url: "/admin/cars", icon: Car, roles: ["admin"] },
  { title: "Rentals", url: "/admin/rentals", icon: CalendarCheck, roles: ["admin"] },
  { title: "Lottery", url: "/admin/lottery", icon: Ticket, roles: ["admin"] },
  { title: "Payments", url: "/admin/payments", icon: CreditCard, roles: ["admin"] },
  { title: "Users", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Lottery Payments", url: "/admin/lottery-payments", icon: CreditCard, roles: ["admin", "lottery_staff"] },
  { title: "Generate Numbers", url: "/admin/generate-lottery", icon: Dices, roles: ["admin", "lottery_staff"] },
  { title: "Participants", url: "/admin/lottery-participants", icon: UserCheck, roles: ["admin", "lottery_staff"] },
  { title: "Settings", url: "/admin/settings", icon: Settings, roles: ["admin"] },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();

  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 flex items-center gap-2">
          <Car className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="font-bold text-sidebar-foreground font-display">Gech (ጌች)</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40">
            {user?.role === "lottery_staff" ? "Lottery" : "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          {!collapsed && user && (
            <div className="mb-3 px-2">
              <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider">{user.role.replace("_", " ")}</p>
              <p className="text-sm text-sidebar-foreground truncate">{user.name}</p>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/" className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Exit Admin</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function RoleSwitcher() {
  const { user, setUser } = useAuth();
  const roles: { label: string; value: UserRole }[] = [
    { label: "Admin", value: "admin" },
    { label: "Lottery Staff", value: "lottery_staff" },
  ];

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role, name: role === "admin" ? "Admin User" : "Lottery Staff" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          Role: {user?.role === "lottery_staff" ? "Lottery Staff" : "Admin"}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((r) => (
          <DropdownMenuItem key={r.value} onClick={() => switchRole(r.value)} className={user?.role === r.value ? "bg-accent" : ""}>
            {r.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <span className="text-sm font-medium text-muted-foreground">
                {user?.role === "lottery_staff" ? "Lottery Staff Panel" : "Admin Panel"}
              </span>
            </div>
            <RoleSwitcher />
          </header>
          <main className="flex-1 p-6 lg:p-8 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
