import { useProfileHistory, useSubmitLotteryPayment } from "@/hooks/useLottery";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageShell } from "@/components/PageShell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Payment() {
  const { t } = useLanguage();
  const { data: history, isLoading } = useProfileHistory();
  const submitMutation = useSubmitLotteryPayment();
  const { toast } = useToast();

  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [refNumber, setRefNumber] = useState("");
  const [method, setMethod] = useState<"CBE" | "Telebirr">("CBE");

  const pendingTickets = history?.lotteries?.filter(l => l.status === 'pending') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !refNumber) {
      toast({ title: "Incomplete", description: "Please select a ticket and enter reference number.", variant: "destructive" });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        lotteryNumberId: selectedTicket,
        receiptUrl: "https://example.com/receipts/dummy.jpg", // Placeholder until real upload is implemented
        method: method
      });
      toast({ title: "Submitted", description: "Payment receipt submitted successfully." });
      setSelectedTicket("");
      setRefNumber("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statusStyles = {
    pending: { icon: Clock, color: "text-amber-600 bg-amber-50", label: t("pending") },
    approved: { icon: CheckCircle2, color: "text-primary bg-primary/10", label: t("approved") },
    rejected: { icon: XCircle, color: "text-destructive bg-destructive/10", label: t("rejected") },
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> {t("homeLink")}
        </Link>

        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("payment")}</h1>
          <p className="text-muted-foreground mb-8">{t("paymentPageDesc")}</p>

          <div className="bg-card rounded-2xl shadow-xl p-8 mb-10 border border-border/60 shadow-primary/5">
            <h2 className="font-bold text-foreground text-xl mb-6 flex items-center gap-2">
               <Upload className="h-5 w-5 text-primary" /> {t("submitPaymentReceipt")}
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Reserved Ticket</Label>
                <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                  <SelectTrigger className="rounded-xl border-border/60 h-12 focus:ring-primary/20">
                    <SelectValue placeholder="Chose a number you pending ticket" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {pendingTickets.length === 0 ? (
                       <SelectItem value="none" disabled>No pending reserved numbers</SelectItem>
                    ) : (
                      pendingTickets.map(t => (
                        <SelectItem key={t.id} value={t.id}>Ticket #{t.number.toString().padStart(3, '0')} - {t.prize}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <Label htmlFor="method" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                    <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                      <SelectTrigger className="rounded-xl border-border/60 h-12">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="CBE">Commercial Bank (CBE)</SelectItem>
                         <SelectItem value="Telebirr">Telebirr</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label htmlFor="ref" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("referenceNumber")}</Label>
                    <Input id="ref" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder="e.g. TXN-123456" className="rounded-xl border-border/60 h-12" />
                 </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("receiptImage")}</Label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-10 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{t("clickToUpload")}</span>
                  <span className="text-xs text-muted-foreground mt-1">{t("uploadHint")}</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full rounded-xl h-12 font-bold shadow-lg shadow-primary/20" disabled={submitMutation.isPending || pendingTickets.length === 0}>
                {submitMutation.isPending ? "Submitting..." : t("submitReceipt")}
              </Button>
            </form>
          </div>

          <h2 className="font-bold text-foreground mb-6 flex items-center gap-2">
             <Clock className="h-5 w-5 text-primary" /> {t("paymentHistory")}
          </h2>
          <div className="space-y-4">
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
            ) : (history?.lotteries?.length ?? 0) === 0 ? (
              <div className="bg-card rounded-2xl p-10 text-center shadow-sm border border-dashed text-muted-foreground">
                <p className="font-medium">No previous payment activities recorded.</p>
              </div>
            ) : (
              history?.lotteries.map((p) => {
                const s = statusStyles[p.status as keyof typeof statusStyles] || statusStyles.pending;
                const Icon = s.icon;
                return (
                  <div key={p.id} className="flex items-center justify-between bg-card rounded-2xl p-5 shadow-sm border border-border/60 hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs">
                          {p.number}
                       </div>
                       <div>
                         <p className="font-bold text-foreground group-hover:text-primary transition-colors">Ticket #{p.number.toString().padStart(3, '0')}</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{new Date(p.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="font-extrabold text-foreground tabular-nums text-lg">$15.00</span>
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${s.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
