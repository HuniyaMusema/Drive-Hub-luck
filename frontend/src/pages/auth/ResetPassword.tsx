import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg-lasers.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const checks = [
    { label: "At least 6 chars", ok: password.length >= 6 },
    { label: "Contains number", ok: /\d/.test(password) },
    { label: "Passwords match", ok: password === confirmPassword && confirmPassword.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/auth/login"), 3000);
      } else {
        if (response.status === 400) {
          setTokenError(true);
        }
        toast({ title: "Reset Failed", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection Error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1a2e 100%)" }}>
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* Left Side: Cinematic Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1b2e 100%)" }}>
          <img src={heroBg} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.40) 50%, rgba(10,22,40,0.15) 100%)" }} />
          <div className="relative z-10 p-20 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border backdrop-blur-xl" style={{ background: "rgba(61,240,162,0.12)", borderColor: "rgba(61,240,162,0.25)", color: "#3df0a2" }}>
              <ShieldCheck className="h-3 w-3" /> Secure Reset Portal
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
              Create A New<br />
              <span style={{ color: "#3df0a2" }}>Password.</span>
            </h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: "rgba(190,215,205,0.78)" }}>
              Set a strong new password to protect your Gech Hub account. You'll be signed out of all other devices.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:px-24 lg:py-8 relative overflow-y-auto bg-white">
          <div className="w-full max-w-md relative z-10 animate-fade-in-up">
            {tokenError ? (
              /* Invalid Token State */
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.10)", border: "2px solid rgba(239,68,68,0.25)" }}>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Link Expired</h1>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
                </p>
                <Link
                  to="/auth/forgot-password"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: "#0d2e22" }}
                >
                  Request New Link <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : success ? (
              /* Success State */
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(61,240,162,0.12)", border: "2px solid rgba(61,240,162,0.3)" }}>
                  <CheckCircle className="h-8 w-8" style={{ color: "#3df0a2" }} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Password Updated!</h1>
                <p className="text-slate-500 font-medium mb-6">
                  Your password has been reset successfully. Redirecting you to login...
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: "#0d2e22" }}
                >
                  Sign In Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* Reset Form */
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border group" style={{ background: "rgba(61,240,162,0.10)", borderColor: "rgba(61,240,162,0.25)" }}>
                    <Lock className="h-6 w-6 group-hover:rotate-12 transition-transform" style={{ color: "#3df0a2" }} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Set New Password</h1>
                  <p className="font-medium text-slate-500">Choose a strong password for your account.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200 font-mono"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {password && (
                      <div className="grid grid-cols-3 gap-2 pt-1 ml-1">
                        {checks.map((c, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div className={cn("h-full transition-all duration-500", c.ok ? "bg-emerald-500" : "bg-transparent")} style={{ width: "100%" }} />
                            </div>
                            <span className={cn("text-[8px] font-black uppercase tracking-widest", c.ok ? "text-emerald-600" : "text-slate-400")}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200 font-mono"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-0 shadow-lg text-white"
                    style={{ background: "#0d2e22" }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting Password…" : "Reset Password"}
                  </Button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Remembered it?{" "}
                    <Link to="/auth/login" className="font-black uppercase tracking-widest text-xs hover:underline ml-1" style={{ color: "#0d2e22" }}>
                      Sign In <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
