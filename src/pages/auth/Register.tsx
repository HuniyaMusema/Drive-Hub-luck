import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Car, Eye, EyeOff, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  const checks = [
    { label: t("atLeast8"), ok: password.length >= 8 },
    { label: t("containsNumber"), ok: /\d/.test(password) },
    { label: t("containsUppercase"), ok: /[A-Z]/.test(password) },
  ];

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
              <h1 className="text-2xl font-bold text-card-foreground">{t("createAccount")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("joinGech")}</p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("firstName")}</Label>
                  <Input id="firstName" placeholder="Marcus" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("lastName")}</Label>
                  <Input id="lastName" placeholder="Rivera" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" type="tel" placeholder="+251 9XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1 pt-1">
                    {checks.map((c) => (
                      <div key={c.label} className={`flex items-center gap-2 text-xs ${c.ok ? "text-primary" : "text-muted-foreground"}`}>
                        <Check className={`h-3 w-3 ${c.ok ? "" : "opacity-30"}`} />
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg">{t("createAccount")}</Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("haveAccount")}{" "}
              <Link to="/auth/login" className="text-primary font-medium hover:underline">{t("signInLink")}</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
