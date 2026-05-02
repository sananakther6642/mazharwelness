import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CreditCard } from "lucide-react";

const ClientPayments = () => {
  return (
    <div className="space-y-6" data-testid="client-payments">
      <div>
        <h2 className="font-heading font-bold text-xl">Payments</h2>
        <p className="text-slate-500 text-sm">Manage your invoices and payments</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">
            Payments page is ready. Connect your payments API here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPayments;
