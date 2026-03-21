import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Car, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Cars for Sale", href: "/cars/sale" },
  { label: "Cars for Rent", href: "/cars/rent" },
  { label: "Lottery", href: "/lottery" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome ? "bg-transparent" : "bg-primary shadow-lg"}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <Car className="h-7 w-7" />
          <span className="text-xl font-bold font-display tracking-tight">DriveHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth/login">
            <Button variant="hero-outline" size="sm">Log In</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="hero" size="sm">Sign Up</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/95 backdrop-blur-md border-t border-primary-foreground/10 animate-fade-in-up">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-primary-foreground/80 hover:text-primary-foreground py-2 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-primary-foreground/10">
              <Link to="/auth/login" className="flex-1">
                <Button variant="hero-outline" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link to="/auth/register" className="flex-1">
                <Button variant="hero" size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
