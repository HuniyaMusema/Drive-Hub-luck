import { Link } from "react-router-dom";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Ticket, Shield, Star, ArrowRight, Trophy, DollarSign, Hash } from "lucide-react";

export default function Lottery() {
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: detailsRef, isVisible: detailsVisible } = useScrollReveal();

  return (
    <PageShell>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">DriveHub Lottery</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
            Pick a Number, Win a Ride
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Our car lottery is your chance to drive home in a premium vehicle. Select your lucky numbers, confirm your ticket, and wait for the draw.
          </p>
        </div>

        {/* Prize card */}
        <div
          ref={detailsRef}
          className={`max-w-3xl mx-auto mb-16 bg-primary rounded-2xl overflow-hidden shadow-lg transition-all duration-700 ${detailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="p-8 lg:p-12 text-primary-foreground">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-accent font-semibold text-sm uppercase tracking-widest">Current Draw</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">Grand Prize: 2025 Apex GT Coupe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Ticket Price</p>
                  <p className="font-bold text-lg tabular-nums">$25.00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Hash className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Number Range</p>
                  <p className="font-bold text-lg tabular-nums">1 – 100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Ticket className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Tickets Left</p>
                  <p className="font-bold text-lg tabular-nums">73 / 100</p>
                </div>
              </div>
            </div>
            <Link to="/lottery/select" className="mt-8 inline-block">
              <Button variant="hero" size="xl">
                Select Your Numbers <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="max-w-3xl mx-auto">
          <h2 className={`text-2xl font-bold text-foreground text-center mb-10 transition-all duration-700 ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            How It Works
          </h2>
          <div className="space-y-6">
            {[
              { icon: Ticket, title: "Choose Your Numbers", desc: "Browse the number grid and pick any available number. Each number can only be claimed once." },
              { icon: Shield, title: "Submit Payment", desc: "Upload your payment receipt with a reference number. An admin will verify your payment." },
              { icon: Star, title: "Wait for the Draw", desc: "Once all tickets are sold or the deadline passes, we draw the winning number live." },
            ].map((step, i) => (
              <div
                key={step.title}
                className={`flex items-start gap-5 bg-card rounded-xl p-6 shadow-sm transition-all duration-700 ${stepsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
                style={{ transitionDelay: `${(i + 1) * 120}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Step {i + 1}</div>
                  <h3 className="font-semibold text-card-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="max-w-3xl mx-auto mt-16 bg-surface-warm rounded-2xl p-8">
          <h3 className="font-bold text-foreground mb-4">Lottery Rules</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Each participant may purchase up to 5 tickets per draw.</li>
            <li>• Numbers are reserved upon payment approval — not upon selection.</li>
            <li>• The draw date is announced once all tickets are sold or the deadline arrives.</li>
            <li>• Winners must claim their prize within 30 days of the draw.</li>
            <li>• All decisions by DriveHub administration are final.</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
