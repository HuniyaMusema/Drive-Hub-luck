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
      toast({ title: "Lottery Started", description: `Successfully generated numbers ${startNumber} to ${endNumber}.` });
      setPrizeText("");
    } catch (err: any) {
      toast({ title: "Start Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleStop = async () => {
    if (!lottery) return;
    try {
      await apiFetch(`/admin/lottery/${lottery.id}/stop`, { method: 'PUT' });
      toast({ title: "Lottery Stopped", description: "The current draw has been closed." });
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
        title: "Winner Drawn!", 
        description: `Ticket #${winner.number} has won the ${lottery?.prize_car_name || lottery?.prize_text}!`,
        duration: 8000
      });
      queryClient.invalidateQueries({ queryKey: ['lottery'] });
    } catch (err: any) {
      toast({ title: "Draw Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Generate Numbers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Set a number range and prize — the system generates all tickets instantly.</p>
        </div>
        {lottery && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 shadow-sm shadow-primary/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t("activeDraw")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-card rounded-xl shadow-xl shadow-primary/5 p-6 border border-border/60">
          <h2 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Square className="h-4 w-4 text-primary" />
            {t("lotteryControl")}
          </h2>
          {lotteryLoading ? (
             <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" /></div>
          ) : lottery ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-muted/40 to-muted/10 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <p className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">{t("activePrize")}</p>
                <p className="text-lg font-extrabold text-foreground">{lottery.prize_car_name || lottery.prize_text}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">{t("range")}</p>
                     <p className="text-sm font-bold tabular-nums">{lottery.start_number} - {lottery.end_number}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">{t("status")}</p>
                     <p className="text-sm font-bold capitalize tabular-nums text-primary">{lottery.status}</p>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10 transition-colors hover:bg-green-500/10">
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{t("lotteryConfirmed")}</p>
                  <p className="text-lg font-extrabold text-green-700">{stats?.confirmed || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 transition-colors hover:bg-amber-500/10">
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">{t("lotteryPending")}</p>
                  <p className="text-lg font-extrabold text-amber-700">{stats?.pending || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 transition-colors hover:bg-blue-500/10">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{t("lotteryFree")}</p>
                  <p className="text-lg font-extrabold text-blue-700">{stats?.available || 0}</p>
                </div>
              </div>

              <Button variant="destructive" className="w-full shadow-lg shadow-destructive/20 font-bold tracking-wide" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" /> {t("stopLottery")}
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleStart}>
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{t("numberRangeLabel")}</Label>
                <div className="flex gap-3">
                  <Input type="number" min={1} value={startNumber} onChange={(e) => setStartNumber(e.target.value)} required placeholder="1" className="bg-muted/30 focus-visible:ring-primary/40 font-bold tabular-nums" />
                  <span className="self-center text-muted-foreground font-bold">→</span>
                  <Input type="number" min={2} value={endNumber} onChange={(e) => setEndNumber(e.target.value)} required placeholder="100" className="bg-muted/30 focus-visible:ring-primary/40 font-bold tabular-nums" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Main Prize</Label>
                   <span className="text-[10px] text-muted-foreground italic tracking-wide">Ticket Price via Settings</span>
                </div>
                <Input value={prizeText} onChange={(e) => setPrizeText(e.target.value)} required placeholder="e.g. 2024 Toyota Camry" className="bg-muted/30 focus-visible:ring-primary/40" />
              </div>
              <Button disabled={createMutation.isPending} className="w-full font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/80 hover:to-primary h-12 text-md transition-all">
                {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />} 
                {createMutation.isPending ? "Initializing..." : t("initializeNewDraw")}
              </Button>
            </form>
          )}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2 relative overflow-hidden bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
           {/* Visual background gradient pulse */}
           <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-1000 ${isDrawing ? 'opacity-100' : 'opacity-0'}`} />
           
           <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-2 transition-all duration-500 z-10 ${isDrawing ? 'bg-primary shadow-[0_0_30px_rgba(var(--primary),0.5)] scale-110' : 'bg-primary/10 shadow-lg'}`}>
              <Trophy className={`h-14 w-14 transition-all duration-500 ${isDrawing ? 'text-primary-foreground animate-pulse' : 'text-primary'}`} />
           </div>
           
           <div className="max-w-md z-10 transition-transform duration-300">
             <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{t("prepareForDraw")}</h3>
             <p className="text-muted-foreground mt-3 leading-relaxed">
               {lottery?.prize_car_name || lottery?.prize_text 
                 ? `One lucky ticket holder will win the ${lottery?.prize_car_name || lottery?.prize_text}. Ensure all payments are verified before drawing.` 
                 : t("drawWinnerDesc")}
             </p>
           </div>
           
           <Button 
              size="lg" 
              className={`px-12 h-14 rounded-2xl text-lg font-bold transition-all shadow-xl z-10
                ${stats?.confirmed! > 0 && !isDrawing ? 'bg-gradient-to-r from-primary to-blue-600 hover:scale-105 hover:shadow-primary/30 text-white border-0' : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'}
                ${isDrawing ? 'animate-pulse cursor-not-allowed' : ''}
              `} 
              disabled={!lottery || stats?.confirmed === 0 || isDrawing || pickWinnerMutation.isPending}
              onClick={handleDraw}
            >
              {isDrawing || pickWinnerMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Drawing Winner...
                </>
              ) : (
                <>
                  <Trophy className={`h-5 w-5 mr-2 ${stats?.confirmed === 0 ? 'opacity-50' : ''}`} />
                  {t("drawTheWinner")}
                </>
              )}
           </Button>
           
           {lottery && stats?.confirmed === 0 && !isDrawing && (
             <p className="text-[11px] text-amber-600/80 font-bold tracking-widest uppercase z-10 transition-opacity">Requires at least 1 confirmed ticket payment to draw.</p>
           )}
        </div>
      </div>
    </AdminLayout>
  );
}
