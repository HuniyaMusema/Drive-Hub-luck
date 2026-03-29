import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProfileHistory } from "@/hooks/useLottery";
import { Loader2, Car, Ticket } from "lucide-react";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: history, isLoading } = useProfileHistory();

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground text-lg">{user?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground">Member since Jan 2026</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first">First Name</Label>
                <Input id="first" defaultValue={user?.name?.split(' ')[0] || "User"} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last Name</Label>
                <Input id="last" defaultValue={user?.name?.split(' ')[1] || ""} disabled={!editing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" defaultValue={user?.email || "user@email.com"} disabled={!editing} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" defaultValue="+1 (555) 234-5678" disabled={!editing} className="pl-10" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editing ? (
                <>
                  <Button type="submit" onClick={() => setEditing(false)}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </form>
        </div>



        {/* Lottery History */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" /> Purchased Tickets
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (history?.lotteries?.length ?? 0) === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center bg-muted/20">
              <p className="text-secondary-foreground/60 text-sm italic">No lottery tickets purchased.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history?.lotteries.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                       {l.number}
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-foreground">Ticket #{l.number.toString().padStart(3, '0')}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">{l.status} Draw</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">{new Date(l.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </PageShell>
  );
}
