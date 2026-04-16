import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2, ShieldAlert, UserX, UserCheck, AlertTriangle, Users, Mail, Shield, Calendar, Filter, RefreshCw, UserPlus, Lock } from "lucide-react";
import { useAdminUsers, useUpdateUserStatus, useDeleteUser, useCreateStaff } from "@/hooks/useAdmin";
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
  
  const [addStaffDialog, setAddStaffDialog] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "" });

  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const createStaffMutation = useCreateStaff();
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
          toast({ title: t("adminAccountActivated"), description: `${user.name}${t("adminAccountActivatedDesc")}` });
        } catch (err: any) {
        toast({ title: t("toastError"), description: err.message, variant: "destructive" });
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
        toast({ title: t("adminUserSuspended"), description: t("adminAccountRevoked") });
        setSuspensionDialog({ isOpen: false, userId: null, name: "" });
    } catch (err: any) {
      toast({ title: t("toastError"), description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({ title: t("adminUserDeleted"), description: t("adminAccountRemoved") });
    } catch (err: any) {
      toast({ title: t("toastError"), description: err.message, variant: "destructive" });
    }
  };
  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      toast({ title: t("adminValidationError"), description: t("adminAllFieldsRequired"), variant: "destructive" });
      return;
    }
    if (staffForm.password.length < 6) {
      toast({ title: t("adminValidationError"), description: t("adminPasswordLength"), variant: "destructive" });
      return;
    }
    try {
      await createStaffMutation.mutateAsync(staffForm);
      toast({ title: t("adminStaffCreated"), description: t("adminStaffSuccess") });
      setAddStaffDialog(false);
      setStaffForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      toast({ title: t("adminGenerationFailed"), description: err.message || t("adminCouldNotCreateStaff"), variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#4CBFBF]/10 flex items-center justify-center border border-[#4CBFBF]/20 shadow-sm">
            <Users className="h-7 w-7 text-[#4CBFBF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("userManagement")}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">{t("manageSystemAccess")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder={t("searchUsersPrompt")} 
              className="pl-9 rounded-2xl bg-white border border-slate-200 focus-visible:ring-[#4CBFBF]/20 h-11 text-xs font-bold text-slate-900 placeholder:text-slate-400 shadow-sm" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
            <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all shadow-sm h-11 font-black px-5"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t("adminRefresh")}
          </Button>
           <Button
            className="gap-2 rounded-2xl bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] shadow-xl shadow-[#4CBFBF]/10 h-11 px-6 font-black uppercase text-[10px] tracking-widest border-0 transition-all hover:scale-105 active:scale-95"
            onClick={() => {
              setStaffForm({ name: "", email: "", password: "" });
              setAddStaffDialog(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            {t("adminAddStaff")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
         {[
          { label: t("adminTotalUsers"), value: stats.total, color: "text-slate-900", bg: "bg-white", border: "border-slate-200 shadow-xl shadow-slate-100", icon: Users },
          { label: t("adminActiveUsers"), value: stats.active, color: "text-[#4CBFBF]", bg: "bg-[#4CBFBF]/10", border: "border-[#4CBFBF]/20", icon: UserCheck },
          { label: t("adminSuspendedUsers"), value: stats.suspended, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: UserX },
          { label: t("adminStaffMembers"), value: stats.staff, color: "text-[#f5b027]", bg: "bg-[#f5b027]/10", border: "border-[#f5b027]/20", icon: Shield },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className={`rounded-[2rem] p-8 border ${border} ${bg} hover:-translate-y-1 transition-all relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] bg-current blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">{label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-4xl font-black tabular-nums tracking-tighter ${color}`}>{value}</p>
              <Icon className={`h-7 w-7 ${color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

       <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 truncate">{t("userDetails")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("role")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("status")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">{t("year")}</th>
                <th className="px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
               {isLoading ? (
                <tr>
                    <td colSpan={5} className="py-32 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-12 w-12 animate-spin text-[#4CBFBF] opacity-30" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("loadingUserDatabase")}</p>
                       </div>
                    </td>
                </tr>
               ) : filtered.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-32 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Users className="h-12 w-12 text-slate-700" />
                      </div>
                      <p className="font-black text-[10px] uppercase tracking-[0.25em] opacity-30">{t("noMatchingUsers")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                 filtered.map((u) => (
                   <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#4CBFBF] flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-inner border border-slate-200">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tighter text-base group-hover:text-[#4CBFBF] transition-colors leading-none mb-1.5">{u.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                            <Mail className="h-2.5 w-2.5 opacity-40" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                         u.role === 'admin' ? "text-purple-400" :
                        u.role === 'lottery_staff' ? "text-[#f5b027]" :
                        "text-slate-400"
                      }`}>
                        <Shield className="h-3.5 w-3.5 opacity-70" />
                        {u.role === 'admin' ? t("admin") :
                         u.role === 'lottery_staff' ? t("lotteryStaff") :
                         t("user")}
                      </div>
                    </td>
                     <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full w-fit border shadow-sm ${
                          u.status === 'suspended' ? "bg-red-400/10 text-red-400 border-red-400/20" : "bg-[#4CBFBF]/10 text-[#4CBFBF] border-[#4CBFBF]/20"
                        }`}>
                          {u.status === 'suspended' ? t("suspended") : t("active")}
                        </span>
                        {u.status === 'suspended' && u.suspension_reason && (
                          <p className="text-[10px] text-red-400/70 italic truncate max-w-[150px] mt-1 uppercase tracking-tighter">
                            "{u.suspension_reason}"
                          </p>
                        )}
                      </div>
                    </td>
                     <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-slate-500 text-xs font-black tabular-nums uppercase">
                         <Calendar className="h-3.5 w-3.5 opacity-40" />
                         {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </div>
                    </td>
                     <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                           className={`h-11 w-11 rounded-2xl transition-all shadow-sm ${
                            u.status === 'suspended' ? "bg-[#f5b027]/10 text-[#f5b027] hover:bg-[#f5b027]/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-[#4CBFBF]"
                          }`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentUser?.id.toString() || updateStatusMutation.isPending}
                          title={u.status === 'suspended' ? t("activateUser") : t("suspendUser")}
                        >
                          {u.status === 'suspended' ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                        </Button>
 
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 bg-red-400/10 text-red-400 hover:bg-red-400/20 rounded-2xl transition-all shadow-sm"
                              disabled={u.id === currentUser?.id.toString()}
                            >
                               <Trash2 className="h-5 w-5" />
                             </Button>
                          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2.5rem] border-slate-200 bg-white shadow-2xl p-10 overflow-hidden text-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-4 text-3xl font-black uppercase tracking-tighter">
                <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                {t("confirmDeletion")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 font-bold text-sm mt-4">
                {t("areYouSureDeleteUser")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-4">
              <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 uppercase tracking-widest text-[10px] transition-all flex-1">{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDelete(u.id)}
                className="bg-red-500 hover:bg-red-600 rounded-2xl h-14 px-10 font-black flex-1 shadow-lg shadow-red-500/20 uppercase tracking-[0.2em] text-[10px] border-0 transition-all hover:scale-105 active:scale-95"
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
<DialogContent className="rounded-[2.5rem] border-slate-200 bg-white max-w-sm p-10 text-slate-900 shadow-2xl">
<DialogHeader>
<DialogTitle className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-[#f5b027]">
<div className="w-12 h-12 rounded-2xl bg-[#f5b027]/10 flex items-center justify-center border border-[#f5b027]/20">
<AlertTriangle className="h-6 w-6" />
</div>
{t("suspendUser")}
</DialogTitle>
<DialogDescription className="font-bold text-slate-500 mt-4">
{t("adminConfirmSuspensionDesc")} <span className="font-black text-[#f5b027]">{suspensionDialog.name}</span>?
</DialogDescription>
</DialogHeader>
<div className="py-8 space-y-4">
<Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">{t("suspensionReason")}</Label>
<Textarea 
placeholder={t("adminSuspensionReasonPlaceholder")} 
value={suspensionReason}
onChange={(e) => setSuspensionReason(e.target.value)}
className="rounded-2xl border-slate-200 bg-slate-50 min-h-[120px] p-6 text-xs font-bold leading-relaxed focus:ring-[#f5b027]/20 text-slate-900 placeholder:text-slate-400"
/>
</div>
<DialogFooter className="flex-row gap-4 mt-2">
<Button variant="ghost" onClick={() => setSuspensionDialog(prev => ({...prev, isOpen: false}))} className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100">
{t("cancel")}
</Button>
<Button 
disabled={!suspensionReason || updateStatusMutation.isPending} 
onClick={confirmSuspension}
className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest bg-[#f5b027] hover:bg-[#e09e1f] text-white shadow-lg shadow-[#f5b027]/10 transition-all active:scale-95"
>
{updateStatusMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t("processing")}</> : t("confirmSuspension")}
</Button>
</DialogFooter>
</DialogContent>
</Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialog} onOpenChange={setAddStaffDialog}>
        <DialogContent className="rounded-[3rem] border-slate-200 bg-white max-w-sm p-10 text-slate-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-[#4CBFBF]">
              <div className="w-12 h-12 rounded-2xl bg-[#4CBFBF]/10 flex items-center justify-center border border-[#4CBFBF]/20">
                <UserPlus className="h-6 w-6" />
              </div>
              {t("adminProvisionStaff")}
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 text-xs leading-relaxed mt-4">
              {t("adminStaffDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-2"><Users className="h-3 w-3 "/> {t("adminFullName")}</Label>
              <Input
                placeholder="John Doe"
                value={staffForm.name}
                onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-2xl bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold placeholder:text-slate-400 focus-visible:ring-[#4CBFBF]/20"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-2"><Mail className="h-3 w-3 "/> {t("adminWorkEmail")}</Label>
              <Input
                type="email"
                placeholder="staff@drivehub.com"
                value={staffForm.email}
                onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-2xl bg-slate-50 border-slate-200 text-slate-900 h-12 font-bold placeholder:text-slate-400 focus-visible:ring-[#4CBFBF]/20"
              />
            </div>
             <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-2"><Lock className="h-3 w-3 "/> {t("adminInitialPassword")}</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={staffForm.password}
                onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                className="rounded-2xl bg-slate-50 border-slate-200 text-slate-900 h-12 font-mono tracking-widest border-slate-200 focus-visible:ring-[#4CBFBF]/20"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-4 mt-2">
             <Button variant="ghost" onClick={() => setAddStaffDialog(false)} className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100">
               {t("cancel")}
             </Button>
             <Button
               disabled={!staffForm.name || !staffForm.email || !staffForm.password || createStaffMutation.isPending}
               onClick={handleAddStaff}
               className="flex-1 rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest bg-[#4CBFBF] hover:bg-[#3fb0b0] text-white shadow-lg shadow-[#4CBFBF]/10 transition-all active:scale-95"
             >
               {createStaffMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t("generating")}</> : t("adminCreateStaff")}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

