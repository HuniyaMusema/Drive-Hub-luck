import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface PageShellProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

export function PageShell({ children, withPadding = true }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-1 ${withPadding ? "pt-24 pb-16" : ""}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
