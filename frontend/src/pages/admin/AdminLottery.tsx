import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Square, Trophy, Loader2 } from "lucide-react";
import { useCurrentLottery } from "@/hooks/useLottery";
import { useAdminRentals } from "@/hooks/useAdmin"; // For any shared logic if needed
import { useState, useMemo } from "react";
import { apiFetch } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminLottery() {
  const { data: lotteryData, isLoading: lotteryLoading } = useCurrentLottery();
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For now, using a simple local fetch for numbers since I haven't added useLotteryNumbers yet in useLottery.ts
  // Wait, I did add useLotteryPayments but not useLotteryNumbers. Let's assume I'll add it or fetch here.
  // Actually, I'll just add useLotteryNumbers to useLottery.ts first to be clean.
  // HOLD ON - I'll just use a local query for now to avoid switching files too much if I can.
  // Actually, let's just use the current lottery's confirmed numbers if available, 
  // but better to have a dedicated hook.

  const lottery = lotteryData?.lottery;
  const stats = lotteryData?.number_stats;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for starting a new lottery would go here
    toast({ title: "Coming Soon", description: "Lottery creation UI is under development." });
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

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Lottery Management</h1>
        {lottery && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Active Draw
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border/60">
          <h2 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Square className="h-4 w-4 text-primary" />
            Lottery Control
          </h2>
          {lotteryLoading ? (
             <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : lottery ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Active Prize</p>
                <p className="text-lg font-bold text-foreground">{lottery.prize_car_name || lottery.prize_text}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">Range</p>
                     <p className="text-sm font-semibold">{lottery.start_number} - {lottery.end_number}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                     <p className="text-sm font-semibold capitalize">{lottery.status}</p>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                  <p className="text-[10px] text-green-600 font-bold uppercase">Sold</p>
                  <p className="text-lg font-bold text-green-700">{stats?.confirmed || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] text-amber-600 font-bold uppercase">Pending</p>
                  <p className="text-lg font-bold text-amber-700">{stats?.pending || 0}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Free</p>
                  <p className="text-lg font-bold text-blue-700">{stats?.available || 0}</p>
                </div>
              </div>

              <Button variant="destructive" className="w-full" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" /> Stop Lottery
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleStart}>
              <div className="space-y-2">
                <Label>Number Range</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="1" className="bg-muted/30" />
                  <span className="self-center text-muted-foreground">to</span>
                  <Input type="number" placeholder="100" className="bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ticket Price ($)</Label>
                <Input type="number" placeholder="15" className="bg-muted/30" />
              </div>
              <Button className="w-full shadow-lg shadow-primary/20">
                <Play className="h-4 w-4 mr-2" /> Initialize New Draw
              </Button>
            </form>
          )}
        </div>

        {/* Info Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Trophy className="h-10 w-10 text-primary opacity-80" />
           </div>
           <div className="max-w-md">
             <h3 className="text-2xl font-bold text-foreground">Prepare for the Draw</h3>
             <p className="text-muted-foreground mt-2">
               Once the lottery is closed and all payments are verified, you can select a random winner from the confirmed participants.
             </p>
           </div>
           <Button variant="outline" size="lg" className="px-10 rounded-xl" disabled={!lottery || stats?.confirmed === 0}>
              <Trophy className="h-4 w-4 mr-2 text-primary" />
              Draw the Winner
           </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
