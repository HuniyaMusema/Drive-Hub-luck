import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Mail, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a2820 100%)" }}>
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* Left Side: Cinematic Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d2e22 100%)" }}>
          <img src={heroBg} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.40) 50%, rgba(10,22,40,0.15) 100%)" }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] -mr-32 -mt-32" style={{ background: "radial-gradient(circle, rgba(61,240,162,0.16) 0%, transparent 70%)" }} />
          <div className="relative z-10 p-20 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border backdrop-blur-xl" style={{ background: "rgba(61,240,162,0.12)", borderColor: "rgba(61,240,162,0.25)", color: "#3df0a2" }}>
              <ShieldCheck className="h-3 w-3" /> Secure Password Recovery
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
              Reset Your<br />
              <span style={{ color: "#3df0a2" }}>Access Key.</span>
            </h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: "rgba(190,215,205,0.78)" }}>
              Enter your registered email address and we'll send you a secure link to create a new password.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:px-24 lg:py-8 relative overflow-y-auto bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(61,240,162,0.05) 0%, transparent 70%)" }} />

          <div className="w-full max-w-md relative z-10 animate-fade-in-up">
            {!submitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border group" style={{ background: "rgba(61,240,162,0.10)", borderColor: "rgba(61,240,162,0.25)" }}>
                    <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" style={{ color: "#3df0a2" }} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Forgot Password?</h1>
                  <p className="font-medium text-slate-500">No worries. Enter your email and we'll send a reset link.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-0 shadow-lg text-white"
                    style={{ background: "#0d2e22" }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending Reset Link…" : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Remember your password?{" "}
                    <Link to="/auth/login" className="font-black uppercase tracking-widest text-xs hover:underline ml-1" style={{ color: "#0d2e22" }}>
                      Sign in <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(61,240,162,0.12)", border: "2px solid rgba(61,240,162,0.3)" }}>
                  <CheckCircle className="h-8 w-8" style={{ color: "#3df0a2" }} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Check Your Inbox</h1>
                <p className="text-slate-500 font-medium mb-2">
                  We sent a reset link to:
                </p>
                <p className="font-black text-slate-800 mb-6">{email}</p>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                  The link expires in <strong>1 hour</strong>. If you don't see it, check your spam folder.
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: "#0d2e22" }}
                >
                  Back to Sign In <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
