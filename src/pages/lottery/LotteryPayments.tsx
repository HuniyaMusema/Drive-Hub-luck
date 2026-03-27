import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { LotteryPayment } from "@/types/auth";

const initialPayments: LotteryPayment[] = [
  { id: "LP-001", userId: "u1", userName: "Sarah Chen", amount: 25, reference: "TXN-990101", screenshotUrl: "/placeholder.svg", date: "Mar 18, 2026", status: "pending" },
  { id: "LP-002", userId: "u2", userName: "James Okafor", amount: 50, reference: "TXN-990102", screenshotUrl: "/placeholder.svg", date: "Mar 18, 2026", status: "pending" },
  { id: "LP-003", userId: "u3", userName: "Marcus Rivera", amount: 25, reference: "TXN-990103", screenshotUrl: "/placeholder.svg", date: "Mar 17, 2026", status: "approved" },
  { id: "LP-004", userId: "u4", userName: "Lucia Gomez", amount: 75, reference: "TXN-990104", screenshotUrl: "/placeholder.svg", date: "Mar 16, 2026", status: "rejected", reason: "Invalid receipt" },
];

const statusStyles: Record<string, string> = {
  approved: "bg-primary/10 text-primary",
  pending: "bg-amber-100/60 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  rejected: "bg-destructive/10 text-destructive",
};

export default function LotteryPayments() {
  const [payments, setPayments] = useState<LotteryPayment[]>(initialPayments);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleAction = () => {
    if (!actionDialog) return;
    const { id, type } = actionDialog;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: type === "approve" ? "approved" : "rejected", reason: type === "reject" ? reason : undefined }
          : p,
      ),
    );

    toast({
      title: type === "approve" ? "Payment Approved" : "Payment Rejected",
      description: `Payment ${id} has been ${type === "approve" ? "approved" : "rejected"}.`,
    });

    setActionDialog(null);
    setReason("");
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Lottery Payments</h1>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Reference</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Screenshot</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium tabular-nums">{p.id}</td>
                  <td className="px-4 py-3">{p.userName}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.reference}</td>
                  <td className="px-4 py-3 tabular-nums">{p.date}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewUrl(p.screenshotUrl)}>
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                    {p.reason && <p className="text-xs text-muted-foreground mt-0.5">{p.reason}</p>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {p.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setActionDialog({ id: p.id, type: "approve" })}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setActionDialog({ id: p.id, type: "reject" })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          {previewUrl && <img src={previewUrl} alt="Payment screenshot" className="rounded-lg w-full" />}
        </DialogContent>
      </Dialog>

      {/* Approve / Reject Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog?.type === "approve" ? "Approve Payment" : "Reject Payment"}</DialogTitle>
          </DialogHeader>
          {actionDialog?.type === "reject" && (
            <div className="space-y-2">
              <Label>Reason for rejection</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason…" />
            </div>
          )}
          {actionDialog?.type === "approve" && (
            <p className="text-muted-foreground text-sm">Are you sure you want to approve this payment?</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setReason(""); }}>Cancel</Button>
            <Button
              variant={actionDialog?.type === "reject" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={actionDialog?.type === "reject" && !reason.trim()}
            >
              {actionDialog?.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
