import { useState, useEffect, useCallback } from 'react';
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
import { toast } from 'sonner';
import api, { appointmentAPI, assessmentAPI, treatmentPlanAPI, progressAPI, exerciseAPI } from '../lib/api';
import { 
  LayoutDashboard, Users, Calendar, FileText, Activity, 
  ClipboardList, Dumbbell, LogOut, Menu, X, Plus, Edit, 
  Eye, Search, Bell, ChevronRight, Clock, User, Lock,
  TrendingUp, AlertCircle
} from 'lucide-react';

const PhysioDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'physiotherapist' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/physio' },
    { icon: Users, label: 'My Patients', path: '/physio/patients' },
    { icon: Calendar, label: 'Appointments', path: '/physio/appointments' },
    { icon: ClipboardList, label: 'Assessments', path: '/physio/assessments' },
    { icon: FileText, label: 'Treatment Plans', path: '/physio/treatment-plans' },
    { icon: Activity, label: 'Daily Notes', path: '/physio/daily-notes' },
    { icon: TrendingUp, label: 'Progress', path: '/physio/progress' },
    { icon: Dumbbell, label: 'Exercises', path: '/physio/exercises' },
  ];

  const isActive = (path) => {
    if (path === '/physio') return location.pathname === '/physio';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="physio-dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-green-900 text-white z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-green-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-white font-heading font-bold">Physio</span>
              <span className="text-green-300 font-heading text-sm ml-1">Panel</span>
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
                      : 'text-green-200 hover:bg-green-800 hover:text-white'
                  }`}
                  data-testid={`physio-menu-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-green-200 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            data-testid="physio-logout-btn"
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
              <button className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'P'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Physiotherapist</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<PhysioOverview stats={stats} />} />
            <Route path="/patients" element={<PhysioPatients />} />
            <Route path="/appointments" element={<PhysioAppointments />} />
            <Route path="/assessments" element={<PhysioAssessments />} />
            <Route path="/treatment-plans" element={<PhysioTreatmentPlans />} />
            <Route path="/daily-notes" element={<PhysioDailyNotes />} />
            <Route path="/progress" element={<PhysioProgress />} />
            <Route path="/exercises" element={<PhysioExercises />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ============ PHYSIO OVERVIEW ============
const PhysioOverview = ({ stats }) => {
  const statCards = [
    { label: 'Assigned Patients', value: stats.assigned_clients || 0, icon: Users, color: 'bg-blue-500' },
    { label: "Today's Sessions", value: stats.today_appointments || 0, icon: Calendar, color: 'bg-green-500' },
    { label: 'Active Treatment Plans', value: stats.active_plans || 0, icon: FileText, color: 'bg-purple-500' },
    { label: 'Pending Assessments', value: stats.pending_assessments || 0, icon: ClipboardList, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8" data-testid="physio-overview">
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-green-900 to-green-700 text-white">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-2xl mb-2">Physiotherapist Dashboard</h2>
          <p className="text-green-100">Manage your patients, assessments, and treatment plans.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Assessment', icon: ClipboardList, path: '/physio/assessments', color: 'bg-blue-100 text-blue-600' },
          { label: 'Add Daily Note', icon: FileText, path: '/physio/daily-notes', color: 'bg-green-100 text-green-600' },
          { label: 'View Patients', icon: Users, path: '/physio/patients', color: 'bg-purple-100 text-purple-600' },
          { label: 'Exercise Library', icon: Dumbbell, path: '/physio/exercises', color: 'bg-orange-100 text-orange-600' },
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

// ============ PHYSIO PATIENTS ============
const PhysioPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/physio/my-clients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-patients">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">My Patients</h2>
          <p className="text-slate-500 text-sm">Patients assigned to you</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search patients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline">
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
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Last Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No patients assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                patients.filter(p => 
                  p.name?.toLowerCase().includes(search.toLowerCase())
                ).map((patient) => (
                  <TableRow key={patient.user_id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {patient.profile?.client_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.profile?.child_condition || patient.profile?.goal || '-'}</TableCell>
                    <TableCell>{patient.last_session || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
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

// ============ PHYSIO APPOINTMENTS ============
const PhysioAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  const fetchAppointments = useCallback(async () => {
    try {
      const params = {};
      if (filter === 'today') {
        params.date = new Date().toISOString().split('T')[0];
      }
      const response = await appointmentAPI.getAll(params);
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      toast.success('Appointment updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-appointments">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">My Appointments</h2>
          <p className="text-slate-500 text-sm">View and manage your scheduled sessions</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No appointments found</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.appointment_id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-16 text-center">
                    <p className="font-bold text-lg">{apt.scheduled_time}</p>
                    <p className="text-xs text-slate-500">{apt.scheduled_date}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{apt.client_name}</p>
                    <p className="text-sm text-slate-500">{apt.service_name} • {apt.duration_minutes} mins</p>
                  </div>
                  <Badge className={
                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {apt.status}
                  </Badge>
                  {apt.status === 'confirmed' && (
                    <Button size="sm" onClick={() => handleStatusUpdate(apt.appointment_id, 'completed')}>
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============ PHYSIO ASSESSMENTS ============
const PhysioAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    client_id: '', assessment_type: 'initial', findings: {}, recommendations: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes] = await Promise.all([
        api.get('/physio/my-clients')
      ]);
      setPatients(patientsRes.data);
      // Fetch assessments for each patient
      const allAssessments = [];
      for (const patient of patientsRes.data.slice(0, 10)) {
        try {
          const res = await assessmentAPI.getByClient(patient.user_id);
          allAssessments.push(...res.data);
        } catch (e) {}
      }
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.client_id) {
      toast.error('Please select a patient');
      return;
    }
    try {
      await assessmentAPI.create(newAssessment);
      toast.success('Assessment created');
      setShowNewDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create assessment');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-assessments">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Assessments</h2>
          <p className="text-slate-500 text-sm">Create and manage patient assessments</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Assessment</DialogTitle>
              <DialogDescription>Record a new patient assessment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={newAssessment.client_id} onValueChange={(v) => setNewAssessment({...newAssessment, client_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select value={newAssessment.assessment_type} onValueChange={(v) => setNewAssessment({...newAssessment, assessment_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Findings (JSON)</Label>
                <Textarea 
                  placeholder='{"posture": "...", "range_of_motion": "...", "strength": "..."}'
                  rows={4}
                  onChange={(e) => {
                    try {
                      const findings = JSON.parse(e.target.value);
                      setNewAssessment({...newAssessment, findings});
                    } catch (err) {}
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Recommendations</Label>
                <Textarea 
                  value={newAssessment.recommendations}
                  onChange={(e) => setNewAssessment({...newAssessment, recommendations: e.target.value})}
                  placeholder="Treatment recommendations..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAssessment} className="bg-[#2A9D8F]">Create Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : assessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No assessments found</TableCell>
                </TableRow>
              ) : (
                assessments.map((assessment) => (
                  <TableRow key={assessment.assessment_id}>
                    <TableCell className="font-medium">{assessment.client_name || 'Patient'}</TableCell>
                    <TableCell className="capitalize">{assessment.assessment_type}</TableCell>
                    <TableCell>{assessment.created_at?.split('T')[0]}</TableCell>
                    <TableCell>
                      {assessment.is_locked ? (
                        <Badge className="bg-slate-100 text-slate-700">
                          <Lock className="w-3 h-3 mr-1" /> Locked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Editable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!assessment.is_locked && (
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

// ============ PHYSIO TREATMENT PLANS ============
const PhysioTreatmentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    client_id: '', diagnosis: '', goals: [], interventions: [], frequency: '', duration_weeks: 4
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const patientsRes = await api.get('/physio/my-clients');
      setPatients(patientsRes.data);
      const allPlans = [];
      for (const patient of patientsRes.data.slice(0, 10)) {
        try {
          const res = await treatmentPlanAPI.getByClient(patient.user_id);
          allPlans.push(...res.data);
        } catch (e) {}
      }
      setPlans(allPlans);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.client_id || !newPlan.diagnosis) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await treatmentPlanAPI.create({
        ...newPlan,
        goals: newPlan.goals.length ? newPlan.goals : ['Goal 1'],
        interventions: newPlan.interventions.length ? newPlan.interventions : ['Intervention 1']
      });
      toast.success('Treatment plan created');
      setShowNewDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create plan');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-treatment-plans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Treatment Plans</h2>
          <p className="text-slate-500 text-sm">Create and manage treatment plans</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Treatment Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={newPlan.client_id} onValueChange={(v) => setNewPlan({...newPlan, client_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Textarea 
                  value={newPlan.diagnosis}
                  onChange={(e) => setNewPlan({...newPlan, diagnosis: e.target.value})}
                  placeholder="Patient diagnosis..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input 
                    value={newPlan.frequency}
                    onChange={(e) => setNewPlan({...newPlan, frequency: e.target.value})}
                    placeholder="e.g., 3x per week"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (weeks)</Label>
                  <Input 
                    type="number"
                    value={newPlan.duration_weeks}
                    onChange={(e) => setNewPlan({...newPlan, duration_weeks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button onClick={handleCreatePlan} className="bg-[#2A9D8F]">Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))
        ) : plans.length === 0 ? (
          <Card className="col-span-full rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No treatment plans found</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.plan_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>
                    {plan.is_active ? 'Active' : 'Completed'}
                  </Badge>
                  {plan.is_locked && <Lock className="w-4 h-4 text-slate-400" />}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{plan.client_name || 'Patient'}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{plan.diagnosis}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frequency</span>
                    <span className="font-medium">{plan.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium">{plan.duration_weeks} weeks</span>
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

// ============ PHYSIO DAILY NOTES ============
const PhysioDailyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newNote, setNewNote] = useState({
    client_id: '', subjective: '', objective: '', assessment: '', plan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const patientsRes = await api.get('/physio/my-clients');
      setPatients(patientsRes.data);
      // Fetch daily notes
      const res = await api.get('/daily-notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.client_id || !newNote.subjective) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await api.post('/daily-notes', newNote);
      toast.success('Daily note created');
      setShowNewDialog(false);
      setNewNote({ client_id: '', subjective: '', objective: '', assessment: '', plan: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create note');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-daily-notes">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Daily Notes (SOAP)</h2>
          <p className="text-slate-500 text-sm">Record session notes for patients</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SOAP Note</DialogTitle>
              <DialogDescription>Subjective, Objective, Assessment, Plan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select value={newNote.client_id} onValueChange={(v) => setNewNote({...newNote, client_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subjective (S) *</Label>
                <Textarea 
                  value={newNote.subjective}
                  onChange={(e) => setNewNote({...newNote, subjective: e.target.value})}
                  placeholder="Patient's complaints and history..."
                />
              </div>
              <div className="space-y-2">
                <Label>Objective (O)</Label>
                <Textarea 
                  value={newNote.objective}
                  onChange={(e) => setNewNote({...newNote, objective: e.target.value})}
                  placeholder="Observations and measurements..."
                />
              </div>
              <div className="space-y-2">
                <Label>Assessment (A)</Label>
                <Textarea 
                  value={newNote.assessment}
                  onChange={(e) => setNewNote({...newNote, assessment: e.target.value})}
                  placeholder="Clinical assessment..."
                />
              </div>
              <div className="space-y-2">
                <Label>Plan (P)</Label>
                <Textarea 
                  value={newNote.plan}
                  onChange={(e) => setNewNote({...newNote, plan: e.target.value})}
                  placeholder="Treatment plan..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateNote} className="bg-[#2A9D8F]">Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No notes found</TableCell>
                </TableRow>
              ) : (
                notes.map((note) => (
                  <TableRow key={note.note_id}>
                    <TableCell className="font-medium">{note.client_name || 'Patient'}</TableCell>
                    <TableCell>{note.created_at?.split('T')[0]}</TableCell>
                    <TableCell className="max-w-xs truncate">{note.subjective}</TableCell>
                    <TableCell>
                      {note.is_locked ? (
                        <Badge className="bg-slate-100 text-slate-700">
                          <Lock className="w-3 h-3 mr-1" /> Locked
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Editable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
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

// ============ PHYSIO PROGRESS ============
const PhysioProgress = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [newMetric, setNewMetric] = useState({ metric_type: 'weight', value: 0, unit: 'kg', notes: '' });

  const fetchPatients = useCallback(async () => {
    try {
      const response = await api.get('/physio/my-clients');
      setPatients(response.data);
      if (response.data.length > 0) {
        setSelectedPatient(response.data[0].user_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
  try {
    const response = await progressAPI.getByClient(selectedPatient);
    const data = response?.data;

    // Normalize to array no matter what backend returns
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.progress)
            ? data.progress
            : data
              ? [data]
              : [];

    setProgress(rows);
  } catch (error) {
    console.error('Error:', error);

    setProgress([]); // prevent crashes
  }
}, [selectedPatient]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (selectedPatient) {
      fetchProgress();
    }
  }, [selectedPatient, fetchProgress]);


  const handleRecordProgress = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    try {
      await progressAPI.record(selectedPatient, newMetric.metric_type, newMetric.value, newMetric.unit, newMetric.notes);
      toast.success('Progress recorded');
      setShowRecordDialog(false);
      fetchProgress();
    } catch (error) {
      toast.error('Failed to record progress');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-progress">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Progress Tracking</h2>
          <p className="text-slate-500 text-sm">Monitor patient progress over time</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#2A9D8F]">
                <Plus className="w-4 h-4 mr-2" />
                Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Progress</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Metric Type</Label>
                  <Select value={newMetric.metric_type} onValueChange={(v) => setNewMetric({...newMetric, metric_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="height">Height</SelectItem>
                      <SelectItem value="pain_level">Pain Level</SelectItem>
                      <SelectItem value="range_of_motion">Range of Motion</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input 
                      type="number"
                      value={newMetric.value}
                      onChange={(e) => setNewMetric({...newMetric, value: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input 
                      value={newMetric.unit}
                      onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRecordDialog(false)}>Cancel</Button>
                <Button onClick={handleRecordProgress} className="bg-[#2A9D8F]">Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {progress.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">No progress records</TableCell>
                </TableRow>
              ) : (
                progress.map((p) => (
                  <TableRow key={p.metric_id}>
                    <TableCell>{p.recorded_at?.split('T')[0]}</TableCell>
                    <TableCell className="capitalize">{p.metric_type?.replace('_', ' ')}</TableCell>
                    <TableCell className="font-medium">{p.value} {p.unit}</TableCell>
                    <TableCell className="max-w-xs truncate">{p.notes || '-'}</TableCell>
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

// ============ PHYSIO EXERCISES ============
const PhysioExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '', description: '', category: 'strengthening', instructions: [], contraindications: ['None']
  });

  const fetchExercises = useCallback(async () => {
    try {
      const response = await exerciseAPI.getAll({
  category: category === 'all' ? undefined : category
  });

      setExercises(response.data);
    } catch (error) {
      toast.error('Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.description) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await exerciseAPI.create({
        ...newExercise,
        instructions: newExercise.instructions.length ? newExercise.instructions : ['Step 1'],
        contraindications: newExercise.contraindications.length ? newExercise.contraindications : ['None']
      });
      toast.success('Exercise added');
      setShowAddDialog(false);
      fetchExercises();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add exercise');
    }
  };

  return (
    <div className="space-y-6" data-testid="physio-exercises">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Exercise Library</h2>
          <p className="text-slate-500 text-sm">Browse and manage exercises</p>
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>

              <SelectItem value="strengthening">Strengthening</SelectItem>
              <SelectItem value="stretching">Stretching</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="functional">Functional</SelectItem>
            </SelectContent>
          </Select>
           <Input
    placeholder="Search exercises..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-56"
  />
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#2A9D8F]">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                    placeholder="Exercise name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newExercise.category} onValueChange={(v) => setNewExercise({...newExercise, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strengthening">Strengthening</SelectItem>
                      <SelectItem value="stretching">Stretching</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    value={newExercise.description}
                    onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                    placeholder="Exercise description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddExercise} className="bg-[#2A9D8F]">Add Exercise</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
          exercises.filter(e => 
            e.name?.toLowerCase().includes(search.toLowerCase())
          ).map((exercise) => (
            <Card key={exercise.exercise_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {exercise.category}
                  </Badge>
                  {exercise.pcod_safe && (
                    <Badge className="bg-pink-100 text-pink-700 text-xs">PCOD Safe</Badge>
                  )}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{exercise.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{exercise.description}</p>
                {(exercise.sets || exercise.reps) && (
                  <div className="flex gap-4 text-sm text-slate-600">
                    {exercise.sets && <span>{exercise.sets} sets</span>}
                    {exercise.reps && <span>{exercise.reps} reps</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PhysioDashboard;
