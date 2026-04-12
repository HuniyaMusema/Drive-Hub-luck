import { useProfileHistory, useSubmitLotteryPayment, useCurrentLottery } from "@/hooks/useLottery";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Clock, CheckCircle2, XCircle, ArrowLeft, ImageIcon, Ticket, ChevronRight, Landmark, Smartphone, Info, ShieldCheck, Sparkles, AlertCircle, Copy, Check, Lock as LockIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { PageShell } from "@/components/PageShell";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function Payment() {
  const { t } = useLanguage();
  const { data: history, isLoading } = useProfileHistory();
  const { data: lotteryData } = useCurrentLottery();
  const submitMutation = useSubmitLotteryPayment();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'lottery_staff';

  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [method, setMethod] = useState<"CBE" | "Telebirr">("CBE");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ticketPrice = parseFloat(lotteryData?.lottery?.ticket_price as any) || settings?.Lottery?.ticketPrice || 0;
  const currency = settings?.General?.defaultCurrency || 'ETB';

  const passedTickets = location.state?.tickets || [];

  const processedTickets = useMemo(() => {
    const rawHistory = history?.lotteries || [];
    const combined = [...rawHistory];
    
    passedTickets.forEach((pt: any) => {
      if (!combined.find(l => l.id === pt.id)) {
        combined.push({
          id: pt.id,
          number: pt.number,
          status: pt.status || 'pending',
          date: new Date().toISOString(),
          prize: "Pending Prize Info"
        });
      }
    });

    return combined;
  }, [history, passedTickets]);

  const selectableTickets = useMemo(() => {
    return processedTickets.filter(t => 
      t.status === 'pending' && 
      t.payment_status !== 'pending' && 
      t.payment_status !== 'approved'
    );
  }, [processedTickets]);

  useEffect(() => {
    if (passedTickets.length > 0) {
      setSelectedTicket(passedTickets[0].id);
    }
  }, [passedTickets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("fileTooLarge"), description: t("fileTooLargeMsg"), variant: "destructive" });
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t("copiedTitle"), description: `${label} ${t("copiedTitle").toLowerCase()}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) {
      toast({ title: t("selectionNeededTitle"), description: t("reserveNumbersFirst"), variant: "destructive" });
      return;
    }
    if (!receiptFile) {
      toast({ title: t("uploadRequiredTitle"), description: t("uploadReceiptMsg"), variant: "destructive" });
      return;
    }

    setUploading(true);
    let receiptUrl = "";

    try {
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      const uploadRes = await fetch("/api/lottery/upload-receipt", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error(t("uploadFailedMsg"));
      const uploadData = await uploadRes.json();
      receiptUrl = uploadData.url;
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    try {
      await submitMutation.mutateAsync({
        lotteryNumberId: selectedTicket,
        receiptUrl,
        method,
      });
      toast({ title: t("receiptSubmittedTitle"), description: t("paymentPendingReview") });
      setSelectedTicket("");
      setReceiptFile(null);
      setReceiptPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      toast({ title: t("submissionFailedTitle"), description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const statusConfig = {
    pending:  { icon: Clock,          className: "text-amber-600 border-amber-500/20 bg-amber-500/5", label: t("pending") },
    approved: { icon: CheckCircle2,   className: "text-emerald-600 border-emerald-500/20 bg-emerald-500/5", label: t("approved") },
    rejected: { icon: XCircle,        className: "text-destructive border-destructive/20 bg-destructive/5", label: t("rejected") },
    confirming: { icon: Loader2,       className: "text-primary border-primary/20 bg-primary/5", label: t("payUnderReview") },
  };

  const isBusy = uploading || submitMutation.isPending;

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl pb-24">
        <div className="flex items-center justify-between mb-12">
            <Link to="/" className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              </div>
              {t("homeLink")}
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
               <ShieldCheck className="h-3 w-3" /> {t("paySecureCheckout")}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Payment Form */}
          <div className="lg:col-span-7 space-y-10 animate-fade-in-up">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter mb-4">{t("payment")}</h1>
              <p className="text-muted-foreground font-medium text-lg max-w-md">{t("paymentPageDesc")}</p>
            </div>

            <div className="bg-card rounded-[2.5rem] shadow-2xl shadow-primary/5 p-10 border border-border/60 relative overflow-hidden group">
               {/* Decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               
               {isAdminOrStaff ? (
                  <div className="text-center py-20 relative z-10">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <LockIcon className="h-8 w-8 text-primary" />
                     </div>
                     <h2 className="text-2xl font-black text-foreground tracking-tight uppercase mb-4">{t("payRestrictedAccess")}</h2>
                     <p className="text-muted-foreground font-medium max-w-md mx-auto">
                        {t("payManagementRestriction")}
                     </p>
                  </div>
               ) : (
                  <form className="space-y-10 relative z-10" onSubmit={handleSubmit}>
                    {/* Step 1: Selection */}
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                          <Ticket className="h-3 w-3" /> 01. {t("paySelectionReservation")}
                       </Label>
                       <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                         <SelectTrigger className="rounded-[1.25rem] border-border/60 h-16 bg-muted/20 focus:ring-primary/20 font-bold p-6">
                           <SelectValue placeholder={t("payWhichReservation")} />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl p-2">
                           {selectableTickets.length === 0 ? (
                             <div className="p-10 text-center bg-muted/10 rounded-3xl border border-dashed border-border/60">
                                <Ticket className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-4" />
                                <p className="text-sm font-black uppercase tracking-tight text-foreground mb-2">{t("payNoReservedFound")}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mb-6">{t("payPickConfirmNumbers")}</p>
                                <Link to="/lottery" className="inline-block">
                                  <Button variant="outline" size="sm" className="rounded-full font-black uppercase tracking-widest text-[9px] px-6">
                                    {t("payGoToBoard")}
                                  </Button>
                                </Link>
                             </div>
                           ) : (
                             selectableTickets.map(ticket => (
                               <SelectItem key={ticket.id} value={ticket.id} className="rounded-xl p-4 cursor-pointer focus:bg-primary/5">
                                 <div className="flex flex-col">
                                    <span className="font-black text-foreground text-sm">{t("ticketLabel")} #{ticket.number.toString().padStart(3, '0')}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">{ticket.prize || t("activeSweepstake")}</span>
                                 </div>
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                       {selectedTicket && (
                         <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 animate-fade-in">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              {t("payAmountDue")}: {(ticketPrice).toLocaleString()} {currency}
                            </span>
                         </div>
                       )}
                    </div>
   
                    {/* Step 2: Method */}
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                          <Landmark className="h-3 w-3" /> 02. {t("payGateway")}
                       </Label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { id: "CBE", name: "Commercial Bank", logo: Landmark, color: "primary" },
                           { id: "Telebirr", name: "Telebirr Wallet", logo: Smartphone, color: "blue-600" }
                         ].map(m => (
                           <button
                             key={m.id}
                             type="button"
                             onClick={() => setMethod(m.id as any)}
                             className={cn(
                               "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all group/btn text-left",
                               method === m.id
                                 ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10'
                                 : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/30'
                             )}
                           >
                             <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                               method === m.id ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground group-hover/btn:bg-primary/10"
                             )}>
                               <m.logo className="h-6 w-6" strokeWidth={2.5} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest">{m.id}</span>
                                <span className="text-[11px] font-bold opacity-60">{m.name}</span>
                             </div>
                             {method === m.id && <div className="ml-auto"><Check className="h-5 w-5 bg-primary rounded-full p-1 text-white" strokeWidth={4} /></div>}
                           </button>
                         ))}
                       </div>
                    </div>
   
                    {/* Step 3: Receipt */}
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                          <ImageIcon className="h-3 w-3" /> 03. {t("payValidationMedia")}
                       </Label>
   
                       {receiptPreview ? (
                         <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-primary/20 shadow-2xl bg-muted/30 animate-fade-in aspect-video">
                           <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-contain" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                             <Button
                               type="button"
                               variant="destructive"
                               className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 h-11 shadow-xl"
                               onClick={() => { setReceiptFile(null); setReceiptPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                             >
                               <XCircle className="h-4 w-4 mr-2" /> {t("payReplaceImage")}
                             </Button>
                           </div>
                         </div>
                       ) : (
                         <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-[2.5rem] p-16 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-muted/10 relative overflow-hidden">
                           <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="w-20 h-20 rounded-3xl bg-background flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-border/40">
                                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2.5} />
                              </div>
                              <h4 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">{t("payInstructions")}</h4>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted rounded-full px-4 py-1.5 border border-border/60">{t("fileFormatHint")}</span>
                           </div>
                           <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                         </label>
                       )}
                    </div>
   
                    <Button
                       type="submit"
                       className="w-full rounded-[1.5rem] h-20 text-xl font-black shadow-2xl shadow-primary/30 bg-primary hover:scale-[1.02] active:scale-95 transition-all group/submit"
                       disabled={isBusy}
                    >
                       {isBusy ? (
                         <><Loader2 className="h-6 w-6 animate-spin mr-3" /> {uploading ? t("payStreamingData") : t("payValidatingSession")}</>
                       ) : (
                         <div className="flex items-center gap-3">
                            {t("submitReceipt")}
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover/submit:translate-x-1 transition-transform">
                               <ChevronRight className="h-6 w-6 text-white" strokeWidth={4} />
                            </div>
                         </div>
                       )}
                    </Button>
                  </form>
               )}
            </div>
          </div>

          {/* Side Info & History */}
          <div className="lg:col-span-5 space-y-10">
            {/* Bank Details Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
                        <Info className="h-6 w-6 text-primary" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{t("payOfficialAccount")}</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t("contactInformation")}</p>
                        <p className="text-sm font-medium leading-relaxed text-slate-300">
                          {t("payTransferInstructions")}
                        </p>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 group/bank hover:bg-white/10 transition-colors">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("payCBE")}</span>
                              <button onClick={() => copyToClipboard("1000123456789", "CBE Account")} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white"><Copy className="h-4 w-4" /></button>
                           </div>
                           <p className="text-sm font-bold opacity-60">{t("payDriveHubAccount")}</p>
                           <p className="text-2xl font-black tracking-tight tabular-nums">1000 1234 5678 9</p>
                        </div>
                        
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 group/bank hover:bg-white/10 transition-colors">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("payTelebirrWallet")}</span>
                              <button onClick={() => copyToClipboard("+251 900 000 000", "Phone Number")} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white"><Copy className="h-4 w-4" /></button>
                           </div>
                           <p className="text-sm font-bold opacity-60">{t("payAdminTerminal")}</p>
                           <p className="text-2xl font-black tracking-tight tabular-nums">+251 900 000 000</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* History Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                   <h2 className="text-xl font-black text-foreground tracking-tight uppercase">{t("paymentHistory")}</h2>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase border border-border/60 rounded-full px-3 py-1">{t("payRecentActivity")}</div>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                     <Loader2 className="h-10 w-10 animate-spin text-primary" />
                     <p className="text-xs font-black uppercase tracking-widest">{t("payFetchingLedger")}</p>
                  </div>
                                ) : (processedTickets.length ?? 0) === 0 ? (
                  <div className="bg-muted/10 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border/40">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-40">{t("payNoTransactionHistory")}</p>
                  </div>
                ) : (
                  processedTickets.map((p: any) => {
                    // Logic to determine status display
                    let s = statusConfig.pending;
                    let label = "Under Review";

                    if (p.status === 'confirmed' || p.payment_status === 'approved') {
                      s = statusConfig.approved;
                      label = t("profConfirmedEntry");
                    } else if (p.payment_status === 'pending') {
                      s = { icon: Clock, className: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: t("payVerifyingReceipt") };
                      label = t("payVerifyingReceipt");
                    } else if (p.status === 'pending' && !p.payment_status) {
                      if (p.lottery_status === 'closed') {
                        s = { icon: XCircle, className: "bg-slate-500/10 text-slate-500 border-slate-500/20", label: "Lottery Closed" };
                        label = "Lottery Closed";
                      } else {
                        s = { icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: t("payAwaitingPayment") };
                        label = t("payAwaitingPayment");
                      }
                    } else if (p.payment_status === 'rejected') {
                      s = statusConfig.rejected;
                      label = t("payPaymentRejected");
                    }

                    const Icon = s.icon;
                    const isAwaiting = p.status === 'pending' && !p.payment_status && p.lottery_status !== 'closed';
                    const isClosed = p.lottery_status === 'closed';
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isAwaiting) {
                            setSelectedTicket(p.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-[2rem] p-6 shadow-sm border transition-all group overflow-hidden relative",
                          isClosed
                            ? "bg-slate-100/60 border-slate-200 opacity-70"
                            : "bg-card border-border/60 hover:shadow-xl hover:-translate-y-1",
                          isAwaiting && "cursor-pointer hover:border-amber-500/40"
                        )}
                      >
                        {/* Closed lottery banner */}
                        {isClosed && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 border border-slate-300">
                            <XCircle className="h-3 w-3 text-slate-400" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t("closedLottery")}</span>
                          </div>
                        )}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.className.split(' ')[0]}`} />
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center shadow-inner group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                             <Ticket className="h-7 w-7 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                             <span className="absolute text-[11px] font-black text-foreground tabular-nums">{p.number.toString().padStart(2, '0')}</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors leading-none mb-1.5">{t("payTicketEntry")} #{p.number}</p>
                            <div className="flex items-center gap-2">
                               <Clock className="h-3 w-3 text-muted-foreground opacity-40" />
                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{p.date ? new Date(p.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'Just Now'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2.5">
                           <div className="text-base font-black tabular-nums text-foreground tracking-tighter">{(ticketPrice).toLocaleString()} <span className="text-[10px] opacity-40 uppercase">{currency}</span></div>
                           <div className="flex flex-col items-end gap-1.5">
                              <span className={cn("inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm", s.className)}>
                                <Icon className={cn("h-3 w-3", s.label.includes("Verifying") || s.label.includes("Awaiting") ? 'animate-pulse' : '')} strokeWidth={3} />
                                {label}
                              </span>
                              {isAwaiting && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1">
                                  {t("tapToPay")} <ChevronRight className="h-2.5 w-2.5" />
                                </span>
                              )}
                              {p.rejection_reason && <p className="text-[8px] text-destructive font-bold italic text-right max-w-[120px] line-clamp-1">"{p.rejection_reason}"</p>}
                           </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
