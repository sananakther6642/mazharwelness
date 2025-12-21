import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  guestAPI, appointmentAPI, clientAPI, staffAPI, invoiceAPI, dashboardAPI 
} from '../lib/api';
import api from '../lib/api';
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, UserPlus, 
  CreditCard, FileText, MessageSquare, LogOut, Menu, X,
  Plus, Eye, Search, Phone, Clock, CheckCircle, XCircle,
  DollarSign, Bell, ChevronRight, Printer, Send
} from 'lucide-react';

const ReceptionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'reception' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/reception' },
    { icon: CalendarIcon, label: 'Appointments', path: '/reception/appointments' },
    { icon: UserPlus, label: 'Guest Bookings', path: '/reception/guest-bookings' },
    { icon: Users, label: 'Clients', path: '/reception/clients' },
    { icon: CreditCard, label: 'Billing', path: '/reception/billing' },
    { icon: FileText, label: 'Attendance', path: '/reception/attendance' },
    { icon: MessageSquare, label: 'Communications', path: '/reception/communications' },
  ];

  const isActive = (path) => {
    if (path === '/reception') return location.pathname === '/reception';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="reception-dashboard">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-blue-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-white font-heading font-bold">Reception</span>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.path) ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-blue-200 hover:bg-red-500/20 rounded-xl">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-heading font-bold text-xl text-slate-900">
                {menuItems.find(m => isActive(m.path))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5 text-slate-600" />
                {stats.pending_bookings > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pending_bookings}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Reception</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<ReceptionOverview stats={stats} />} />
            <Route path="/appointments" element={<ReceptionAppointments />} />
            <Route path="/guest-bookings" element={<ReceptionGuestBookings />} />
            <Route path="/clients" element={<ReceptionClients />} />
            <Route path="/billing" element={<ReceptionBilling />} />
            <Route path="/attendance" element={<ReceptionAttendance />} />
            <Route path="/communications" element={<ReceptionCommunications />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ============ RECEPTION OVERVIEW ============
const ReceptionOverview = ({ stats }) => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [aptsRes, bookingsRes] = await Promise.all([
        appointmentAPI.getAll({ date: today }),
        guestAPI.getBookings('pending')
      ]);
      setTodayAppointments(aptsRes.data.slice(0, 5));
      setPendingBookings(bookingsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-8" data-testid="reception-overview">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Appointments', value: stats.today_appointments || 0, icon: CalendarIcon, color: 'bg-blue-500' },
          { label: 'Pending Bookings', value: stats.pending_bookings || 0, icon: UserPlus, color: 'bg-orange-500' },
          { label: 'Total Clients', value: stats.total_clients || 0, icon: Users, color: 'bg-green-500' },
          { label: 'Active Memberships', value: stats.active_memberships || 0, icon: CreditCard, color: 'bg-purple-500' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today's Appointments</CardTitle>
            <Link to="/reception/appointments" className="text-[#2A9D8F] text-sm font-medium">View All</Link>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No appointments today</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt.appointment_id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-12 text-center">
                      <p className="font-bold text-slate-900">{apt.scheduled_time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{apt.client_name}</p>
                      <p className="text-sm text-slate-500">{apt.service_name}</p>
                    </div>
                    <Badge className={apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Guest Bookings</CardTitle>
            <Link to="/reception/guest-bookings" className="text-[#2A9D8F] text-sm font-medium">View All</Link>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pending bookings</p>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center gap-4 p-3 bg-orange-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{booking.full_name}</p>
                      <p className="text-sm text-slate-500">{booking.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.preferred_date}</p>
                      <p className="text-xs text-slate-500">{booking.preferred_time}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'New Appointment', icon: Plus, path: '/reception/appointments', color: 'bg-blue-100 text-blue-600' },
          { label: 'Register Client', icon: UserPlus, path: '/reception/clients', color: 'bg-green-100 text-green-600' },
          { label: 'Create Invoice', icon: CreditCard, path: '/reception/billing', color: 'bg-purple-100 text-purple-600' },
          { label: 'Check Attendance', icon: CheckCircle, path: '/reception/attendance', color: 'bg-orange-100 text-orange-600' },
        ].map((action) => (
          <Link key={action.label} to={action.path}>
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-900">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============ RECEPTION APPOINTMENTS ============
const ReceptionAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [newApt, setNewApt] = useState({
    client_id: '', service_id: '', staff_id: '', 
    scheduled_date: '', scheduled_time: '', duration_minutes: 60
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [aptsRes, clientsRes, staffRes, servicesRes] = await Promise.all([
        appointmentAPI.getAll({ date: dateStr }),
        clientAPI.getAll(),
        staffAPI.getAvailable(),
        api.get('/services')
      ]);
      setAppointments(aptsRes.data);
      setClients(clientsRes.data);
      setStaff(staffRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!newApt.client_id || !newApt.service_id || !newApt.staff_id || !newApt.scheduled_date || !newApt.scheduled_time) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await appointmentAPI.create(newApt);
      toast.success('Appointment created');
      setShowNewDialog(false);
      setNewApt({ client_id: '', service_id: '', staff_id: '', scheduled_date: '', scheduled_time: '', duration_minutes: 60 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const timeSlots = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  return (
    <div className="space-y-6" data-testid="reception-appointments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Appointment Calendar</h2>
          <p className="text-slate-500 text-sm">Manage daily appointments</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select value={newApt.client_id} onValueChange={(v) => setNewApt({...newApt, client_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service *</Label>
                  <Select value={newApt.service_id} onValueChange={(v) => setNewApt({...newApt, service_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.service_id} value={s.service_id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Staff *</Label>
                  <Select value={newApt.staff_id} onValueChange={(v) => setNewApt({...newApt, staff_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.user_id} value={s.user_id}>{s.name} ({s.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input 
                      type="date"
                      value={newApt.scheduled_date}
                      onChange={(e) => setNewApt({...newApt, scheduled_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Select value={newApt.scheduled_time} onValueChange={(v) => setNewApt({...newApt, scheduled_time: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateAppointment} className="bg-[#2A9D8F]">Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Appointment List */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No appointments for {format(selectedDate, 'PPP')}
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.appointment_id}>
                    <TableCell className="font-medium">{apt.scheduled_time}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{apt.client_name}</p>
                        <p className="text-xs text-slate-500">{apt.client_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{apt.service_name}</TableCell>
                    <TableCell>{apt.staff_name}</TableCell>
                    <TableCell>
                      <Select value={apt.status} onValueChange={(v) => handleUpdateStatus(apt.appointment_id, v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ============ RECEPTION GUEST BOOKINGS ============
const ReceptionGuestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [conversionData, setConversionData] = useState({
    email: '', password: '', client_type: 'parent', child_name: '', child_age: '', age: ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await guestAPI.getBookings(status);
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await guestAPI.updateBooking(bookingId, status);
      toast.success('Status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleConvert = async () => {
    if (!conversionData.email) {
      toast.error('Email is required');
      return;
    }
    try {
      await api.post(`/guest/bookings/${selectedBooking.booking_id}/convert`, conversionData);
      toast.success('Client created successfully!');
      setShowConvertDialog(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Conversion failed');
    }
  };

  const openConvertDialog = (booking) => {
    setSelectedBooking(booking);
    setConversionData({
      ...conversionData,
      email: '',
      client_type: booking.service_category === 'paediatric_physio' ? 'parent' : 'woman'
    });
    setShowConvertDialog(true);
  };

  return (
    <div className="space-y-6" data-testid="reception-guest-bookings">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Guest Bookings</h2>
          <p className="text-slate-500 text-sm">Manage leads and convert to clients</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No bookings found</TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell className="font-medium">{booking.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {booking.phone}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{booking.service_category?.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.preferred_date}</p>
                        <p className="text-xs text-slate-500">{booking.preferred_time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'converted' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100'
                      }>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(booking.booking_id, 'contacted')}>
                            Mark Contacted
                          </Button>
                        )}
                        {booking.status !== 'converted' && (
                          <Button size="sm" className="bg-[#2A9D8F]" onClick={() => openConvertDialog(booking)}>
                            Convert
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Convert Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Client</DialogTitle>
            <DialogDescription>Create a client account for {selectedBooking?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email"
                value={conversionData.email}
                onChange={(e) => setConversionData({...conversionData, email: e.target.value})}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input 
                type="password"
                value={conversionData.password}
                onChange={(e) => setConversionData({...conversionData, password: e.target.value})}
                placeholder="Leave empty for OTP login"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Type</Label>
              <Select value={conversionData.client_type} onValueChange={(v) => setConversionData({...conversionData, client_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent (Paediatric)</SelectItem>
                  <SelectItem value="woman">Woman (Wellness)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {conversionData.client_type === 'parent' && (
              <>
                <div className="space-y-2">
                  <Label>Child's Name</Label>
                  <Input 
                    value={conversionData.child_name}
                    onChange={(e) => setConversionData({...conversionData, child_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Child's Age</Label>
                  <Input 
                    type="number"
                    value={conversionData.child_age}
                    onChange={(e) => setConversionData({...conversionData, child_age: e.target.value})}
                  />
                </div>
              </>
            )}
            {conversionData.client_type === 'woman' && (
              <div className="space-y-2">
                <Label>Age</Label>
                <Input 
                  type="number"
                  value={conversionData.age}
                  onChange={(e) => setConversionData({...conversionData, age: e.target.value})}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertDialog(false)}>Cancel</Button>
            <Button onClick={handleConvert} className="bg-[#2A9D8F]">Create Client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ RECEPTION CLIENTS ============
const ReceptionClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (searchTerm = '') => {
    try {
      const response = await clientAPI.getAll(searchTerm);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="reception-clients">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Clients</h2>
          <p className="text-slate-500 text-sm">View and manage clients</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={() => fetchClients(search)}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No clients found</TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.user_id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{client.email}</p>
                        <p className="text-xs text-slate-500">{client.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {client.profile?.client_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <CalendarIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ============ RECEPTION BILLING ============
const ReceptionBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, clientsRes, servicesRes] = await Promise.all([
        invoiceAPI.getAll({}),
        clientAPI.getAll(),
        api.get('/services')
      ]);
      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...newInvoice.items];
    items[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      items[index].total = items[index].quantity * items[index].unit_price;
    }
    setNewInvoice({ ...newInvoice, items });
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.client_id || newInvoice.items.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const response = await invoiceAPI.create(newInvoice);
      toast.success(`Invoice created: ${response.data.invoice_number}`);
      setShowNewDialog(false);
      setNewInvoice({ client_id: '', items: [{ description: '', quantity: 1, unit_price: 0, total: 0 }] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    }
  };

  const handleCollectPayment = async (invoice) => {
    try {
      // Create payment order
      const orderRes = await api.post('/payments/create-order', {
        invoice_id: invoice.invoice_id,
        amount: invoice.total,
        mock_mode: true
      });
      
      // Complete mock payment
      await api.post(`/payments/mock-complete/${orderRes.data.payment_id}`);
      toast.success('Payment collected successfully');
      fetchData();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  return (
    <div className="space-y-6" data-testid="reception-billing">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Billing & Invoices</h2>
          <p className="text-slate-500 text-sm">Generate invoices and collect payments</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={newInvoice.client_id} onValueChange={(v) => setNewInvoice({...newInvoice, client_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                {newInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input 
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="col-span-2"
                    />
                    <Input 
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    />
                    <Input 
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{newInvoice.items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-500">+ 18% GST will be applied</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateInvoice} className="bg-[#2A9D8F]">Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No invoices found</TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.invoice_id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{inv.client_name}</TableCell>
                    <TableCell>₹{inv.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={inv.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{inv.created_at?.split('T')[0]}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {inv.status === 'pending' && (
                          <Button size="sm" className="bg-green-600" onClick={() => handleCollectPayment(inv)}>
                            <DollarSign className="w-4 h-4 mr-1" />
                            Collect
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// ============ RECEPTION ATTENDANCE ============
const ReceptionAttendance = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentAPI.getAll({ date: today, status: 'confirmed' });
      setTodayAppointments(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointment) => {
    try {
      await api.post('/attendance/check-in', {
        client_id: appointment.client_id,
        appointment_id: appointment.appointment_id
      });
      toast.success(`${appointment.client_name} checked in`);
      fetchTodayAppointments();
    } catch (error) {
      toast.error('Check-in failed');
    }
  };

  return (
    <div className="space-y-6" data-testid="reception-attendance">
      <div>
        <h2 className="font-heading font-bold text-xl">Attendance</h2>
        <p className="text-slate-500 text-sm">Check in clients for today's appointments</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : todayAppointments.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No confirmed appointments for today</p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div key={apt.appointment_id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 text-center">
                    <p className="font-bold text-lg">{apt.scheduled_time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{apt.client_name}</p>
                    <p className="text-sm text-slate-500">{apt.service_name} with {apt.staff_name}</p>
                  </div>
                  <Button onClick={() => handleCheckIn(apt)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============ RECEPTION COMMUNICATIONS ============
const ReceptionCommunications = () => {
  return (
    <div className="space-y-6" data-testid="reception-communications">
      <div>
        <h2 className="font-heading font-bold text-xl">Communications</h2>
        <p className="text-slate-500 text-sm">Send messages and reminders</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Send Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-[#2A9D8F]">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Tomorrow's Reminders
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Send Payment Reminders
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Send Renewal Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
