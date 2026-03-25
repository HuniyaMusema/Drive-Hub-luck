import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

        {/* Rental History */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-card-foreground mb-3">Rental History</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between py-2 border-b last:border-0">
              <span>Prestige Sedan S — 3 days</span>
              <span className="tabular-nums">$255.00</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Metro City 200 — 1 day</span>
              <span className="tabular-nums">$45.00</span>
            </div>
          </div>
        </div>

        {/* Lottery History */}
        <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-card-foreground mb-3">Lottery History</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between py-2 border-b last:border-0">
              <span>Draw #17 — Numbers: 14, 28, 55</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Lost</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Draw #18 — Numbers: 9, 42</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>
            </div>
          </div>
        </div>

        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Log Out
        </Button>
      </div>
    </PageShell>
  );
}
