import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Activity } from "lucide-react";

const ClientProgress = () => {
  return (
    <div className="space-y-6" data-testid="client-progress">
      <div>
        <h2 className="font-heading font-bold text-xl">Progress</h2>
        <p className="text-slate-500 text-sm">Track your progress over time</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">
            Add charts, weight logs, pain score, ROM metrics, etc.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProgress;
