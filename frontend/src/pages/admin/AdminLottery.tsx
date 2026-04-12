import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Square, Trophy, Loader2, Ticket, Sparkles, CircleDot, TrendingUp, AlertCircle } from "lucide-react";
import { useCurrentLottery, useCreateLottery, usePickWinner } from "@/hooks/useLottery";
import { useState } from "react";
import { apiFetch } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminLottery() {
  const { data: lotteryData, isLoading: lotteryLoading, error } = useCurrentLottery();
  const createMutation = useCreateLottery();
  const pickWinnerMutation = usePickWinner();

  const [startNumber, setStartNumber] = useState("1");
  const [endNumber, setEndNumber] = useState("100");
  const [prizeText, setPrizeText] = useState("");
  const [ticketPrice, setTicketPrice] = useState("100");
  const [isDrawing, setIsDrawing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const lottery = lotteryData?.lottery;
  const stats = lotteryData?.number_stats;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeText.trim()) return toast({ title: "Validation Error", description: "Prize text is required.", variant: "destructive" });
    if (Number(endNumber) <= Number(startNumber)) return toast({ title: "Validation Error", description: "End number must be greater than start number.", variant: "destructive" });
    if (!ticketPrice || Number(ticketPrice) <= 0) return toast({ title: "Validation Error", description: "Ticket price must be greater than 0.", variant: "destructive" });

    try {
      await createMutation.mutateAsync({
        start_number: Number(startNumber),
        end_number: Number(endNumber),
        prize_text: prizeText,
        ticket_price: Number(ticketPrice),
      });
      toast({ title: "Lottery Started", description: `Successfully generated numbers ${startNumber} to ${endNumber}.` });
      setPrizeText("");
      setTicketPrice("100");
      setEndNumber("100");
      setStartNumber("1");
    } catch (err: any) {
      toast({ title: t("startFailed"), description: err.message, variant: "destructive" });
    }
  };

  const handleStop = async () => {
    if (!lottery) return;
    try {
      await apiFetch(`/admin/lottery/${lottery.id}/stop`, { method: 'PUT' });
      toast({ title: t("lotteryStopped"), description: t("alDrawClosed") });
      queryClient.invalidateQueries({ queryKey: ['lottery'] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const winner = await pickWinnerMutation.mutateAsync();
      toast({
        title: t("alWinnerDrawn"),
        description: `${t("adminLotteryTicket")} #${winner.number} ${t("alHasWonThe")} ${lottery?.prize_car_name || lottery?.prize_text}!`,
        duration: 8000
      });
      queryClient.invalidateQueries({ queryKey: ['lottery'] });
    } catch (err: any) {
      toast({ title: t("drawFailed"), description: err.message, variant: "destructive" });
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#4CBFBF]/10 flex items-center justify-center border border-[#4CBFBF]/20 shadow-sm">
            <Ticket className="h-7 w-7 text-[#4CBFBF]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4CBFBF]/10 text-[#4CBFBF] text-[9px] font-black uppercase tracking-[0.2em] mb-2 border border-[#4CBFBF]/20 shadow-sm">
              <Sparkles className="h-3 w-3" /> {t("lotteryControl")}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{t("alGenerateNumbers")}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{t("alSetRangeAndPrize")}</p>
          </div>
        </div>
        {lottery && (
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            {t("activeDraw")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Control Panel */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center gap-3">
            <CircleDot className="h-4 w-4 text-[#4CBFBF]" />
            <span className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">{t("lotteryControl")}</span>
          </div>

          <div className="p-8">
            {lotteryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4CBFBF] opacity-40" />
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-center">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <p className="text-[10px] font-black text-red-900 uppercase tracking-widest leading-relaxed">Failed to load lottery data</p>
                <Button onClick={() => window.location.reload()} variant="ghost" className="mt-4 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 h-8">Retry Connection</Button>
              </div>
            ) : lottery ? (
              <div className="space-y-6">
                {/* Active Prize Card */}
                <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-[#4CBFBF]/5 to-[#4CBFBF]/10 border border-[#4CBFBF]/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#4CBFBF]/10 rounded-full blur-2xl -mr-8 -mt-8" />
                  <p className="text-[9px] font-black text-[#4CBFBF] mb-2 uppercase tracking-[0.2em]">{t("activePrize")}</p>
                  <p className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">{lottery.prize_car_name || lottery.prize_text}</p>
                  <div className="mt-5 flex gap-2">
                    <div className="flex-1 bg-white/70 rounded-xl p-3 border border-white/80 min-w-0">
                      <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">{t("range")}</p>
                      <p className="text-sm font-black text-slate-800 tabular-nums whitespace-nowrap">{lottery.start_number}–{lottery.end_number}</p>
                    </div>
                    <div className="flex-1 bg-white/70 rounded-xl p-3 border border-white/80 min-w-0">
                      <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">{t("status")}</p>
                      <p className="text-sm font-black uppercase text-amber-500 whitespace-nowrap">{lottery.status}</p>
                    </div>
                    <div className="flex-1 bg-white/70 rounded-xl p-3 border border-white/80 min-w-0">
                      <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Price</p>
                      <p className="text-sm font-black text-slate-800 tabular-nums whitespace-nowrap">ETB {Number(lottery.ticket_price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest mb-1.5">{t("lotteryConfirmed")}</p>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">{stats?.confirmed || 0}</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <p className="text-[8px] text-amber-500 font-black uppercase tracking-widest mb-1.5">{t("lotteryPending")}</p>
                    <p className="text-2xl font-black text-amber-600 tabular-nums">{stats?.pending || 0}</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{t("lotteryFree")}</p>
                    <p className="text-2xl font-black text-slate-500 tabular-nums">{stats?.available || 0}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all hover:scale-[1.02] active:scale-95"
                  onClick={handleStop}
                >
                  <Square className="h-4 w-4 mr-2" /> {t("stopLottery")}
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleStart}>
                {/* Number Range */}
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">{t("numberRangeLabel")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 ml-1">From</p>
                      <div className="h-14 w-full flex items-center bg-slate-100 border border-slate-200 rounded-2xl px-5 font-black text-slate-400 tabular-nums text-base select-none">1</div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 ml-1">To</p>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={endNumber}
                        onChange={(e) => setEndNumber(e.target.value.replace(/\D/g, ""))}
                        required
                        placeholder="500"
                        className="h-14 w-full bg-white border-2 border-slate-200 hover:border-[#4CBFBF]/40 focus-visible:ring-2 focus-visible:ring-[#4CBFBF]/30 focus-visible:border-[#4CBFBF] font-black text-slate-900 text-base tabular-nums rounded-2xl px-5 placeholder:text-slate-300 [appearance:textfield] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Prize */}
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">{t("alMainPrize")}</Label>
                  <Input
                    value={prizeText}
                    onChange={(e) => setPrizeText(e.target.value)}
                    required
                    placeholder={t("alPrizeExample")}
                    className="h-14 bg-white border-2 border-slate-200 hover:border-[#4CBFBF]/40 focus-visible:ring-2 focus-visible:ring-[#4CBFBF]/30 focus-visible:border-[#4CBFBF] text-slate-900 font-black rounded-2xl px-5 placeholder:text-slate-300 transition-colors"
                  />
                </div>

                {/* Ticket Price */}
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">{t("ticketPrice")}</Label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm pointer-events-none">ETB</span>
                    <Input
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                      required
                      placeholder="0.00"
                      className="h-14 bg-white border-2 border-slate-200 hover:border-[#f5b027]/40 focus-visible:ring-2 focus-visible:ring-[#f5b027]/30 focus-visible:border-[#f5b027] font-black text-slate-900 tabular-nums rounded-2xl pl-14 pr-5 placeholder:text-slate-300 [appearance:textfield] transition-colors"
                    />
                  </div>
                </div>

                <Button
                  disabled={createMutation.isPending}
                  className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/15 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {createMutation.isPending
                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> {t("alInitializing")}</>
                    : <><Play className="h-5 w-5 mr-2 fill-current" /> {t("initializeNewDraw")}</>
                  }
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Draw Action Panel */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-[#4CBFBF]" />
              <span className="font-black text-slate-600 text-[10px] uppercase tracking-[0.2em]">{t("prepareForDraw")}</span>
            </div>
            {lottery && (
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {stats?.confirmed || 0} {t("lotteryConfirmed")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {stats?.pending || 0} {t("lotteryPending")}
                </span>
              </div>
            )}
          </div>

          <div className="p-12 flex flex-col items-center justify-center text-center space-y-10 min-h-[440px] relative">
            <div className={`absolute inset-0 bg-gradient-to-br from-[#4CBFBF]/[0.04] to-transparent transition-opacity duration-1000 ${isDrawing ? 'opacity-100' : 'opacity-0'}`} />

            <div className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 z-10 shadow-lg
              ${isDrawing ? 'bg-[#4CBFBF] shadow-[#4CBFBF]/30 scale-110' : 'bg-slate-50 border-2 border-slate-200'}`}>
              <Trophy className={`h-16 w-16 transition-all duration-700 ${isDrawing ? 'text-white animate-pulse' : 'text-[#4CBFBF]'}`} />
            </div>

            <div className="max-w-sm z-10 space-y-3">
              <h3 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                {t("prepareForDraw")}
              </h3>
              <p className="text-slate-400 font-bold leading-relaxed uppercase tracking-widest text-[10px]">
                {lottery?.prize_car_name || lottery?.prize_text ? t("alOneLuckyWinner") : t("drawWinnerDesc")}
              </p>
            </div>

            <Button
              size="lg"
              className={`px-16 h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl z-10 border-0
                ${stats?.confirmed! > 0 && !isDrawing
                  ? 'bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] hover:scale-105 active:scale-95 shadow-[#4CBFBF]/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
                ${isDrawing ? 'animate-pulse' : ''}
              `}
              disabled={!lottery || stats?.confirmed === 0 || isDrawing || pickWinnerMutation.isPending}
              onClick={handleDraw}
            >
              {isDrawing || pickWinnerMutation.isPending
                ? <><Loader2 className="h-5 w-5 mr-3 animate-spin" />{t("alDrawingWinner")}</>
                : <><Trophy className={`h-5 w-5 mr-3 ${stats?.confirmed === 0 ? 'opacity-30' : 'fill-current'}`} />{t("drawTheWinner")}</>
              }
            </Button>

            {lottery && stats?.confirmed === 0 && !isDrawing && (
              <p className="text-[10px] text-amber-600 font-black tracking-[0.2em] uppercase z-10 bg-amber-50 px-5 py-2 rounded-full border border-amber-200">
                {t("alRequiresConfirmedTicket")}
              </p>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
