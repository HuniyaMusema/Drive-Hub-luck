import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Car, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

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
        localStorage.setItem('token', data.token);
        const loggedInUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as any,
        };
        setUser(loggedInUser);
        toast({ title: `Welcome back, ${data.name}!`, description: "Secure session established." });
        if (loggedInUser.role === "admin" || loggedInUser.role === "lottery_staff") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({ title: "Access Denied", description: data.message || "Invalid credentials", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Network Error", description: "Standard secure connection failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row mt-16">
        {/* Left Side: Cinematic Visuals */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
           <img src={heroBg} alt="Luxury Background" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
           
           <div className="relative z-10 p-20 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8 border border-primary/20 backdrop-blur-xl">
                 <ShieldCheck className="h-3 w-3" /> Encrypted Access Point
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">
                 YOUR PREMIUM <br />
                 <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">JOURNEY</span> STARTS HERE.
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                 Log in to access your curated dashboard, participate in elite sweepstakes, and manage your luxury vehicle interests.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                 {[
                   { label: "Vetted Assets", icon: ShieldCheck },
                   { label: "Fair Play", icon: Sparkles }
                 ].map((feat, i) => (
                   <div key={i} className="flex flex-col gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                         <feat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{feat.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Elegant Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-slate-950">
           {/* Decorative Orb */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

           <div className="w-full max-w-md relative z-10 animate-fade-in-up">
              <div className="text-center mb-12">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 group">
                    <Lock className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
                 </div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Authenticated Access</h1>
                 <p className="text-slate-500 font-medium">{t("signInToAccount")}</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                 <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t("email")}</Label>
                    <div className="relative">
                       <Input 
                          id="email" 
                          type="text" 
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
                    <div className="flex items-center justify-between ml-1">
                       <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("password")}</Label>
                       <Link to="#" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">{t("forgotPassword")}</Link>
                    </div>
                    <div className="relative">
                       <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-12 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-700 font-mono" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required
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
                 </div>

                 <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
                    disabled={isLoading}
                 >
                    {isLoading ? "ESTABLISHING SESSION..." : t("signIn")}
                 </Button>
              </form>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                 <p className="text-sm text-slate-500 font-medium">
                    {t("noAccount")}{" "}
                    <Link to="/auth/register" className="text-primary font-black uppercase tracking-widest text-xs hover:underline ml-2">
                       {t("createOne")} <ArrowRight className="inline-block h-3 w-3 ml-1" strokeWidth={3} />
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
