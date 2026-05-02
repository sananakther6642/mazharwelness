import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText } from "lucide-react";

const ClientDocuments = () => {
  return (
    <div className="space-y-6" data-testid="client-documents">
      <div>
        <h2 className="font-heading font-bold text-xl">Documents</h2>
        <p className="text-slate-500 text-sm">Reports, prescriptions, attachments</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">
            List client documents here and allow downloads.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocuments;
