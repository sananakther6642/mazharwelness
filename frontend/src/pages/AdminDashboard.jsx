import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { 
  staffAPI, serviceAPI, packageAPI, clientAPI, guestAPI, 
  dashboardAPI, appointmentAPI, invoiceAPI, contentAPI 
} from '../lib/api';
import api from '../lib/api';
import { 
  LayoutDashboard, Users, UserCog, Calendar, Package, 
  CreditCard, FileText, Settings, LogOut, Menu, X,
  Plus, Edit, Trash2, Eye, Search, Filter, Download,
  TrendingUp, DollarSign, UserPlus, Bell, ChevronRight,
  Building, Image, MessageSquare, HelpCircle, BarChart3,
  Shield, Activity, Dumbbell, AlertTriangle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
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
      console.error('Error fetching stats:', error);
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Clients', path: '/admin/clients' },
    { icon: UserCog, label: 'Staff', path: '/admin/staff' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: UserPlus, label: 'Guest Bookings', path: '/admin/guest-bookings' },
    { icon: Package, label: 'Services', path: '/admin/services' },
    { icon: CreditCard, label: 'Packages', path: '/admin/packages' },
    { icon: FileText, label: 'Billing', path: '/admin/billing' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Dumbbell, label: 'Exercises', path: '/admin/exercises' },
    { icon: Image, label: 'Content', path: '/admin/content' },
    { icon: Shield, label: 'Audit Logs', path: '/admin/audit-logs' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="admin-dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-white font-heading font-bold">Admin</span>
              <span className="text-slate-400 font-heading text-sm ml-1">Panel</span>
            </div>
          </Link>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100vh-180px)]">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#2A9D8F] text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  data-testid={`admin-menu-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            data-testid="admin-logout-btn"
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
              <h1 className="font-heading font-bold text-xl text-slate-900">
                {menuItems.find(m => isActive(m.path))?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-slate-100" data-testid="admin-notifications">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<AdminOverview stats={stats} loading={loading} />} />
            <Route path="/clients" element={<AdminClients />} />
            <Route path="/staff" element={<AdminStaff />} />
            <Route path="/appointments" element={<AdminAppointments />} />
            <Route path="/guest-bookings" element={<AdminGuestBookings />} />
            <Route path="/services" element={<AdminServices />} />
            <Route path="/packages" element={<AdminPackages />} />
            <Route path="/billing" element={<AdminBilling />} />
            <Route path="/exercises" element={<AdminExercises />} />
            <Route path="/content" element={<AdminContent />} />
            <Route path="/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/reports" element={<AdminReports stats={stats} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ============ ADMIN OVERVIEW ============
const AdminOverview = ({ stats, loading }) => {
  const statCards = [
    { label: 'Total Clients', value: stats.total_clients || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Bookings', value: stats.pending_bookings || 0, icon: Calendar, color: 'bg-orange-500' },
    { label: 'Today\'s Appointments', value: stats.today_appointments || 0, icon: Activity, color: 'bg-green-500' },
    { label: 'Active Memberships', value: stats.active_memberships || 0, icon: Package, color: 'bg-purple-500' },
    { label: 'Monthly Revenue', value: `₹${(stats.monthly_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-teal-500' },
    { label: 'Pending Payments', value: `₹${(stats.pending_payments || 0).toLocaleString()}`, icon: CreditCard, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8" data-testid="admin-overview">
      {/* Welcome Banner */}
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-2xl mb-2">Welcome to Admin Panel</h2>
          <p className="text-slate-300">Manage your clinic operations, staff, and content from here.</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={stat.label} className="rounded-2xl border-0 shadow-sm" data-testid={`stat-${index}`}>
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Add Staff', icon: UserPlus, path: '/admin/staff', color: 'bg-blue-100 text-blue-600' },
          { label: 'New Service', icon: Plus, path: '/admin/services', color: 'bg-green-100 text-green-600' },
          { label: 'View Bookings', icon: Calendar, path: '/admin/guest-bookings', color: 'bg-orange-100 text-orange-600' },
          { label: 'Settings', icon: Settings, path: '/admin/settings', color: 'bg-purple-100 text-purple-600' },
        ].map((action) => (
          <Link key={action.label} to={action.path}>
            <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-900">{action.label}</span>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============ ADMIN CLIENTS ============
const AdminClients = () => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  return (
    <div className="space-y-6" data-testid="admin-clients">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">All Clients</h2>
          <p className="text-slate-500 text-sm">Manage registered clients</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="Search clients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No clients found</TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.user_id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {client.profile?.client_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={client.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {client.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
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

// ============ ADMIN STAFF ============
const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '', email: '', phone: '', password: '', role: 'physiotherapist'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await staffAPI.create(newStaff);
      toast.success('Staff member added');
      setShowAddDialog(false);
      setNewStaff({ name: '', email: '', phone: '', password: '', role: 'physiotherapist' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add staff');
    }
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    reception: 'bg-blue-100 text-blue-700',
    physiotherapist: 'bg-green-100 text-green-700',
    trainer: 'bg-orange-100 text-orange-700',
    nutritionist: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6" data-testid="admin-staff">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Staff Management</h2>
          <p className="text-slate-500 text-sm">Manage clinic staff and roles</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Create a new staff account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  placeholder="+91 99999 99999"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={newStaff.role} onValueChange={(v) => setNewStaff({...newStaff, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reception">Reception</SelectItem>
                    <SelectItem value="physiotherapist">Physiotherapist</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="nutritionist">Nutritionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input 
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  placeholder="Temporary password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddStaff} className="bg-[#2A9D8F]">Add Staff</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No staff found</TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role] || 'bg-slate-100'}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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

// ============ ADMIN SERVICES ============
const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '', description: '', category: 'paediatric_physio', duration_minutes: 60, price: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAll();
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await serviceAPI.create(newService);
      toast.success('Service added');
      setShowAddDialog(false);
      setNewService({ name: '', description: '', category: 'paediatric_physio', duration_minutes: 60, price: 0 });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add service');
    }
  };

  const categoryLabels = {
    paediatric_physio: 'Paediatric Physio',
    weight_management: 'Weight Management',
    pcod: 'PCOD',
    zumba_aerobics_yoga: 'Zumba/Aerobics/Yoga',
    pain_management: 'Pain Management',
  };

  return (
    <div className="space-y-6" data-testid="admin-services">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Services</h2>
          <p className="text-slate-500 text-sm">Manage clinic services and pricing</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>Create a new service offering</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service Name *</Label>
                <Input 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="e.g., Paediatric Assessment"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Service description"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={newService.category} 
                  onValueChange={(v) => setNewService({...newService, category: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paediatric_physio">Paediatric Physiotherapy</SelectItem>
                    <SelectItem value="weight_management">Weight Management</SelectItem>
                    <SelectItem value="pcod">PCOD Program</SelectItem>
                    <SelectItem value="zumba_aerobics_yoga">Zumba/Aerobics/Yoga</SelectItem>
                    <SelectItem value="pain_management">Pain Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (mins) *</Label>
                  <Input 
                    type="number"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({...newService, duration_minutes: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input 
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddService} className="bg-[#2A9D8F]">Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          services.map((service) => (
            <Card key={service.service_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {categoryLabels[service.category] || service.category}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-slate-500 text-sm">{service.duration_minutes} mins</span>
                  <span className="font-bold text-[#2A9D8F]">₹{service.price}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ ADMIN PACKAGES ============
const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-packages">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Packages</h2>
          <p className="text-slate-500 text-sm">Manage membership packages</p>
        </div>
        <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              </CardContent>
            </Card>
          ))
        ) : packages.length === 0 ? (
          <Card className="col-span-full rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No packages found. Create your first package.</p>
            </CardContent>
          </Card>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.package_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-2">{pkg.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{pkg.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sessions</span>
                    <span className="font-medium">{pkg.sessions_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validity</span>
                    <span className="font-medium">{pkg.validity_days} days</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-500">Price</span>
                    <span className="font-bold text-[#2A9D8F]">₹{pkg.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ ADMIN GUEST BOOKINGS ============
const AdminGuestBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      toast.success('Booking updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-blue-100 text-blue-700',
    converted: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6" data-testid="admin-guest-bookings">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Guest Bookings</h2>
          <p className="text-slate-500 text-sm">Manage and convert guest leads</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Preferred Date</TableHead>
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
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell className="capitalize">{booking.service_category?.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{booking.preferred_date} {booking.preferred_time}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.booking_id, 'contacted')}
                          >
                            Mark Contacted
                          </Button>
                        )}
                        {booking.status !== 'converted' && booking.status !== 'cancelled' && (
                          <Button 
                            size="sm"
                            className="bg-[#2A9D8F]"
                          >
                            Convert to Client
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
    </div>
  );
};

// ============ ADMIN APPOINTMENTS ============
const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll({});
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6" data-testid="admin-appointments">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">All Appointments</h2>
          <p className="text-slate-500 text-sm">View and manage appointments</p>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date & Time</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No appointments found</TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.appointment_id}>
                    <TableCell className="font-medium">{apt.client_name}</TableCell>
                    <TableCell>{apt.service_name}</TableCell>
                    <TableCell>{apt.staff_name}</TableCell>
                    <TableCell>{apt.scheduled_date} {apt.scheduled_time}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[apt.status]}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
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

// ============ ADMIN BILLING ============
const AdminBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceAPI.getAll({});
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-billing">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Billing & Invoices</h2>
          <p className="text-slate-500 text-sm">View all invoices and payments</p>
        </div>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
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

// ============ ADMIN EXERCISES ============
const AdminExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', pcod_safe: '' });

  useEffect(() => {
    fetchExercises();
  }, [filters]);

  const fetchExercises = async () => {
    try {
      const params = { search };
      if (filters.category) params.category = filters.category;
      if (filters.pcod_safe) params.pcod_safe = filters.pcod_safe === 'true';
      
      const response = await api.get('/exercises', { params });
      setExercises(response.data);
    } catch (error) {
      toast.error('Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-exercises">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Exercise Library</h2>
          <p className="text-slate-500 text-sm">Manage exercise database</p>
        </div>
        <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input 
              placeholder="Search exercises..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select value={filters.category} onValueChange={(v) => setFilters({...filters, category: v})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="breathing">Breathing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.pcod_safe} onValueChange={(v) => setFilters({...filters, pcod_safe: v})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="PCOD Safe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">PCOD Safe Only</SelectItem>
                <SelectItem value="false">Not PCOD Safe</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchExercises}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : exercises.length === 0 ? (
          <Card className="col-span-full rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No exercises found</p>
            </CardContent>
          </Card>
        ) : (
          exercises.map((exercise) => (
            <Card key={exercise.exercise_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="secondary" className="capitalize">{exercise.category}</Badge>
                  {exercise.pcod_safe && (
                    <Badge className="bg-pink-100 text-pink-700">PCOD Safe</Badge>
                  )}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{exercise.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{exercise.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {exercise.contraindications?.slice(0, 2).map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-200">
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-slate-500 text-sm">Ages {exercise.min_age}-{exercise.max_age}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ ADMIN CONTENT (CMS) ============
const AdminContent = () => {
  return (
    <div className="space-y-6" data-testid="admin-content">
      <div>
        <h2 className="font-heading font-bold text-xl">Website Content</h2>
        <p className="text-slate-500 text-sm">Manage website content and media</p>
      </div>

      <Tabs defaultValue="banners">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Image className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Banner management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Pre-launch mode - Client testimonials will be available after 2026 launch</p>
                </div>
                <Badge className="bg-amber-100 text-amber-700">Preview Mode</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                <h4 className="font-heading font-bold text-lg text-slate-900 mb-2">Testimonials Coming Soon</h4>
                <p className="text-slate-600 mb-4">
                  Client testimonials will be collected and displayed after our official launch in 2026.
                  Currently showing vision statements and pre-launch messaging.
                </p>
                <p className="text-sm text-amber-700">
                  Note: Do not add fake reviews or star ratings before launch.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>FAQs</CardTitle>
                <Button className="bg-[#2A9D8F]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">Manage frequently asked questions</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gallery</CardTitle>
                <Button className="bg-[#2A9D8F]">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-8">Manage gallery images</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ============ ADMIN AUDIT LOGS ============
const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    login: 'bg-purple-100 text-purple-700',
    logout: 'bg-slate-100 text-slate-700',
    lock: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6" data-testid="admin-audit-logs">
      <div>
        <h2 className="font-heading font-bold text-xl">Audit Logs</h2>
        <p className="text-slate-500 text-sm">System activity and changes</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No audit logs found</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{log.user_email}</TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action] || 'bg-slate-100'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.new_value || log.old_value)}
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

// ============ ADMIN SETTINGS ============
const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-settings">
      <div>
        <h2 className="font-heading font-bold text-xl">System Settings</h2>
        <p className="text-slate-500 text-sm">Configure clinic settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Clinic Name</Label>
              <Input 
                value={settings.clinic_name || ''}
                onChange={(e) => setSettings({...settings, clinic_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input 
                value={settings.clinic_phone || ''}
                onChange={(e) => setSettings({...settings, clinic_phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={settings.clinic_email || ''}
                onChange={(e) => setSettings({...settings, clinic_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea 
                value={settings.clinic_address || ''}
                onChange={(e) => setSettings({...settings, clinic_address: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input 
                type="number"
                value={(settings.tax_rate || 0.18) * 100}
                onChange={(e) => setSettings({...settings, tax_rate: parseFloat(e.target.value) / 100})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Razorpay Enabled</Label>
                <p className="text-sm text-slate-500">Accept online payments</p>
              </div>
              <Switch 
                checked={settings.razorpay_enabled}
                onCheckedChange={(v) => setSettings({...settings, razorpay_enabled: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mock Payment Mode</Label>
                <p className="text-sm text-slate-500">For testing purposes</p>
              </div>
              <Switch 
                checked={settings.razorpay_mock_mode}
                onCheckedChange={(v) => setSettings({...settings, razorpay_mock_mode: v})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-slate-500">Send SMS to clients</p>
              </div>
              <Switch 
                checked={settings.sms_enabled}
                onCheckedChange={(v) => setSettings({...settings, sms_enabled: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-slate-500">Send WhatsApp messages</p>
              </div>
              <Switch 
                checked={settings.whatsapp_enabled}
                onCheckedChange={(v) => setSettings({...settings, whatsapp_enabled: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-slate-500">Send email notifications</p>
              </div>
              <Switch 
                checked={settings.email_enabled}
                onCheckedChange={(v) => setSettings({...settings, email_enabled: v})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Google OAuth</Label>
                <p className="text-sm text-slate-500">Allow Google login</p>
              </div>
              <Switch 
                checked={settings.google_oauth_enabled}
                onCheckedChange={(v) => setSettings({...settings, google_oauth_enabled: v})}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#2A9D8F] hover:bg-[#21867a]">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// ============ ADMIN REPORTS ============
const AdminReports = ({ stats }) => {
  return (
    <div className="space-y-6" data-testid="admin-reports">
      <div>
        <h2 className="font-heading font-bold text-xl">Reports & Analytics</h2>
        <p className="text-slate-500 text-sm">View business insights</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2A9D8F] mb-2">
              ₹{(stats.monthly_revenue || 0).toLocaleString()}
            </div>
            <p className="text-slate-500 text-sm">This month's revenue</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.total_clients || 0}
            </div>
            <p className="text-slate-500 text-sm">Total registered clients</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.today_appointments || 0}
            </div>
            <p className="text-slate-500 text-sm">Today's sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg mb-2">Advanced Analytics Coming Soon</h3>
          <p className="text-slate-500">Detailed charts and reports will be available here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
