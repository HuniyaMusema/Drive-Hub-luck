import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Square, Trophy, Loader2 } from "lucide-react";
import { useCurrentLottery, useCreateLottery, usePickWinner } from "@/hooks/useLottery";
import { useState, useMemo } from "react";
import { apiFetch } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminLottery() {
  const { data: lotteryData, isLoading: lotteryLoading } = useCurrentLottery();
  const createMutation = useCreateLottery();
  const pickWinnerMutation = usePickWinner();
  
  const [startNumber, setStartNumber] = useState("1");
  const [endNumber, setEndNumber] = useState("100");
  const [prizeText, setPrizeText] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const lottery = lotteryData?.lottery;
  const stats = lotteryData?.number_stats;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prizeText.trim()) return toast({ title: "Validation Error", description: "Prize text is required.", variant: "destructive" });
    if (Number(startNumber) >= Number(endNumber)) return toast({ title: "Validation Error", description: "End number must be greater than start number.", variant: "destructive" });
    
    try {
      await createMutation.mutateAsync({
        start_number: Number(startNumber),
        end_number: Number(endNumber),
        prize_text: prizeText,
      });
      toast({ title: t("lotteryStarted"), description: `${t("alSuccessfullyGenerated")} ${startNumber} to ${endNumber}.` });
      setPrizeText("");
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
      // Small simulated delay for visual tension
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{t("alGenerateNumbers")}</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{t("alSetRangeAndPrize")}</p>
        </div>
        {lottery && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-xl shadow-amber-500/5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            {t("activeDraw")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 p-10 border border-slate-200">
          <h2 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <Square className="h-4.5 w-4.5 text-amber-500" />
            {t("lotteryControl")}
          </h2>
          {lotteryLoading ? (
             <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" /></div>
          ) : lottery ? (
            <div className="space-y-6">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/[0.05] transition-colors" />
                <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">{t("activePrize")}</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">{lottery.prize_car_name || lottery.prize_text}</p>
                <div className="mt-8 grid grid-cols-2 gap-6">
                   <div>
                     <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">{t("range")}</p>
                     <p className="text-sm font-black text-slate-900 tabular-nums tracking-widest">{lottery.start_number} - {lottery.end_number}</p>
                   </div>
                   <div>
                     <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1.5">{t("status")}</p>
                     <p className="text-sm font-black uppercase tabular-nums text-amber-500">{lottery.status}</p>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[8px] text-amber-500 font-black uppercase tracking-widest mb-1.5">{t("lotteryConfirmed")}</p>
                  <p className="text-xl font-black text-slate-900 tabular-nums tracking-tighter">{stats?.confirmed || 0}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-100 border border-slate-200">
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5">{t("lotteryPending")}</p>
                  <p className="text-xl font-black text-amber-500 tabular-nums tracking-tighter">{stats?.pending || 0}</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-40">
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5">{t("lotteryFree")}</p>
                  <p className="text-xl font-black text-slate-400 tabular-nums tracking-tighter">{stats?.available || 0}</p>
                </div>
              </div>

              <Button variant="ghost" className="w-full h-14 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" /> {t("stopLottery")}
              </Button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleStart}>
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">{t("numberRangeLabel")}</Label>
                <div className="flex gap-4">
                  <Input type="number" min={1} value={startNumber} onChange={(e) => setStartNumber(e.target.value)} required placeholder="1" className="h-16 bg-slate-50 border-slate-200 focus-visible:ring-amber-500/20 font-black text-slate-900 tabular-nums rounded-[1.25rem] px-6 shadow-inner" />
                  <span className="self-center text-slate-300 font-black">→</span>
                  <Input type="number" min={2} value={endNumber} onChange={(e) => setEndNumber(e.target.value)} required placeholder="100" className="h-16 bg-slate-50 border-slate-200 focus-visible:ring-amber-500/20 font-black text-slate-900 tabular-nums rounded-[1.25rem] px-6 shadow-inner" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                   <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">{t("alMainPrize")}</Label>
                   <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{t("alTicketPriceSettings")}</span>
                </div>
                <Input value={prizeText} onChange={(e) => setPrizeText(e.target.value)} required placeholder={t("alPrizeExample")} className="h-16 bg-slate-50 border-slate-200 focus-visible:ring-amber-500/20 text-slate-900 font-black rounded-[1.25rem] px-6 shadow-inner" />
              </div>
              <Button disabled={createMutation.isPending} className="w-full h-16 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.25em] shadow-xl shadow-[#4CBFBF]/10 bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] border-0 transition-all active:scale-95 disabled:opacity-50 mt-4">
                {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-3 fill-current" />} 
                {createMutation.isPending ? t("alInitializing") : t("initializeNewDraw")}
              </Button>
            </form>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100 p-12 flex flex-col items-center justify-center text-center space-y-10 min-h-[500px]">
           {/* Visual background gradient pulse */}
           <div className={`absolute inset-0 bg-gradient-to-br from-[#4CBFBF]/[0.05] to-transparent transition-opacity duration-1000 ${isDrawing ? 'opacity-100' : 'opacity-0'}`} />
           
           <div className={`w-40 h-40 rounded-[3rem] flex items-center justify-center transition-all duration-700 z-10 
             ${isDrawing ? 'bg-[#4CBFBF] shadow-[0_0_50px_rgba(76,191,191,0.2)] scale-110' : 'bg-slate-50 border border-slate-200 shadow-inner'}`}>
              <Trophy className={`h-20 w-20 transition-all duration-700 ${isDrawing ? 'text-white animate-pulse' : 'text-[#4CBFBF]'}`} />
           </div>
           
           <div className="max-w-md z-10">
             <h3 className="text-5xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9] mb-6">{t("prepareForDraw")}</h3>
             <p className="text-slate-500 font-bold leading-relaxed uppercase tracking-widest text-[10px] px-8">
               {lottery?.prize_car_name || lottery?.prize_text 
                 ? t("alOneLuckyWinner")
                 : t("drawWinnerDesc")}
             </p>
           </div>
           
           <Button 
              size="lg" 
              className={`px-20 h-20 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl z-10 border-0
                ${stats?.confirmed! > 0 && !isDrawing ? 'bg-[#4CBFBF] text-white hover:bg-[#3fb0b0] hover:scale-105 active:scale-95 shadow-[#4CBFBF]/10' : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'}
                ${isDrawing ? 'animate-pulse' : ''}
              `} 
              disabled={!lottery || stats?.confirmed === 0 || isDrawing || pickWinnerMutation.isPending}
              onClick={handleDraw}
            >
              {isDrawing || pickWinnerMutation.isPending ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  {t("alDrawingWinner")}
                </>
              ) : (
                <>
                  <Trophy className={`h-6 w-6 mr-4 ${stats?.confirmed === 0 ? 'opacity-30' : 'fill-current'}`} />
                  {t("drawTheWinner")}
                </>
              )}
           </Button>
           
           {lottery && stats?.confirmed === 0 && !isDrawing && (
             <p className="text-[10px] text-[#4CBFBF] font-black tracking-[0.2em] uppercase z-10 transition-opacity bg-[#4CBFBF]/10 px-6 py-2.5 rounded-full border border-[#4CBFBF]/20 animate-pulse">
               {t("alRequiresConfirmedTicket")}
             </p>
           )}
        </div>
      </div>
    </AdminLayout>
  );
}
