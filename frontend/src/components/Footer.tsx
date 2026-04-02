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
    <footer className="text-white border-t" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2137 60%, #0a2820 100%)', borderColor: 'rgba(61,240,162,0.10)' }}>
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <Car className="h-8 w-8 text-[#3df0a2] group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-black font-display tracking-tight uppercase">
                {settings?.General?.platformName || "Drive Hub"}
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm font-medium" style={{ color: 'rgba(185,215,205,0.65)' }}>
              {t("footerDesc")}
            </p>
          </div>

          <div>
            <h4 className="font-black mb-6 text-[10px] uppercase tracking-widest text-[#3df0a2]">{t("quickLinks")}</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm font-medium transition-colors hover:text-[#3df0a2]" style={{ color: 'rgba(185,215,205,0.60)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 text-[10px] uppercase tracking-widest text-[#3df0a2]">{t("account")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("logIn"), href: "/auth/login" },
                { label: t("register"), href: "/auth/register" },
                { label: t("dashboard"), href: "/dashboard" },
                { label: t("myProfile"), href: "/profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm font-medium transition-colors hover:text-[#3df0a2]" style={{ color: 'rgba(185,215,205,0.60)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-6 text-[10px] uppercase tracking-widest text-[#3df0a2]">{t("contactFooter")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-medium" style={{ color: 'rgba(185,215,205,0.60)' }}>
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#3df0a2]" />
                <span>{t("addressValue")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'rgba(185,215,205,0.60)' }}>
                <Phone className="h-4 w-4 shrink-0 text-[#3df0a2]" />
                <span>+251 911 234 567</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-medium" style={{ color: 'rgba(185,215,205,0.60)' }}>
                <Mail className="h-4 w-4 shrink-0 text-[#3df0a2]" />
                <span>{settings?.General?.contactEmail || "info@gech.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center text-[10px] font-black uppercase tracking-widest" style={{ borderColor: 'rgba(61,240,162,0.08)', color: 'rgba(150,185,175,0.40)' }}>
          © {new Date().getFullYear()} {settings?.General?.platformName || "Drive Hub"}. {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}
