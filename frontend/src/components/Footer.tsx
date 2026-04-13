import { Link } from "react-router-dom";
import { Car, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

export function Footer() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const operational = settings?.Operational || {};
  const isLotteryEnabled = operational.lotteryModuleEnabled !== false;
  const isSalesEnabled = operational.salesModuleEnabled !== false;
  const isRentalsEnabled = operational.rentalsModuleEnabled !== false;

  const quickLinks = [
    { label: t("carsForSale"), href: "/cars/sale", enabled: isSalesEnabled },
    { label: t("carsForRent"), href: "/cars/rent", enabled: isRentalsEnabled },
    { label: t("lottery"), href: "/lottery", enabled: isLotteryEnabled },
    { label: t("contact"), href: "/contact", enabled: true },
  ].filter(l => l.enabled);

  return (
    <footer className="border-t" style={{ background: 'linear-gradient(180deg, #1a2e45 0%, #142338 100%)', borderColor: 'rgba(76,191,191,0.15)' }}>
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center justify-start mb-6 hover:opacity-80 transition-opacity gap-2">
              <span className="text-[24px] font-display tracking-widest leading-[1.2] capitalize text-white">
                {settings?.General?.platformName || "Gech"}
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm tracking-wide text-white/55">
              {t("footerDesc")}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.15em]" style={{ color: '#4CBFBF' }}>{t("quickLinks")}</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-xs tracking-wide transition-colors text-white/55 hover:text-[#4CBFBF]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.15em]" style={{ color: '#4CBFBF' }}>{t("account")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("logIn"), href: "/auth/login" },
                { label: t("register"), href: "/auth/register" },
                { label: t("dashboard"), href: "/dashboard" },
                { label: t("myProfile"), href: "/profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-xs tracking-wide transition-colors text-white/55 hover:text-[#4CBFBF]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[10px] uppercase tracking-[0.15em]" style={{ color: '#4CBFBF' }}>{t("contactFooter")}</h4>
            <ul className="space-y-4 text-xs tracking-wide text-white/55">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} style={{ color: '#4CBFBF' }} />
                <span>{t("addressValue")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: '#4CBFBF' }} />
                <span>{settings?.General?.contactPhone || "+251911701849"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: '#4CBFBF' }} />
                <span>{settings?.General?.contactEmail || "info@gech.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-white/35" style={{ borderTop: '1px solid rgba(76,191,191,0.12)' }}>
          © {new Date().getFullYear()} {settings?.General?.platformName || "Gech"}. {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}
