import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, ImageIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLotteryPayments, useVerifyPayment } from "@/hooks/useLottery";

const statusStyles: Record<string, string> = {
  approved: "bg-primary/10 text-primary font-bold",
  pending: "bg-amber-100/60 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold",
  rejected: "bg-destructive/10 text-destructive font-bold",
};

export default function LotteryPayments() {
  const { data: payments = [], isLoading } = useLotteryPayments();
  const verifyMutation = useVerifyPayment();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

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
        description: `The transaction has been processed successfully.`,
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
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Financial Verification</h1>
            <p className="text-muted-foreground mt-1 text-sm">Review and authorize lottery ticket payments.</p>
         </div>
      </div>

      <div className="bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden shadow-primary/5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/30">
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Reference</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">User</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Method</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Ticket #</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Proof</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-muted-foreground bg-muted/20">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-12 w-12 opacity-10" />
                        <p className="font-medium">No lottery payment records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors group">
                      <td className="px-5 py-4 font-medium text-xs tabular-nums text-muted-foreground truncate max-w-[100px]">{p.id.split('-')[0].toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">{p.user_name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.user_email}</p>
                      </td>
                      <td className="px-5 py-4">
                         <span className="px-2 py-0.5 rounded bg-accent/20 text-accent-foreground text-[10px] font-bold border border-accent/20 uppercase">
                          {p.method}
                         </span>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-blue-600 tabular-nums text-base">
                        {p.ticket_number.toString().padStart(3, '0')}
                      </td>
                      <td className="px-5 py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-2 rounded-lg border-primary/20 hover:border-primary/50 text-xs shadow-sm" 
                          onClick={() => setPreviewUrl(p.receipt_url)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View Receipt
                        </Button>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-current transition-all ${statusStyles[p.status]}`}>
                          {p.status}
                        </span>
                        {p.rejection_reason && <p className="text-[9px] text-destructive mt-1.5 font-medium italic">Reason: {p.rejection_reason}</p>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                          {p.status === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-lg px-3" 
                                onClick={() => setActionDialog({ id: p.id, type: "approve" })}
                                disabled={verifyMutation.isPending}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-destructive hover:bg-destructive/10 rounded-lg px-3" 
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
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="relative pt-[100%] w-full bg-black/5 flex items-center justify-center">
             {previewUrl && <img src={previewUrl} alt="Receipt proof" className="absolute inset-0 w-full h-full object-contain" />}
          </div>
          <div className="p-4 bg-background border-t">
             <Button variant="outline" className="w-full rounded-xl" onClick={() => setPreviewUrl(null)}>Close Viewer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setReason(""); }}>
        <DialogContent className="rounded-2xl border-border/60 max-w-sm">
          <DialogHeader className="pt-2">
            <DialogTitle className="text-xl font-bold">{actionDialog?.type === "approve" ? "Confirm Approval" : "Reject Transaction"}</DialogTitle>
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
                Approve this payment to confirm the lottery ticket allocation. This action will notify the user.
              </p>
            )}
          </div>
          <DialogFooter className="flex-row gap-2 pt-2">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => { setActionDialog(null); setReason(""); }}>Cancel</Button>
            <Button
              className={`flex-1 rounded-xl shadow-lg ${actionDialog?.type === "reject" ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"}`}
              onClick={handleAction}
              disabled={verifyMutation.isPending || (actionDialog?.type === "reject" && !reason.trim())}
            >
              {verifyMutation.isPending ? "Processing..." : (actionDialog?.type === "approve" ? "Verify Now" : "Confirm Rejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
