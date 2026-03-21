import { Link } from "react-router-dom";
import { Car, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Car className="h-7 w-7" />
              <span className="text-xl font-bold font-display">DriveHub</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Your trusted partner for car sales, rentals, and exciting lottery draws. Premium vehicles, transparent pricing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Cars for Sale", href: "/cars/sale" },
                { label: "Cars for Rent", href: "/cars/rent" },
                { label: "Lottery", href: "/lottery" },
                { label: "About Us", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Log In", href: "/auth/login" },
                { label: "Register", href: "/auth/register" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "My Profile", href: "/profile" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/50">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>123 Auto Boulevard, Motor City</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>hello@drivehub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} DriveHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
