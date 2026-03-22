import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedLotteryNumber, LotteryDrawResult } from "@/types/auth";

export default function GenerateLotteryNumbers() {
  const [count, setCount] = useState(6);
  const [rangeMax, setRangeMax] = useState(100);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GeneratedLotteryNumber[]>([]);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    const numbers: number[] = [];
    while (numbers.length < count) {
      const n = Math.floor(Math.random() * rangeMax) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }
    numbers.sort((a, b) => a - b);

    const result: LotteryDrawResult = {
      success: true,
      numbers,
      drawId: `DRAW-${Date.now().toString(36).toUpperCase()}`,
      message: `${count} numbers generated successfully`,
    };

    const entry: GeneratedLotteryNumber = {
      id: result.drawId,
      drawId: result.drawId,
      numbers: result.numbers,
      generatedAt: new Date().toLocaleString(),
    };

    setHistory((prev) => [entry, ...prev]);
    setLoading(false);

    toast({ title: "Numbers Generated", description: result.message });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Generate Lottery Numbers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Configuration</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <div className="space-y-2">
              <Label>Numbers to Generate</Label>
              <Input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Range (1 – max)</Label>
              <Input type="number" min={10} max={999} value={rangeMax} onChange={(e) => setRangeMax(Number(e.target.value))} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || count > rangeMax}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Dices className="h-4 w-4 mr-2" />}
              {loading ? "Generating…" : "Generate Numbers"}
            </Button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Generated History</h2>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No numbers generated yet. Use the form to generate.</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{entry.drawId}</span>
                    <span className="text-xs text-muted-foreground">{entry.generatedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.numbers.map((n) => (
                      <span key={n} className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full tabular-nums">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
