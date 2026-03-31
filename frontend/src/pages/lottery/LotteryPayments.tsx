import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, ImageIcon, Loader2, CreditCard, Search, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLotteryPayments, useVerifyPayment } from "@/hooks/useLottery";
import { useQueryClient } from "@tanstack/react-query";

type FilterType = "all" | "pending" | "approved" | "rejected";

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  pending:  { icon: Clock,        label: "Pending",  className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  rejected: { icon: XCircle,      label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const filterTabs: { key: FilterType; label: string; color: string }[] = [
  { key: "all",      label: "All",      color: "text-foreground" },
  { key: "pending",  label: "Pending",  color: "text-amber-600" },
  { key: "approved", label: "Approved", color: "text-green-600" },
  { key: "rejected", label: "Rejected", color: "text-destructive" },
];

export default function LotteryPayments() {
  const { data: payments = [], isLoading } = useLotteryPayments();
  const verifyMutation = useVerifyPayment();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    let list = filter === "all" ? payments : payments.filter(p => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.user_name.toLowerCase().includes(q) ||
        p.user_email.toLowerCase().includes(q) ||
        p.ticket_number.toString().includes(q)
      );
    }
    return list;
  }, [payments, filter, search]);

  const counts = useMemo(() => ({
    all: payments.length,
    pending: payments.filter(p => p.status === "pending").length,
    approved: payments.filter(p => p.status === "approved").length,
    rejected: payments.filter(p => p.status === "rejected").length,
  }), [payments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['lottery', 'payments'] });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleAction = async () => {
    if (!actionDialog) return;
    const { id, type } = actionDialog;
    try {
      await verifyMutation.mutateAsync({
        id,
        verify: type === "approve",
        reason: type === "reject" ? reason : undefined
      });
      toast({
        title: type === "approve" ? "Payment Approved" : "Payment Rejected",
        description: "The transaction has been processed successfully.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionDialog(null);
      setReason("");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Lottery Payments</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Review and verify user payment receipts for lottery tickets.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-xl bg-muted/30 border-border/60 focus-visible:ring-primary/30 h-9"
              placeholder="Search by name or ticket #…"
              value={search}
              onChange={e => setSearch(e.target.value)}
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    value: counts.all,      color: "text-foreground",  bg: "bg-primary/5",      border: "border-primary/10" },
          { label: "Pending",  value: counts.pending,  color: "text-amber-600",   bg: "bg-amber-500/5",    border: "border-amber-500/10" },
          { label: "Approved", value: counts.approved, color: "text-green-600",   bg: "bg-green-500/5",    border: "border-green-500/10" },
          { label: "Rejected", value: counts.rejected, color: "text-destructive", bg: "bg-destructive/5",  border: "border-destructive/10" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl p-5 border ${border} ${bg} hover:shadow-md transition-all relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 bg-current blur-2xl -mr-8 -mt-8" />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150
              ${filter === key
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground shadow-sm'}`}
          >
            {label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums
              ${filter === key ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden shadow-primary/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-30" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
              <p className="font-bold text-foreground">{search || filter !== "all" ? "No payments matching your filter." : "No lottery payment records found."}</p>
              <p className="text-muted-foreground text-xs">Payments appear once users submit their receipts.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">#</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">User</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Method</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Ticket</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Receipt</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const sc = statusConfig[p.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="px-5 py-4 tabular-nums text-muted-foreground text-xs font-bold">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-extrabold text-primary shrink-0">
                            {p.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.user_name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm
                          ${p.method === 'CBE' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                          {p.method}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-primary tabular-nums text-lg">
                          {p.ticket_number.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 rounded-lg border-border/60 hover:border-primary/40 hover:text-primary text-xs shadow-sm transition-all"
                          onClick={() => setPreviewUrl(p.receipt_url)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`flex items-center gap-1 w-fit text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${sc.className}`}>
                            <StatusIcon className="h-3 w-3" />
                            {sc.label}
                          </span>
                          {p.rejection_reason && <p className="text-[9px] text-destructive font-medium italic mt-0.5 max-w-[150px] truncate">"{p.rejection_reason}"</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {p.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20 rounded-lg px-3 font-bold text-xs transition-all"
                                onClick={() => setActionDialog({ id: p.id, type: "approve" })}
                                disabled={verifyMutation.isPending}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-destructive hover:bg-destructive/10 rounded-lg px-3 font-bold text-xs transition-all"
                                onClick={() => setActionDialog({ id: p.id, type: "reject" })}
                                disabled={verifyMutation.isPending}
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Deny
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between">
            <span>Showing {filtered.length} of {payments.length} payments</span>
            {(search || filter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-primary hover:underline font-bold">Clear filters</button>
            )}
          </div>
        )}
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="relative pt-[100%] w-full bg-muted/30 flex items-center justify-center">
            {previewUrl && <img src={previewUrl} alt="Receipt proof" className="absolute inset-0 w-full h-full object-contain" />}
          </div>
          <div className="p-4 bg-background border-t">
            <Button variant="outline" className="w-full rounded-xl font-bold" onClick={() => setPreviewUrl(null)}>Close Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setReason(""); }}>
        <DialogContent className="rounded-2xl border-border/60 max-w-sm">
          <DialogHeader className="pt-2">
            <DialogTitle className={`text-xl font-extrabold flex items-center gap-2 ${actionDialog?.type === "reject" ? "text-destructive" : "text-green-600"}`}>
              {actionDialog?.type === "approve" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {actionDialog?.type === "approve" ? "Confirm Approval" : "Reject Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {actionDialog?.type === "reject" ? (
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reason for Rejection</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Screenshot blurry, reference not found..."
                  className="rounded-xl border-border/60 min-h-[100px] focus:ring-primary/20"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Approve this payment to confirm the lottery ticket. The number will be permanently locked to the user.
              </p>
            )}
          </div>
          <DialogFooter className="flex-row gap-2 pt-2">
            <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => { setActionDialog(null); setReason(""); }}>Cancel</Button>
            <Button
              className={`flex-1 rounded-xl shadow-lg font-bold ${actionDialog?.type === "reject" ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/20"}`}
              onClick={handleAction}
              disabled={verifyMutation.isPending || (actionDialog?.type === "reject" && !reason.trim())}
            >
              {verifyMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Processing…</> : (actionDialog?.type === "approve" ? "Verify Now" : "Confirm Rejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
