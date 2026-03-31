import { PageShell } from "@/components/PageShell";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function NotAuthorized() {
  const { user } = useAuth();
  const dashboardPath = user?.role === "admin" || user?.role === "lottery_staff" ? "/admin" : "/dashboard";

  return (
    <PageShell>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-card rounded-2xl shadow-lg p-12 max-w-lg w-full animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 font-display">Not Authorized</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            You don't have permission to access this page. If you believe this is an error, please contact the platform administrator.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to={dashboardPath}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
