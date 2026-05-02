import { useEffect, useState } from "react";
import { appointmentAPI } from "../lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar } from "lucide-react";

const ClientAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll(); // or { status: "confirmed" }
      const data = res?.data;

      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : data
              ? [data]
              : [];

      setAppointments(rows);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6" data-testid="client-appointments">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Appointments</h2>
          <p className="text-slate-500 text-sm">View your scheduled sessions</p>
        </div>
        <Button variant="outline" onClick={fetchAppointments}>
          Refresh
        </Button>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            My Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No appointments found</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.appointment_id || `${apt.scheduled_date}-${apt.scheduled_time}-${apt.service_id}`}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className="w-20 text-center">
                    <div className="font-bold">{apt.scheduled_time || "-"}</div>
                    <div className="text-xs text-slate-500">{apt.scheduled_date || "-"}</div>
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {apt.service_name || apt.service_id || "Session"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {apt.duration_minutes ? `${apt.duration_minutes} mins` : ""}
                    </div>
                  </div>

                  <Badge
                    className={
                      apt.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : apt.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {apt.status || "pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAppointments;
