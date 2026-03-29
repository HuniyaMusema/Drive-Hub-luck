import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2, ShieldAlert, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { useAdminUsers, useUpdateUserStatus, useDeleteUser } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [suspensionDialog, setSuspensionDialog] = useState<{ isOpen: boolean; userId: string | null; name: string }>({
    isOpen: false,
    userId: null,
    name: ""
  });
  const [suspensionReason, setSuspensionReason] = useState("");
  
  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const filtered = users.filter((u) => 
    !search || 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage system access and roles</p>
        </div>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users by name or email..." className="pl-10 h-10 rounded-xl border-border/60" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/60 shadow-primary/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-left">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">User Details</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Role</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading user database...</p>
                      </div>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-muted-foreground bg-muted/10">
                    <p className="font-bold text-xs uppercase tracking-widest opacity-40">No matching users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs ring-1 ring-primary/20">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 tabular-nums text-muted-foreground font-medium">
                      {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        u.role === 'admin' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                        u.role === 'lottery_staff' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit border ${
                          u.status === 'suspended' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {u.status}
                        </span>
                        {u.status === 'suspended' && u.suspension_reason && (
                          <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">
                            "{u.suspension_reason}"
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 rounded-lg transition-all ${
                            u.status === 'suspended' ? "text-emerald-600 hover:bg-emerald-500/10" : "text-amber-600 hover:bg-amber-500/10"
                          }`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentUser?.id.toString() || updateStatusMutation.isPending}
                          title={u.status === 'suspended' ? "Activate User" : "Suspend User"}
                        >
                          {u.status === 'suspended' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              disabled={u.id === currentUser?.id.toString()}
                            >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border-border/60">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-destructive" />
                                Confirm Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete <strong>{u.name}</strong>? This action cannot be undone and will remove all their records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(u.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                              >
                                Delete Account
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

      <Dialog open={suspensionDialog.isOpen} onOpenChange={(open) => setSuspensionDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="rounded-2xl border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Suspend user {suspensionDialog.name}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending this account. The user will be immediately blocked from all access.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suspension Reason</Label>
            <Textarea 
              placeholder="e.g. Violation of Terms of Service, Suspicious activity..." 
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="rounded-xl border-border/60 min-h-[100px] py-3 text-xs leading-relaxed"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSuspensionDialog(prev => ({...prev, isOpen: false}))} className="rounded-xl h-10 px-6 font-bold">Cancel</Button>
            <Button 
              disabled={!suspensionReason || updateStatusMutation.isPending} 
              onClick={confirmSuspension}
              className="rounded-xl h-10 px-8 font-bold bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20"
            >
              {updateStatusMutation.isPending ? "Suspending..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
