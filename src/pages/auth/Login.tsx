import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Car, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "admin@gech.com": {
    password: "admin123",
    user: { id: "1", name: "Admin User", email: "admin@gech.com", role: "admin" },
  },
  "staff@gech.com": {
    password: "staff123",
    user: { id: "2", name: "Lottery Staff", email: "staff@gech.com", role: "lottery_staff" },
  },
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (account && account.password === password) {
      setUser(account.user);
      toast({ title: `Welcome, ${account.user.name}!`, description: `Logged in as ${account.user.role.replace("_", " ")}` });
      navigate(account.user.role === "admin" ? "/admin" : "/admin/lottery-payments");
    } else {
      toast({ title: "Invalid credentials", description: "Try admin@gech.com / admin123 or staff@gech.com / staff123", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-32 px-4 bg-surface-warm">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your Gech (ጌች) account</p>
            </div>

            <div className="mb-6 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground text-sm mb-1">Demo Accounts</p>
              <p><span className="font-medium">Admin:</span> admin@gech.com / admin123</p>
              <p><span className="font-medium">Lottery Staff:</span> staff@gech.com / staff123</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="text" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">Sign In</Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/auth/register" className="text-primary font-medium hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
