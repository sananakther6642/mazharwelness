import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText } from "lucide-react";

const ClientPlans = () => {
  return (
    <div className="space-y-6" data-testid="client-plans">
      <div>
        <h2 className="font-heading font-bold text-xl">Diet & Workout</h2>
        <p className="text-slate-500 text-sm">Your assigned plans</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">
            Show diet plan + workout plan assigned by trainer/nutritionist.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPlans;
