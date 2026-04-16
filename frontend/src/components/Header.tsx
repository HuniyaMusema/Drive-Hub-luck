import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bookmark, Car, Globe, Menu, X, Bell, Ticket, Search, Key, Plus, FileText, ChevronDown, Users, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, languages } from "@/contexts/LanguageContext";
import { useSavedCars } from "@/contexts/SavedCarsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import NotificationBell from "@/components/NotificationBell";
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
  const { user, setUser } = useAuth();
  const { settings } = useSettings();

  const operational = settings?.Operational || {};
  const isLotteryEnabled = true;
  const isSalesEnabled = true;
  const isRentalsEnabled = true;

  const filteredNavLinks = navLinks;

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

  const scrolledBg = 'rgba(51, 65, 85, 0.97)';
  const mobileBg = 'rgba(51, 65, 85, 0.99)';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
      background: isHome && !scrolled ? 'transparent' : scrolledBg,
      backdropFilter: isHome && !scrolled ? 'none' : 'blur(20px)',
      boxShadow: isHome && !scrolled ? 'none' : '0 1px 0 rgba(76,191,191,0.08)',
    }}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8 relative">
        
        {/* Left side: Logo */}
        <Link to="/" className="flex items-center justify-center text-white min-w-max hover:opacity-80 transition-opacity gap-2">
          <span className="text-[20px] font-display tracking-widest leading-[1.2] capitalize text-white">
            {settings?.General?.platformName || "Gech"}
          </span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all"
              style={{
                color: isActive(link.href) ? '#071018' : 'rgba(255,255,255,0.75)',
                background: isActive(link.href) ? '#4CBFBF' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = '#4CBFBF'; }}
              onMouseLeave={e => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
        
        {/* Right side: User actions */}
        <div className="flex items-center gap-5">
          {/* Language Selector Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:flex items-center gap-1.5 text-white/70 hover:text-white transition-colors outline-none group">
              <Globe className="h-4 w-4 group-hover:text-[#4CBFBF] transition-colors" />
              <span className="text-[10px] font-semibold uppercase tracking-widest leading-none" style={{ marginTop: '2px' }}>
                {currentLang?.code.toUpperCase()}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-slate-800 border border-[#4CBFBF]/20 text-white shadow-xl rounded-xl p-1">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className={`text-xs cursor-pointer rounded-lg px-3 py-2 transition-colors focus:bg-[#4CBFBF]/10 focus:text-white ${language === lang.code ? 'text-[#4CBFBF] font-black tracking-widest uppercase text-[10px]' : 'text-white/70 font-medium'}`}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.nativeLabel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 group outline-none">
                  <div className="w-8 h-8 rounded-xl bg-[#4CBFBF]/10 flex items-center justify-center text-[#4CBFBF] font-black text-xs border border-[#4CBFBF]/20 shadow-sm transition-transform group-hover:scale-105">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-[10px] font-semibold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors leading-none">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-white/40 group-hover:text-[#4CBFBF] transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2 bg-slate-800 border border-[#4CBFBF]/20 text-white shadow-xl rounded-xl p-1">
                <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg px-3 py-2 transition-colors focus:bg-[#4CBFBF]/10 focus:text-white font-medium">
                  <Link to={user.role === 'admin' || user.role === 'lottery_staff' ? "/admin" : "/dashboard"} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-white/5 my-1" />
                <DropdownMenuItem asChild className="text-xs cursor-pointer rounded-lg px-3 py-2 transition-colors focus:bg-[#4CBFBF]/10 focus:text-white font-medium">
                  <Link to="/profile" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-white/5 my-1" />
                <DropdownMenuItem 
                  className="text-xs cursor-pointer rounded-lg px-3 py-2 transition-colors focus:bg-red-500/10 focus:text-red-400 font-medium text-red-500/80"
                  onClick={() => setUser && setUser(null)}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t("navTerminateSession")}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth/login" className="hidden md:flex items-center gap-2 group">
              <Key className="h-4 w-4 group-hover:text-white transition-colors" strokeWidth={2} style={{ color: '#4CBFBF', transform: 'rotate(-45deg)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                {t("login")}
              </span>
            </Link>
          )}

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {/* Saved Cars */}
          <Link to="/saved-cars" className="relative text-white/60 hover:text-white transition-colors">
            <FileText className="h-5 w-5" strokeWidth={1.5} />
            {savedCarsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 text-black text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full" style={{ background: '#4CBFBF' }}>
                {savedCarsCount}
              </span>
            )}
          </Link>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in-up border-t" style={{ background: mobileBg, borderColor: 'rgba(76,191,191,0.15)' }}>
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

            {user && (
              <Link
                to="/profile?tab=history"
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/profile")
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Ticket className="h-4 w-4" />
                {t("navTickets")}
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/notifications")
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Bell className="h-4 w-4" />
                {t("notifications")}
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
            <div className="flex gap-2 pt-3 border-t mt-2" style={{ borderColor: 'rgba(76,191,191,0.15)' }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    language === lang.code
                      ? "text-[#071018] font-semibold"
                      : "text-white/60 hover:text-white bg-white/10"
                  }`}
                  style={language === lang.code ? { background: '#4CBFBF' } : {}}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t mt-2" style={{ borderColor: 'rgba(76,191,191,0.15)' }}>
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
