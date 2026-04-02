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
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "pending" | "approved" | "rejected";

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  pending:  { icon: Clock,        label: "Pending",  className: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm" },
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" },
  rejected: { icon: XCircle,      label: "Rejected", className: "bg-red-50 text-red-700 border-red-200 shadow-sm" },
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
  const { t } = useLanguage();

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
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
            <CreditCard className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("payLotteryPayments")}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{t("payReviewVerify")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 rounded-2xl bg-white border-slate-200 focus-visible:ring-emerald-500/20 h-10 font-black text-slate-900"
              placeholder={t("lpSearchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-2xl border-slate-200 bg-white hover:text-slate-900 transition-all shadow-sm h-10 px-5 font-black text-slate-500"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            {t("payRefresh")}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
        {[
          { label: t("payTotal"),    value: counts.all,      color: "text-slate-900", bg: "bg-white", border: "border-slate-200" },
          { label: t("lpPendingReview"),  value: counts.pending,  valueColor: "text-amber-600", color: "text-amber-600", bg: "bg-amber-50/30", border: "border-amber-200/50" },
          { label: t("payApprove"), value: counts.approved, valueColor: "text-emerald-600", color: "text-emerald-600", bg: "bg-emerald-50/30", border: "border-emerald-200/50" },
          { label: t("payReject"), value: counts.rejected, valueColor: "text-red-600", color: "text-red-600", bg: "bg-red-50/30", border: "border-red-200/50" },
        ].map(({ label, value, color, bg, border, valueColor }) => (
          <div key={label} className={`rounded-3xl p-8 border ${border} ${bg} shadow-sm hover:translate-y-[-4px] transition-all relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] bg-current blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 ${color}`} />
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">{label}</p>
            <p className={`text-4xl font-black tabular-nums tracking-tighter ${valueColor || 'text-slate-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
              ${filter === key
                ? 'bg-[#10b981] text-white border-[#10b981] shadow-lg shadow-emerald-500/20 scale-105'
                : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-500/40 hover:text-slate-900 shadow-sm'}`}
          >
            {key === 'all' ? t("payAll") : key === 'pending' ? t("lpPendingReview") : key === 'approved' ? t("payApprove") : t("payReject")}
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[9px] font-black tabular-nums transition-colors
              ${filter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden shadow-slate-200/50 mb-10">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-emerald-500 opactiy-20" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                <ImageIcon className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-widest text-xs">{search || filter !== "all" ? t("payNoPaymentsFilter") : t("payNoLotteryPayments")}</p>
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">{t("payPaymentsAppearOnce")}</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-slate-50/50">
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">#</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">{t("payUser")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">{t("payMethod")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">{t("payTicket")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">{t("payReceipt")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px]">{t("payStatus")}</th>
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[9px] text-right">{t("payActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const sc = statusConfig[p.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 tabular-nums text-slate-400 text-[10px] font-black">{i + 1}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-700 shrink-0 border border-emerald-200">
                            {p.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tighter uppercase text-[11px] group-hover:text-emerald-600 transition-colors">{p.user_name}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{p.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm
                          ${p.method === 'CBE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {p.method}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-emerald-600 tabular-nums text-xl tracking-tighter">
                          {p.ticket_number.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 rounded-2xl border-slate-200 hover:border-emerald-500/40 hover:text-emerald-600 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all px-4"
                          onClick={() => setPreviewUrl(p.receipt_url)}
                        >
                          <Eye className="h-4 w-4" /> {t("payView")}
                        </Button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className={`flex items-center gap-2 w-fit text-[9px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border font-black ${sc.className}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {p.status === 'pending' ? t("lpPendingReview") : p.status === 'approved' ? t("payApprove") : t("payReject")}
                          </span>
                          {p.rejection_reason && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1 opacity-70">"{p.rejection_reason}"</p>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {p.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-10 bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/20 rounded-2xl px-5 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                onClick={() => setActionDialog({ id: p.id, type: "approve" })}
                                disabled={verifyMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-2" /> {t("payApprove")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 text-red-500 hover:bg-red-50 rounded-2xl px-5 font-black text-[10px] uppercase tracking-widest transition-all"
                                onClick={() => setActionDialog({ id: p.id, type: "reject" })}
                                disabled={verifyMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-2" /> {t("payReject")}
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
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
            <span>Showing <span className="text-slate-900">{filtered.length}</span> of <span className="text-slate-900">{payments.length}</span> payments</span>
            {(search || filter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-emerald-600 hover:text-emerald-700 font-black tracking-widest">{t("lpClearFilters") || "Clear filters"}</button>
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
