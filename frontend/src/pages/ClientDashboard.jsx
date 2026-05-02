import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { dashboardAPI, appointmentAPI, clientAPI } from '../lib/api';
import { toast } from 'sonner';
import { 
  Calendar, Clock, User, CreditCard, Activity, FileText,
  MessageCircle, Settings, LogOut, Bell, ChevronRight,
  Menu, X, Home
} from 'lucide-react';


import ClientAppointments from "./ClientAppointments";
import ClientPayments from "./ClientPayments";
import ClientProgress from "./ClientProgress";
import ClientPlans from "./ClientPlans";
import ClientMessages from "./ClientMessages";
import ClientDocuments from "./ClientDocuments";
import ClientProfile from "./ClientProfile";


const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
const isActive = (href) =>
  href === "/dashboard"
    ? location.pathname === "/dashboard"
    : location.pathname.startsWith(href);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, appointmentsRes, profileRes] = await Promise.all([
        dashboardAPI.getStats(),
        appointmentAPI.getAll({ status: 'confirmed' }),
        clientAPI.getProfile(),
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data.slice(0, 5));
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },

    { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
    { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
    { icon: Activity, label: 'Progress', href: '/dashboard/progress' },
    { icon: FileText, label: 'Diet & Workout', href: '/dashboard/plans' },
    { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
    { icon: Settings, label: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="client-dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-[#2A9D8F] font-heading font-bold">Mazhar</span>
              <span className="text-slate-600 font-heading font-semibold ml-1">Wellness</span>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.href)

                      ? 'bg-[#E0F2F1] text-[#2A9D8F]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-testid={`menu-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
            data-testid="sidebar-logout-btn"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-heading font-bold text-xl text-slate-900">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-slate-100" data-testid="notifications-btn">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2A9D8F] flex items-center justify-center">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Client</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
     <main className="p-4 lg:p-8">
  <Routes>
    {/* Dashboard home */}
    <Route
      index
      element={
        <ClientDashboardHome
          user={user}
          stats={stats}
          appointments={appointments}
          profile={profile}
          loading={loading}
        />
      }
    />

    {/* Pages inside dashboard */}
    <Route
  index
  element={
    <ClientDashboardHome
      user={user}
      stats={stats}
      appointments={appointments}
      profile={profile}
      loading={loading}
    />
  }
/>
    <Route path="appointments" element={<ClientAppointments />} />
    <Route path="payments" element={<ClientPayments />} />
    <Route path="progress" element={<ClientProgress />} />
    <Route path="plans" element={<ClientPlans />} />
    <Route path="messages" element={<ClientMessages />} />
    <Route path="documents" element={<ClientDocuments />} />
    <Route path="profile" element={<ClientProfile />} />
  </Routes>
</main>


      </div>
    </div>
  );
};

const ClientDashboardHome = ({
  user,
  stats,
  appointments,
  profile,
  loading,
}) => {
  return (
    <>
      {/* Welcome Banner */}
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-[#2A9D8F] to-[#21867a] text-white mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-2xl mb-2">
                Welcome back, {user?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-white/80">
                Track your progress, manage appointments, and stay on top of your wellness journey.
              </p>
            </div>
            <Link to="/book">
              <Button className="bg-white text-[#2A9D8F] hover:bg-slate-100 rounded-full font-bold">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-slate-900">
                  {stats.upcoming_appointments || 0}
                </p>
                <p className="text-sm text-slate-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-slate-900">
                  {stats.active_plans || 0}
                </p>
                <p className="text-sm text-slate-500">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-slate-900">
                  {stats.sessions_remaining || 0}
                </p>
                <p className="text-sm text-slate-500">Sessions Left</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-slate-900">
                  {stats.unread_messages || 0}
                </p>
                <p className="text-sm text-slate-500">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keep the rest of your dashboard home UI here (appointments preview, quick actions, profile summary) */}
      {/* You can paste your existing “Main Grid” here unchanged */}
    </>
  );
};

export default ClientDashboard;
