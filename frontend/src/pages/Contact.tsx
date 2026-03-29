import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, MessageCircle, MapPin, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

export default function Contact() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
              {t("contactTagline")}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              {t("contactTitle")}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t("contactDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact cards */}
            <div className="space-y-4">
              {/* Phone */}
              <a
                href={`tel:${(settings?.General?.contactPhone || "+251911234567").replace(/\s/g, "")}`}
                className="flex items-start gap-4 bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{t("phoneLabel")}</h3>
                  <p className="text-primary font-medium">{settings?.General?.contactPhone || "+251 911 234 567"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("phoneTap")}</p>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/gech49"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{t("telegramLabel")}</h3>
                  <p className="text-accent font-medium">@gech49</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("telegramTap")}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${settings?.General?.contactEmail || "info@gech.com"}`}
                className="flex items-start gap-4 bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{t("emailLabel")}</h3>
                  <p className="text-primary font-medium">{settings?.General?.contactEmail || "info@gech.com"}</p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-4 bg-card rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{t("addressLabel")}</h3>
                  <p className="text-sm text-muted-foreground">{settings?.General?.contactAddress || t("addressValue")}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 bg-card rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">{t("hoursLabel")}</h3>
                  <p className="text-sm text-muted-foreground">{t("hoursValue")}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-sm bg-card h-[480px] lg:h-auto min-h-[400px]">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3941.148077914366!2d38.7046111!3d8.958499999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwNTcnMzAuNiJOIDM4wrA0MicxNi42IkU!5e0!3m2!1sam!2set!4v1774456777329!5m2!1sam!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
