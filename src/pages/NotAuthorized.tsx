import { AdminLayout } from "@/components/AdminLayout";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotAuthorized() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldX className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Not Authorized</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access this page. Contact an administrator if you believe this is an error.
        </p>
        <Button asChild>
          <Link to="/admin">Back to Dashboard</Link>
        </Button>
      </div>
    </AdminLayout>
  );
}
