import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Car, Eye, EyeOff, Check, UserPlus, ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";
import { cn } from "@/lib/utils";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email || !firstName) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email.toLowerCase().trim(),
          password
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Account Initialized", description: "Identity verified. You can now establish a session." });
        navigate("/auth/login");
      } else {
        toast({ title: "Registration Blocked", description: data.message || "Credential conflict detected.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Connection Error", description: "Secure node registration failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const checks = [
    { label: t("atLeast8"), ok: password.length >= 8 },
    { label: t("containsNumber"), ok: /\d/.test(password) },
    { label: t("containsUppercase"), ok: /[A-Z]/.test(password) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row mt-16">
        {/* Left Side: Cinematic Onboarding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
           <img src={heroBg} alt="Onboarding Visual" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
           
           <div className="relative z-10 p-20 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8 border border-primary/20 backdrop-blur-xl">
                 <ShieldCheck className="h-3 w-3" /> Secure Node Initialization
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">
                 JOIN THE <br />
                 <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">ELITE</span> NETWORK.
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                 Create your account to unlock exclusive access to high-stakes draws, premium rentals, and our vetted luxury vehicle sales marketplace.
              </p>
              
              <div className="space-y-6">
                 {[
                   { label: "Transparent Draw Protocol", icon: Sparkles },
                   { label: "Verified Asset Network", icon: ShieldCheck },
                   { label: "Seamless Asset Management", icon: Car }
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary/20 transition-all">
                         <feat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{feat.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: High-Fidelity Registration */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-slate-950">
           {/* Decorative Orb */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

           <div className="w-full max-w-lg relative z-10 animate-fade-in-up">
              <div className="text-center mb-12">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 group">
                    <UserPlus className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
                 </div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Create Identity</h1>
                 <p className="text-slate-500 font-medium">{t("joinGech")}</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label htmlFor="firstName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("firstName")}</Label>
                       <div className="relative">
                          <Input 
                             id="firstName" 
                             placeholder="Marcus" 
                             className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-12 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-700" 
                             value={firstName} 
                             onChange={(e) => setFirstName(e.target.value)} 
                             required 
                          />
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="lastName" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("lastName")}</Label>
                       <Input 
                          id="lastName" 
                          placeholder="Rivera" 
                          className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-4 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-700" 
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
                          placeholder="identifier@drivehub.com" 
                          className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-12 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-700" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                       />
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("password")}</Label>
                    <div className="relative">
                       <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-12 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-700 font-mono" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                       />
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                       <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                       >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                    {password && (
                       <div className="grid grid-cols-3 gap-2 pt-2 ml-1">
                          {checks.map((c, i) => (
                             <div key={i} className="flex flex-col gap-1">
                                <div className={cn("h-1 rounded-full bg-white/5 overflow-hidden")}>
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
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
                    disabled={isLoading}
                 >
                    {isLoading ? "INITIALIZING IDENTITY..." : t("createOne")}
                 </Button>
              </form>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                 <p className="text-sm text-slate-500 font-medium">
                    {t("haveAccount")}{" "}
                    <Link to="/auth/login" className="text-primary font-black uppercase tracking-widest text-xs hover:underline ml-2">
                       {t("signInLink")} <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
