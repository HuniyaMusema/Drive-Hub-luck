import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Car, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Lock, Mail, MailCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg-lasers.png";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        const loggedInUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as any,
        };
        setUser(loggedInUser);
        toast({ title: `${t("authWelcomeBackMsg")}, ${data.name}!`, description: t("authSecureSession") });
        if (loggedInUser.role === "admin" || loggedInUser.role === "lottery_staff") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else if (response.status === 403 && data.requiresVerification) {
        // Account exists but email is not verified yet
        setUnverifiedEmail(data.email || email.toLowerCase().trim());
      } else {
        toast({ title: t("authAccessDenied"), description: data.message || t("authCredentialConflict"), variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t("authNetworkError"), description: t("authConnectionFailed"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResendSent(true);
        toast({ title: "Email Sent", description: "A new verification link has been sent to your email." });
      } else {
        toast({ title: "Error", description: data.message || "Failed to resend verification email.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network Error", description: "Failed to connect to the server.", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a2820 100%)' }}>
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* Left Side: Cinematic Visuals */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2e22 100%)' }}>
           <img src={heroBg} alt="Luxury Background" className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105" />
           <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,22,40,0.90) 0%, rgba(10,22,40,0.40) 50%, rgba(10,22,40,0.15) 100%)' }} />
           <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] -mr-32 -mt-32" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.18) 0%, transparent 70%)' }} />
           
           <div className="relative z-10 p-20 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border backdrop-blur-xl" style={{ background: 'rgba(61,240,162,0.12)', borderColor: 'rgba(61,240,162,0.25)', color: '#3df0a2' }}>
                 <ShieldCheck className="h-3 w-3" /> {t("authEncryptedAccess")}
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                 {t("authPremiumTitle")} <br />
                 <span style={{ color: '#3df0a2' }}>{t("authJourneyStarts")}</span>
              </h2>
              <p className="text-lg font-medium leading-relaxed mb-12" style={{ color: 'rgba(190,215,205,0.78)' }}>
                 {t("authLoginDesc")}
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                 {[
                   { label: t("authVettedAssets"), icon: ShieldCheck },
                   { label: t("authFairPlay"), icon: Sparkles }
                 ].map((feat, i) => (
                   <div key={i} className="flex flex-col gap-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(61,240,162,0.10)', border: '1px solid rgba(61,240,162,0.20)', color: '#3df0a2' }}>
                         <feat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{feat.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Elegant Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:px-24 lg:py-8 relative overflow-y-auto" style={{ background: 'linear-gradient(160deg, #f0f7f4 0%, #e8f5ee 100%)' }}>
           {/* Ambient glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.07) 0%, transparent 70%)' }} />

           <div className="w-full max-w-md relative z-10 animate-fade-in-up">
              <div className="text-center mb-8">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border group" style={{ background: 'rgba(61,240,162,0.10)', borderColor: 'rgba(61,240,162,0.25)' }}>
                    <Lock className="h-6 w-6 group-hover:rotate-12 transition-transform" style={{ color: '#3df0a2' }} />
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">{t("authAuthenticatedAccess")}</h1>
                 <p className="font-medium text-slate-500">{t("signInToAccount")}</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                 <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-600">{t("email")}</Label>
                    <div className="relative">
                       <Input 
                          id="email" 
                          type="text" 
                          placeholder="identifier@drivehub.com" 
                          className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required
                       />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'rgba(61,240,162,0.80)' }} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                       <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t("password")}</Label>
                       <Link to="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: '#0d2e22' }}>{t("forgotPassword")}</Link>
                    </div>
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
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'rgba(61,240,162,0.80)' }} />
                       <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 hover:text-slate-600"
                       >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                 </div>

                  {/* Unverified Email Alert */}
                  {unverifiedEmail && (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 animate-fade-in-up">
                      <div className="flex items-start gap-3 text-left">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-200 text-amber-700">
                          <MailCheck className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-widest text-amber-800 mb-1">Unverified Account</p>
                          <p className="text-xs text-amber-700 font-medium leading-relaxed mb-3">
                            Please verify your link at <span className="font-bold underline">{unverifiedEmail}</span> to activate your access.
                          </p>
                          {!resendSent ? (
                            <Button 
                              type="button"
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                              className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm"
                            >
                              {resendLoading ? "Sending..." : "Resend Verification Link"}
                            </Button>
                          ) : (
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> Resent Successfully
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                 <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-0 shadow-lg text-white" 
                    style={{ background: '#0d2e22' }}
                    disabled={isLoading}
                 >
                    {isLoading ? t("authEstablishingSession") : t("signIn")}
                 </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                 <p className="text-sm font-medium text-slate-500">
                    {t("noAccount")}{" "}
                    <Link to="/auth/register" className="font-black uppercase tracking-widest text-xs hover:underline ml-2" style={{ color: '#0d2e22' }}>
                       {t("createOne")} <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
