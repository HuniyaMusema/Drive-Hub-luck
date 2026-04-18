import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, AlertCircle, Loader2, MailCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg-lasers.png";

type PageState = "verifying" | "success" | "expired" | "error";

export default function VerifyEmail() {
  const [pageState, setPageState] = useState<PageState>("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setPageState("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and user to log them in immediately
          sessionStorage.setItem("token", data.token);
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as any,
          });
          
          setPageState("success");
          toast({ title: "Email Verified", description: "Your account is now active. Welcome to Gech Hub!" });
          
          // Redirect to dashboard after 2.5 seconds
          setTimeout(() => navigate(data.role === "admin" || data.role === "lottery_staff" ? "/admin" : "/dashboard"), 2500);
        } else if (data.expired) {
          setPageState("expired");
        } else {
          setPageState("error");
          setErrorMsg(data.message || "Verification failed.");
        }
      } catch {
        setPageState("error");
        setErrorMsg("Could not reach the server. Please try again.");
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    setResendError("");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.toLowerCase().trim() }),
      });
      const data = await response.json();
      if (response.ok || response.status === 200) {
        setResendSent(true);
      } else {
        setResendError(data.message || "Failed to resend verification email.");
      }
    } catch {
      setResendError("Connection error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a2820 100%)" }}>
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* Left cinematic panel */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d2e22 100%)" }}>
          <img src={heroBg} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.40) 50%, rgba(10,22,40,0.15) 100%)" }} />
          <div className="relative z-10 p-20 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border backdrop-blur-xl" style={{ background: "rgba(61,240,162,0.12)", borderColor: "rgba(61,240,162,0.25)", color: "#3df0a2" }}>
              <MailCheck className="h-3 w-3" /> Email Verification
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-6" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
              Activating Your<br />
              <span style={{ color: "#3df0a2" }}>Account.</span>
            </h2>
            <p className="text-lg font-medium leading-relaxed" style={{ color: "rgba(190,215,205,0.78)" }}>
              One click is all it takes. We're verifying your identity and activating your full access right now.
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:px-24 lg:py-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md text-center animate-fade-in-up">

            {/* VERIFYING */}
            {pageState === "verifying" && (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(61,240,162,0.10)", border: "2px solid rgba(61,240,162,0.25)" }}>
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3df0a2" }} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Verifying…</h1>
                <p className="text-slate-500 font-medium">Please wait while we activate your account.</p>
              </>
            )}

            {/* SUCCESS */}
            {pageState === "success" && (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(61,240,162,0.12)", border: "2px solid rgba(61,240,162,0.3)" }}>
                  <CheckCircle className="h-8 w-8" style={{ color: "#3df0a2" }} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Account Verified!</h1>
                <p className="text-slate-500 font-medium mb-6">Your email has been confirmed and your account is now active. Redirecting you to your dashboard…</p>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-[grow_2.5s_ease-in-out_forwards]" style={{ background: "#3df0a2" }} />
                </div>
              </>
            )}

            {/* EXPIRED */}
            {pageState === "expired" && (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(234,179,8,0.10)", border: "2px solid rgba(234,179,8,0.30)" }}>
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Link Expired</h1>
                <p className="text-slate-500 font-medium mb-8">This verification link has expired. Verification links are valid for 24 hours. Enter your email to get a new one.</p>

                {!resendSent ? (
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    {resendError && <p className="text-sm text-red-500">{resendError}</p>}
                    <Button
                      onClick={handleResend}
                      disabled={resendLoading || !resendEmail}
                      className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest text-white border-0"
                      style={{ background: "#0d2e22" }}
                    >
                      {resendLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      {resendLoading ? "Sending…" : "Resend Verification Email"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-emerald-700 font-semibold text-sm">✓ A new verification email has been sent. Please check your inbox.</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Link to="/auth/login" className="text-sm font-black uppercase tracking-widest hover:underline" style={{ color: "#0d2e22" }}>
                    Back to Sign In <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
                  </Link>
                </div>
              </>
            )}

            {/* GENERIC ERROR */}
            {pageState === "error" && (
              <>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.10)", border: "2px solid rgba(239,68,68,0.25)" }}>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Verification Failed</h1>
                <p className="text-slate-500 font-medium mb-8">{errorMsg}</p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: "#0d2e22" }}
                >
                  Back to Sign In <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
