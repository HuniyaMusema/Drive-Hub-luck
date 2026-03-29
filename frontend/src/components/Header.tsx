import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Car, Menu, X, Globe, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { key: "home", href: "/" },
  { key: "cars", href: "/cars/sale" },
  { key: "rentals", href: "/cars/rent" },
  { key: "lottery", href: "/lottery" },
  { key: "contact", href: "/contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { savedCarsCount } = useSavedCars();
  const { user } = useAuth();
  const { settings } = useSettings();

  const operational = settings?.Operational || {};
  const isLotteryEnabled = operational.lotteryModuleEnabled !== false;
  const isSalesEnabled = operational.salesModuleEnabled !== false;
  const isRentalsEnabled = operational.rentalsModuleEnabled !== false;

  const filteredNavLinks = navLinks.filter(link => {
    if (link.key === "lottery") return isLotteryEnabled;
    if (link.key === "cars") return isSalesEnabled;
    if (link.key === "rentals") return isRentalsEnabled;
    return true;
  });

  const currentLang = languages.find((l) => l.code === language);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) { setScrolled(false); return; }
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const headerBg = isHome && !scrolled
    ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)'
    : 'hsl(152, 35%, 18%)';
  const mobileBg = 'rgba(15, 40, 25, 0.97)';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300" style={{ background: headerBg }}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Car className="h-7 w-7" />
          <span className="text-xl font-bold font-display tracking-tight" style={{ textShadow: '3px 5px 10px rgba(0, 0, 0, 0.2)' }}>Gech ጌች</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors px-2 py-1.5 rounded-md">
                <Globe className="h-4 w-4" />
                <span>{currentLang?.nativeLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`cursor-pointer ${
                    language === lang.code
                      ? "bg-accent text-accent-foreground font-semibold"
                      : ""
                  }`}
                >
                  {lang.nativeLabel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/saved-cars" className="relative p-2 text-white/70 hover:text-white transition-colors">
            <Bookmark className={`h-5 w-5 ${savedCarsCount > 0 ? "text-white fill-white/30" : ""}`} />
            {savedCarsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {savedCarsCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/dashboard">
              <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/30 rounded-full px-6">
                {t("dashboard")}
              </Button>
            </Link>
          ) : (
            <Link to="/auth/login">
              <Button className="bg-white/20 text-white hover:bg-white/30 border border-white/30 rounded-full px-6">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in-up border-t" style={{ background: mobileBg, borderColor: 'rgba(255,255,255,0.1)' }}>
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
            
            {user && (
              <Link
                to="/saved-cars"
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/saved-cars")
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Bookmark className="h-4 w-4" />
                {t("savedCars")}
                {savedCarsCount > 0 && (
                  <span className="ml-auto bg-amber-400 text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {savedCarsCount}
                  </span>
                )}
              </Link>
            )}

            {!user ? (
              <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-white/20 text-white border border-white/30 rounded-full mt-2">
                  {t("login")}
                </Button>
              </Link>
            ) : (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-white/20 text-white border border-white/30 rounded-full mt-2">
                  {t("dashboard")}
                </Button>
              </Link>
            )}

            {/* Language selector mobile */}
            <div className="flex gap-2 pt-3 border-t mt-2" style={{ borderColor: 'hsl(152, 25%, 22%)' }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    language === lang.code
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/60 hover:text-white bg-white/10"
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t mt-2" style={{ borderColor: 'hsl(152, 25%, 22%)' }}>
              <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-white/20 text-white border border-white/30 hover:bg-white/30 rounded-full">
                  {t("login")}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
