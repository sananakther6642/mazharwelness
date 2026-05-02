import { useEffect, useState } from "react";
import { clientAPI } from "../lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Settings } from "lucide-react";
import { Button } from "../components/ui/button";

const ClientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await clientAPI.getProfile();
      setProfile(res?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6" data-testid="client-profile">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Profile</h2>
          <p className="text-slate-500 text-sm">Your account and wellness details</p>
        </div>
        <Button variant="outline" onClick={fetchProfile}>Refresh</Button>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading...</div>
          ) : !profile ? (
            <div className="py-10 text-center text-slate-500">No profile found</div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <Badge className="rounded-full bg-[#E0F2F1] text-[#2A9D8F]">
                  {profile.client_type === "parent" ? "Paediatric" : "Women's Wellness"}
                </Badge>
              </div>

              {profile.child_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Child</span>
                  <span className="font-medium text-slate-900">{profile.child_name}</span>
                </div>
              )}

              {profile.goal && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Goal</span>
                  <span className="font-medium text-slate-900">{profile.goal}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;
