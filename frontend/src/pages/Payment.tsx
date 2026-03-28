import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Upload, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const pastPayments = [
  { id: "PAY-2847", date: "Mar 15, 2026", amount: "$75.00", status: "approved" as const },
  { id: "PAY-2903", date: "Mar 18, 2026", amount: "$25.00", status: "pending" as const },
];

export default function Payment() {
  const { t } = useLanguage();

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

          <div className="bg-card rounded-xl shadow-sm p-6 mb-10">
            <h2 className="font-semibold text-card-foreground mb-4">{t("submitPaymentReceipt")}</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="ref">{t("referenceNumber")}</Label>
                <Input id="ref" placeholder="e.g. TXN-123456" />
              </div>
              <div className="space-y-2">
                <Label>{t("receiptImage")}</Label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-xl p-8 cursor-pointer hover:border-accent transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">{t("clickToUpload")}</span>
                  <span className="text-xs text-muted-foreground/60 mt-1">{t("uploadHint")}</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <Button type="submit" size="lg" className="w-full">{t("submitReceipt")}</Button>
            </form>
          </div>

          <h2 className="font-semibold text-foreground mb-4">{t("paymentHistory")}</h2>
          <div className="space-y-3">
            {pastPayments.map((p) => {
              const s = statusStyles[p.status];
              const Icon = s.icon;
              return (
                <div key={p.id} className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-card-foreground text-sm">{p.id}</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="font-bold text-card-foreground tabular-nums">{p.amount}</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
