import { Link } from "react-router-dom";
import { Car, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Car className="h-7 w-7" />
              <span className="text-xl font-bold font-display">Gech ጌች</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              {t("footerDesc")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">{t("quickLinks")}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t("carsForSale"), href: "/cars/sale" },
                { label: t("carsForRent"), href: "/cars/rent" },
                { label: t("lottery"), href: "/lottery" },
                { label: t("contact"), href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">{t("account")}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t("logIn"), href: "/auth/login" },
                { label: t("register"), href: "/auth/register" },
                { label: t("dashboard"), href: "/dashboard" },
                { label: t("myProfile"), href: "/profile" },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">{t("contactFooter")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t("addressValue")}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+251 911 234 567</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@gech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} Gech ጌች. {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}
