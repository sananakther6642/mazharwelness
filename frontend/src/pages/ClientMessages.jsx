import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MessageCircle } from "lucide-react";

const ClientMessages = () => {
  return (
    <div className="space-y-6" data-testid="client-messages">
      <div>
        <h2 className="font-heading font-bold text-xl">Messages</h2>
        <p className="text-slate-500 text-sm">Chat with your therapist/team</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-600">
            Connect your chat UI here (threads, messages, unread).
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMessages;
