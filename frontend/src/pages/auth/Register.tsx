import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Eye, EyeOff, UserPlus, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle, MailCheck, Car } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/useSettings";
import { apiFetch } from "@/services/api";
import heroBg from "@/assets/hero-bg-lasers.png";
import { cn } from "@/lib/utils";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const security = settings?.Security || {};
  const minLength = security.minPasswordLength || 8;
  const requireNumbers = security.requireNumbers !== false;
  const requireUppercase = security.requireUppercase !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email || !firstName) return;
    
    setIsLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email.toLowerCase().trim(),
          password
        })
      });
      setRegisteredEmail(email.toLowerCase().trim());
      setRegistered(true);
    } catch (error: any) {
      toast({ title: t("authRegistrationBlocked"), description: error?.message || t("authCredentialConflict"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const checks = [
    { label: `At least ${minLength} characters`, ok: password.length >= minLength },
    ...(requireNumbers ? [{ label: t("containsNumber"), ok: /\d/.test(password) }] : []),
    ...(requireUppercase ? [{ label: t("containsUppercase"), ok: /[A-Z]/.test(password) }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1a2e 100%)' }}>
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* Left Side: Cinematic Onboarding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d1b2e 100%)' }}>
           <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.40) 50%, rgba(10,22,40,0.15) 100%)' }} />
           <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] -mr-32 -mt-32" style={{ background: 'radial-gradient(circle, rgba(61,240,162,0.16) 0%, transparent 70%)' }} />
           
           <div className="relative z-10 p-20 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border backdrop-blur-xl" style={{ background: 'rgba(61,240,162,0.12)', borderColor: 'rgba(61,240,162,0.25)', color: '#3df0a2' }}>
                 <ShieldCheck className="h-3 w-3" /> {t("authSecureNodeInitialization")}
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                 {t("authJoinEliteNetwork")}
              </h2>
              <p className="text-lg font-medium leading-relaxed mb-12" style={{ color: 'rgba(190,215,205,0.78)' }}>
                 {t("authRegisterDesc")}
              </p>
              
              <div className="space-y-6">
                 {[
                   { label: t("authTransparentDraw"), icon: Sparkles },
                   { label: t("authVerifiedAssetNetwork"), icon: ShieldCheck },
                   { label: t("authSeamlessAssetManagement"), icon: Car }
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all" style={{ background: 'rgba(61,240,162,0.10)', border: '1px solid rgba(61,240,162,0.20)', color: '#3df0a2' }}>
                         <feat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">{feat.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center p-4 lg:px-24 lg:py-6 relative overflow-y-auto bg-white">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.1) 0%, transparent 70%)' }} />

           <div className="w-full max-w-lg relative z-10 animate-fade-in-up">

              {/* ─── SUCCESS: EMAIL SENT ───────────────────────────── */}
              {registered ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(61,240,162,0.12)', border: '2px solid rgba(61,240,162,0.3)' }}>
                    <MailCheck className="h-8 w-8" style={{ color: '#3df0a2' }} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-3">Check Your Email</h1>
                  <p className="text-slate-500 font-medium mb-2">We sent a verification link to:</p>
                  <p className="font-black text-slate-800 mb-6">{registeredEmail}</p>
                  <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                    Click the link in the email to activate your account. The link expires in <strong>24 hours</strong>.
                    <br />Check your spam folder if you don't see it.
                  </p>
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg hover:scale-[1.02] transition-all"
                    style={{ background: '#0d2e22' }}
                  >
                    Go to Sign In <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
              <>
              {/* ─── FORM ─────────────────────────────────────────── */}
              <div className="text-center mb-6">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border group" style={{ background: 'rgba(61,240,162,0.10)', borderColor: 'rgba(61,240,162,0.25)' }}>
                    <UserPlus className="h-6 w-6 group-hover:rotate-12 transition-transform" style={{ color: '#3df0a2' }} />
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">{t("authCreateIdentity")}</h1>
                 <p className="font-medium text-slate-500">{t("joinGech")}</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="firstName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("firstName")}</Label>
                       <div className="relative">
                          <Input
                             id="firstName"
                             placeholder="Marcus"
                             className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200"
                             value={firstName}
                             onChange={(e) => setFirstName(e.target.value)}
                             required
                          />
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="lastName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("lastName")}</Label>
                       <Input
                          id="lastName"
                          placeholder="Rivera"
                          className="h-14 text-slate-900 rounded-2xl px-4 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("email")}</Label>
                    <div className="relative">
                       <Input
                          id="email"
                          type="email"
                          placeholder="identifier@gech.com"
                          className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                       />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("password")}</Label>
                    <div className="relative">
                       <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-14 text-slate-900 rounded-2xl px-12 transition-all placeholder:text-slate-400 bg-slate-50 border-slate-200 font-mono"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                       />
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                       <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-slate-400 hover:text-slate-600"
                       >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                    {password && (
                       <div className="grid grid-cols-3 gap-2 pt-1 ml-1">
                          {checks.map((c, i) => (
                             <div key={i} className="flex flex-col gap-1">
                                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                                   <div className={cn("h-full transition-all duration-500", c.ok ? "bg-primary" : "bg-transparent")} style={{ width: '100%' }} />
                                </div>
                                <span className={cn("text-[8px] font-black uppercase tracking-widest", c.ok ? "text-primary" : "text-slate-600")}>{c.label}</span>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 border-0 shadow-lg text-white"
                    style={{ background: '#0d2e22' }}
                    disabled={isLoading}
                 >
                    {isLoading ? t("authInitializationIdentity") : t("createOne")}
                 </Button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                 <p className="text-sm font-medium text-slate-500">
                    {t("haveAccount")}{" "}
                    <Link to="/auth/login" className="font-black uppercase tracking-widest text-xs hover:underline ml-2" style={{ color: '#0d2e22' }}>
                       {t("signInLink")} <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
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

