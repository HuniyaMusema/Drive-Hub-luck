import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2, ShieldAlert, UserX, UserCheck, AlertTriangle, Users, Mail, Shield, Calendar, Filter, RefreshCw } from "lucide-react";
import { useAdminUsers, useUpdateUserStatus, useDeleteUser } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type UserStatus = "active" | "suspended" | "all";
type UserRole = "admin" | "lottery_staff" | "user" | "all";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus>("all");
  const [roleFilter, setRoleFilter] = useState<UserRole>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suspensionDialog, setSuspensionDialog] = useState<{ isOpen: boolean; userId: string | null; name: string }>({
    isOpen: false,
    userId: null,
    name: ""
  });
  const [suspensionReason, setSuspensionReason] = useState("");
  
  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = !search || 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    staff: users.filter(u => u.role === 'lottery_staff').length,
  }), [users]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleToggleStatus = async (user: any) => {
    if (user.status === 'active') {
      setSuspensionDialog({ isOpen: true, userId: user.id, name: user.name });
      setSuspensionReason("");
    } else {
      try {
        await updateStatusMutation.mutateAsync({ id: user.id, status: 'active' });
        toast({ title: "Account Activated", description: `${user.name}'s account is now active.` });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  const confirmSuspension = async () => {
    if (!suspensionDialog.userId) return;
    try {
      await updateStatusMutation.mutateAsync({ 
        id: suspensionDialog.userId, 
        status: 'suspended', 
        reason: suspensionReason 
      });
      toast({ title: "User Suspended", description: "Account access has been revoked." });
      setSuspensionDialog({ isOpen: false, userId: null, name: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({ title: "User Deleted", description: "Account removed successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{t("userManagement")}</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{t("manageSystemAccess")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("searchUsersPrompt")} 
              className="pl-9 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-primary/30 h-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/60 hover:border-primary/30 hover:text-primary transition-all shadow-sm h-9"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats.total, color: "text-foreground", bg: "bg-primary/5", border: "border-primary/10", icon: Users },
          { label: "Active", value: stats.active, color: "text-green-600", bg: "bg-green-500/5", border: "border-green-500/10", icon: UserCheck },
          { label: "Suspended", value: stats.suspended, color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/10", icon: UserX },
          { label: "Staff members", value: stats.staff, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/10", icon: Shield },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className={`rounded-2xl p-5 border ${border} ${bg} hover:shadow-md transition-all relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 bg-current blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
              <Icon className={`h-5 w-5 ${color} opacity-40`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-left">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground truncate">{t("userDetails")}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">{t("role") || "Role"}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">{t("status")}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">{t("year")}</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("loadingUserDatabase")}</p>
                      </div>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground opacity-20" />
                      </div>
                      <p className="font-bold text-xs uppercase tracking-widest opacity-40">{t("noMatchingUsers")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-primary/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm ring-1 ring-primary/20 group-hover:scale-110 transition-transform shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all ${
                        u.role === 'admin' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                        u.role === 'lottery_staff' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        <span className="flex items-center gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          {u.role === 'admin' ? t("admin") :
                           u.role === 'lottery_staff' ? t("lotteryStaff") :
                           t("user")}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit border shadow-sm ${
                          u.status === 'suspended' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {u.status === 'suspended' ? t("suspended") : t("active")}
                        </span>
                        {u.status === 'suspended' && u.suspension_reason && (
                          <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px] mt-1">
                            "{u.suspension_reason}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold tabular-nums">
                         <Calendar className="h-3.5 w-3.5 opacity-50" />
                         {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 rounded-xl transition-all shadow-sm ${
                            u.status === 'suspended' ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                          }`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentUser?.id.toString() || updateStatusMutation.isPending}
                          title={u.status === 'suspended' ? t("activateUser") : t("suspendUser")}
                        >
                          {u.status === 'suspended' ? <UserCheck className="h-4 w-4 shadow-sm" /> : <UserX className="h-4 w-4 shadow-sm" />}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 bg-destructive/5 text-destructive hover:bg-destructive/20 rounded-xl transition-all shadow-sm"
                              disabled={u.id === currentUser?.id.toString()}
                            >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-border/60">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-destructive" />
                                {t("confirmDeletion")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("areYouSureDeleteUser")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl font-bold">{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(u.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold shadow-lg shadow-destructive/20 px-6"
                              >
                                {t("deleteAccount")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension Dialog */}
      <Dialog open={suspensionDialog.isOpen} onOpenChange={(open) => setSuspensionDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="rounded-2xl border-border/60 bg-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-xl font-extrabold">
              <AlertTriangle className="h-6 w-6" />
              {t("suspendUser")}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Are you sure you want to suspend <span className="font-bold text-foreground">{suspensionDialog.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("suspensionReason")}</Label>
            <Textarea 
              placeholder="e.g. Violation of Terms of Service..." 
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="rounded-xl border-border/60 min-h-[120px] py-4 text-xs font-medium leading-relaxed focus:ring-amber-500/20"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="ghost" onClick={() => setSuspensionDialog(prev => ({...prev, isOpen: false}))} className="flex-1 rounded-xl font-bold">
              {t("cancel")}
            </Button>
            <Button 
              disabled={!suspensionReason || updateStatusMutation.isPending} 
              onClick={confirmSuspension}
              className="flex-1 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 transition-all active:scale-95"
            >
              {updateStatusMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Processing</> : t("confirmSuspension")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
