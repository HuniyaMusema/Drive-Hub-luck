import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, ImageIcon, Loader2, CreditCard, Search, Clock, CheckCircle2, XCircle, RefreshCw, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLotteryPayments, useVerifyPayment } from "@/hooks/useLottery";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "pending" | "approved" | "rejected";

const statusConfig: Record<string, { icon: typeof Clock; labelKey: string; className: string }> = {
  pending:  { icon: Clock,        labelKey: "lpPendingReview", className: "bg-amber-400/10 text-[#f5b027] border-amber-400/20 shadow-sm" },
  approved: { icon: CheckCircle2, labelKey: "payApprove",       className: "bg-[#4CBFBF]/10 text-[#4CBFBF] border-[#4CBFBF]/20 shadow-sm" },
  rejected: { icon: XCircle,      labelKey: "payReject",        className: "bg-red-400/10 text-red-400 border-red-400/20 shadow-sm" },
};

const filterTabs: { key: FilterType; labelKey: string; color: string }[] = [
  { key: "all",      labelKey: "payAll",            color: "text-foreground" },
  { key: "pending",  labelKey: "lpPendingReview",   color: "text-amber-600" },
  { key: "approved", labelKey: "payApprove",        color: "text-green-600" },
  { key: "rejected", labelKey: "payReject",         color: "text-destructive" },
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
  const { t, formatDate } = useLanguage();

  const filtered = useMemo(() => {
    let list = filter === "all" ? payments : payments.filter(p => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => {
        const name = (p.user_name || "").toLowerCase();
        const email = (p.user_email || "").toLowerCase();
        const tickets = p.ticket_numbers || (p.ticket_number !== undefined ? [p.ticket_number] : []);
        
        return name.includes(q) || 
               email.includes(q) || 
               tickets.some((num: any) => num?.toString().includes(q));
      });
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
        title: type === "approve" ? t("paymentApprovedToast") : t("paymentRejectedToast"),
        description: t("paymentProcessedToast"),
      });
    } catch (err: any) {
      toast({ title: t("toastError"), description: err.message, variant: "destructive" });
    } finally {
      setActionDialog(null);
      setReason("");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
            <CreditCard className="h-5 w-5 text-[#4CBFBF]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("payLotteryPayments")}</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t("payReviewVerify")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              className="pl-9 rounded-xl bg-white border-slate-200 focus-visible:ring-[#4CBFBF]/20 h-9 font-black text-slate-900 placeholder:text-slate-300 text-sm"
              placeholder={t("lpSearchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl border-slate-200 bg-white hover:text-[#4CBFBF] transition-all shadow-sm h-9 px-4 font-black text-slate-500 text-[10px]"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-[#4CBFBF]' : ''}`} />
            {t("payRefresh")}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t("payTotal"),         value: counts.all,      color: "text-slate-900", bg: "bg-white",     border: "border-slate-200" },
          { label: t("lpPendingReview"),  value: counts.pending,  valueColor: "text-[#f5b027]", color: "text-[#f5b027]", bg: "bg-slate-50", border: "border-slate-200" },
          { label: t("payApprove"),       value: counts.approved, valueColor: "text-[#4CBFBF]", color: "text-[#4CBFBF]", bg: "bg-slate-50", border: "border-slate-200" },
          { label: t("payReject"),        value: counts.rejected, valueColor: "text-red-400",   color: "text-red-400",   bg: "bg-slate-50", border: "border-slate-200" },
        ].map(({ label, value, color, bg, border, valueColor }) => (
          <div key={label} className={`rounded-2xl p-4 border ${border} ${bg} shadow-sm relative overflow-hidden group`}>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
            <p className={`text-2xl font-black tabular-nums tracking-tighter ${valueColor || 'text-slate-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-200
              ${filter === key
                ? 'bg-[#4CBFBF] text-white border-[#4CBFBF] shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#4CBFBF]/40 hover:text-slate-900'}`}
          >
            {t(labelKey)}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tabular-nums ${filter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-12 w-12 animate-spin text-[#4CBFBF] opacity-20" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <ImageIcon className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm">{search || filter !== "all" ? t("payNoPaymentsFilter") : t("payNoLotteryPayments")}</p>
            <p className="text-slate-400 text-xs uppercase font-black tracking-widest">{t("payPaymentsAppearOnce")}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-1">#</div>
              <div className="col-span-3">{t("payUser")}</div>
              <div className="col-span-2">{t("payMethod")}</div>
              <div className="col-span-1">{t("payTickets")}</div>
              <div className="col-span-2">{t("year")}</div>
              <div className="col-span-1">{t("payReceipt")}</div>
              <div className="col-span-2">{t("payStatus")}</div>
            </div>

            {filtered.map((p, i) => {
              const sc = statusConfig[p.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const ticketList = p.ticket_numbers || (p.ticket_number !== undefined ? [p.ticket_number] : []);
              const ticketDisplay = ticketList.map((n: any) => n?.toString().padStart(3, '0') || '---').join(", ");

              return (
                <div key={p.id} className="grid grid-cols-12 gap-3 px-6 py-5 items-center hover:bg-slate-50 transition-colors group">
                  {/* # */}
                  <div className="col-span-1 text-sm font-black text-slate-300 tabular-nums">{i + 1}</div>

                  {/* User */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#4CBFBF]/10 flex items-center justify-center text-sm font-black text-[#4CBFBF] shrink-0 border border-[#4CBFBF]/20">
                      {p.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-sm uppercase truncate group-hover:text-[#4CBFBF] transition-colors">{p.user_name}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{p.user_email}</p>
                    </div>
                  </div>

                  {/* Method */}
                  <div className="col-span-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase border whitespace-nowrap ${p.method === 'CBE' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-[#4CBFBF]/10 text-[#4CBFBF] border-[#4CBFBF]/20'}`}>
                      {p.method}
                    </span>
                  </div>

                  {/* Ticket */}
                  <div className="col-span-1">
                    <span className="font-black text-[#4CBFBF] tabular-nums text-sm truncate block" title={ticketDisplay}>
                      {ticketList.length > 2 
                        ? `${ticketList.slice(0, 2).map((n:any)=>n?.toString().padStart(3,'0') || '---').join(", ")} +${ticketList.length - 2}`
                        : ticketDisplay || t("lpNoTickets")}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-[10px] font-black uppercase text-slate-500 tabular-nums">
                    {(p as any).created_at ? formatDate((p as any).created_at) : '---'}
                  </div>

                  {/* Receipt */}
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1 rounded-xl border-slate-200 bg-slate-50 hover:border-[#4CBFBF]/40 hover:text-[#4CBFBF] text-xs font-black uppercase px-3 text-slate-500"
                      onClick={() => setPreviewUrl(p.receipt_url)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status + Actions */}
                  <div className="col-span-2 flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-1.5 w-fit text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full border ${sc.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {t(sc.labelKey)}
                    </span>
                    {p.rejection_reason && (
                      <p className="text-xs text-red-400 font-bold truncate max-w-full">"{t(p.rejection_reason)}"</p>
                    )}
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-9 bg-[#4CBFBF] hover:bg-[#3fb0b0] text-white rounded-xl px-4 font-black text-xs uppercase"
                          onClick={() => setActionDialog({ id: p.id, type: "approve" })}
                          disabled={verifyMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />{t("payApprove")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 text-red-400 hover:bg-red-400/10 rounded-xl px-4 font-black text-xs uppercase"
                          onClick={() => setActionDialog({ id: p.id, type: "reject" })}
                          disabled={verifyMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />{t("payReject")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs font-black uppercase tracking-widest text-slate-400 flex justify-between">
            <span>{t("lpShowingPayments", { count: filtered.length, total: payments.length })}</span>
            {(search || filter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }} className="text-[#4CBFBF] hover:text-[#3fb0b0] font-black">{t("lpClearFilters")}</button>
            )}
          </div>
        )}
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[2.5rem] border-slate-200 bg-white shadow-2xl">
          <div className="bg-slate-50 flex items-center justify-center p-6">
            {previewUrl && <img src={previewUrl} alt="Receipt proof" className="w-full h-auto max-h-[70vh] object-contain rounded-2xl" />}
          </div>
          <div className="p-5 bg-white border-t border-slate-100 flex justify-center">
            <Button className="rounded-2xl h-12 px-10 font-black uppercase text-[11px] tracking-widest bg-slate-50 border border-slate-200 text-slate-900 hover:bg-slate-100" onClick={() => setPreviewUrl(null)}>{t("closeViewerBtn")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setReason(""); }}>
        <DialogContent className="rounded-[2.5rem] border-slate-200 bg-white max-w-md p-10 shadow-2xl">
          <DialogHeader className="pt-2">
            <DialogTitle className={`text-2xl font-black flex items-center gap-4 tracking-tighter uppercase ${actionDialog?.type === "reject" ? "text-red-500" : "text-[#4CBFBF]"}`}>
              {actionDialog?.type === "approve" ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
              {actionDialog?.type === "approve" ? t("confirmApprovalTitle") : t("rejectTransactionTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8">
            {actionDialog?.type === "reject" ? (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t("reasonForRejection")}</Label>
                {/* Quick-select preset reasons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "reasonBlurry",
                    "reasonNoRef",
                    "reasonWrongAmount",
                    "reasonEdited",
                    "reasonWrongAccount",
                    "reasonDuplicate",
                  ].map((presetKey) => (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => setReason(presetKey)}
                      className={`text-[9px] font-black uppercase tracking-wide px-3 py-1.5 rounded-xl border transition-all ${
                        reason === presetKey
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500"
                      }`}
                    >
                      {t(presetKey)}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("customReason")}
                  className="rounded-2xl border-slate-200 bg-slate-50 min-h-[80px] focus:ring-[#4CBFBF]/20 text-slate-900 font-black text-sm p-4 placeholder:text-slate-300"
                />
              </div>
            ) : (
              <p className="text-slate-500 text-sm font-black uppercase tracking-widest leading-relaxed">
                {t("approvePaymentDesc")}
              </p>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-3">
            <Button
              className={`w-full h-16 rounded-2xl shadow-xl font-black uppercase text-[11px] tracking-[0.2em] ${actionDialog?.type === "reject" ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" : "bg-[#4CBFBF] hover:bg-[#3fb0b0] text-white shadow-[#4CBFBF]/20"}`}
              onClick={handleAction}
              disabled={verifyMutation.isPending || (actionDialog?.type === "reject" && !reason.trim())}
            >
              {verifyMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-3" />{t("processing")}</> : (actionDialog?.type === "approve" ? t("verifyNowBtn") : t("confirmRejectionBtn"))}
            </Button>
            <Button variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50" onClick={() => { setActionDialog(null); setReason(""); }}>{t("cancelBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
