import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";

const payments = [
  { id: "PAY-2901", user: "Sarah Chen", amount: "$75.00", ref: "TXN-881234", date: "Mar 17", status: "approved" },
  { id: "PAY-2902", user: "James Okafor", amount: "$50.00", ref: "TXN-881290", date: "Mar 18", status: "pending" },
  { id: "PAY-2903", user: "Marcus Rivera", amount: "$25.00", ref: "TXN-881301", date: "Mar 18", status: "pending" },
  { id: "PAY-2904", user: "Lucia Gomez", amount: "$100.00", ref: "TXN-881315", date: "Mar 19", status: "rejected" },
];

const statusStyles: Record<string, string> = {
  approved: "bg-primary/10 text-primary",
  pending: "bg-amber-50 text-amber-600",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminPayments() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Payment Management</h1>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Reference</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium tabular-nums">{p.id}</td>
                  <td className="px-4 py-3">{p.user}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{p.amount}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.ref}</td>
                  <td className="px-4 py-3 tabular-nums">{p.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                      {p.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Check className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
