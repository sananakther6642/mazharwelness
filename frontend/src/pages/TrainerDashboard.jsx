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
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';


import api, { appointmentAPI, workoutPlanAPI, exerciseAPI, progressAPI } from '../lib/api';
import { 
  LayoutDashboard, Users, Calendar, Dumbbell, Activity, 
  Clock, LogOut, Menu, X, Plus, Edit, Eye, Search, 
  Bell, ChevronRight, TrendingUp, CheckCircle, Heart
} from 'lucide-react';

import { notificationsAPI } from "../lib/notificationsApi";


const TrainerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
 const [notifLoading, setNotifLoading] = useState(false);
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/notifications"); // your endpoint
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;



  useEffect(() => {
  if (user) fetchNotifications();
}, [user]);


const READ_KEY = `trainer_notif_read_${user?.id || user?.user_id || "me"}`;

const getLocalReadSet = () => {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const saveLocalReadSet = (set) => {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
};

useEffect(() => {
  if (!user) return;
  const readSet = getLocalReadSet();
  setNotifications((prev) =>
    prev.map((n) => ({
      ...n,
      read: n.read || readSet.has(n.id),
    }))
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);



  useEffect(() => {
    if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/trainer' },
    { icon: Users, label: 'My Members', path: '/trainer/members' },
    { icon: Calendar, label: 'Classes', path: '/trainer/classes' },
    { icon: CheckCircle, label: 'Attendance', path: '/trainer/attendance' },
    { icon: Dumbbell, label: 'Workout Plans', path: '/trainer/workout-plans' },
    { icon: Activity, label: 'Exercises', path: '/trainer/exercises' },
    { icon: TrendingUp, label: 'Progress', path: '/trainer/progress' },
    { icon: Heart, label: 'PCOD Tracking', path: '/trainer/pcod' },
  ];

  const isActive = (path) => {
    if (path === '/trainer') return location.pathname === '/trainer';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="trainer-dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-orange-900 text-white z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-orange-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-white font-heading font-bold">Trainer</span>
              <span className="text-orange-300 font-heading text-sm ml-1">Panel</span>
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
                      : 'text-orange-200 hover:bg-orange-800 hover:text-white'
                  }`}
                  data-testid={`trainer-menu-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-orange-200 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            data-testid="trainer-logout-btn"
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
           <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>


{showNotifications && (
  <div className="absolute right-4 top-16 w-80 bg-white border rounded-2xl shadow-lg z-50 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <div className="font-medium">Notifications</div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            // mark all read locally + backend
            const readSet = getLocalReadSet();
            notifications.forEach((n) => readSet.add(n.id));
            saveLocalReadSet(readSet);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

            try { await notificationsAPI.markAllRead(); } catch (e) {}
          }}
        >
          Mark all read
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
          Close
        </Button>
      </div>
    </div>

    <div className="max-h-96 overflow-auto">
      {notifLoading ? (
        <div className="p-4 text-sm text-slate-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-sm text-slate-500">No notifications</div>
      ) : (
        notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`w-full text-left px-4 py-3 border-b hover:bg-slate-50 ${
              n.read ? "opacity-70" : ""
            }`}
            onClick={async () => {
              // mark one read locally + backend
              const readSet = getLocalReadSet();
              readSet.add(n.id);
              saveLocalReadSet(readSet);

              setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
              );

              try { await notificationsAPI.markRead(n.id); } catch (e) {}
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-sm text-slate-900">{n.title || "Notification"}</div>
                <div className="text-xs text-slate-600 mt-1">{n.message || ""}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {n.created_at ? String(n.created_at).replace("T", " ").slice(0, 16) : ""}
                </div>
              </div>
              {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-red-500" />}
            </div>
          </button>
        ))
      )}
    </div>
  </div>
)}


              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'T'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Trainer</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<TrainerOverview stats={stats} />} />
            <Route path="/members" element={<TrainerMembers />} />
            <Route path="/classes" element={<TrainerClasses />} />
            <Route path="/attendance" element={<TrainerAttendance />} />
            <Route path="/workout-plans" element={<TrainerWorkoutPlans />} />
            <Route path="/exercises" element={<TrainerExercises />} />
            <Route path="/progress" element={<TrainerProgress />} />
            <Route path="/pcod" element={<TrainerPCOD />} />


          </Routes>
        </main>
      </div>
    </div>
  );
};

// ============ TRAINER OVERVIEW ============
const TrainerOverview = ({ stats }) => {
  const statCards = [
    { label: 'Active Members', value: stats.assigned_clients || 0, icon: Users, color: 'bg-blue-500' },
    { label: "Today's Classes", value: stats.today_appointments || 0, icon: Calendar, color: 'bg-orange-500' },
    { label: 'Workout Plans', value: stats.active_plans || 0, icon: Dumbbell, color: 'bg-purple-500' },
    { label: 'PCOD Members', value: stats.pcod_members || 0, icon: Heart, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-8" data-testid="trainer-overview">
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-orange-900 to-orange-700 text-white">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-2xl mb-2">Trainer Dashboard</h2>
          <p className="text-orange-100">Manage classes, members, and workout plans.</p>
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
          { label: 'Create Workout', icon: Dumbbell, path: '/trainer/workout-plans', color: 'bg-orange-100 text-orange-600' },
          { label: 'Mark Attendance', icon: CheckCircle, path: '/trainer/attendance', color: 'bg-green-100 text-green-600' },
          { label: 'View Members', icon: Users, path: '/trainer/members', color: 'bg-blue-100 text-blue-600' },
          { label: 'PCOD Tracker', icon: Heart, path: '/trainer/pcod', color: 'bg-pink-100 text-pink-600' },
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

const fetchNotifications = async () => {
  try {
    setNotifLoading(true);
    const res = await notificationsAPI.list();
    const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    setNotifications(data);
  } catch (e) {
    console.error(e);
  } finally {
    setNotifLoading(false);
  }
  
};

// ============ TRAINER MEMBERS ============
const TrainerMembers = () => {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);



  const fetchMembers = async () => {
    try {
      const response = await api.get('/trainer/my-clients');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-members">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">My Members</h2>
          <p className="text-slate-500 text-sm">Members assigned to your classes</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search members..." 
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
                <TableHead>Goal</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>PCOD</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No members assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                members.filter(m => 
                  m.name?.toLowerCase().includes(search.toLowerCase())
                ).map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {member.profile?.client_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.profile?.goal || '-'}</TableCell>
                    <TableCell>{member.profile?.preferred_batch || '-'}</TableCell>
                    <TableCell>
                      {member.profile?.pcod_tracking ? (
                        <Badge className="bg-pink-100 text-pink-700">Yes</Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
  variant="ghost"
  size="sm"
  onClick={() => navigate(`/trainer/members/${member.user_id}`)}
  type="button"
>

</Button>

<Button
  variant="ghost"
  size="sm"
  onClick={() => navigate(`/trainer/workout-plans?client_id=${member.user_id}`)}
  type="button"
>
  <Dumbbell className="w-4 h-4" />
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

// ============ TRAINER CLASSES ============
const TrainerClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '', class_type: 'zumba', scheduled_date: '', scheduled_time: '', max_capacity: 20
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!newClass.name || !newClass.scheduled_date) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await api.post('/classes', newClass);
      toast.success('Class created');
      setShowAddDialog(false);
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create class');
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-classes">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Classes & Batches</h2>
          <p className="text-slate-500 text-sm">Manage your training classes</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input 
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  placeholder="e.g., Morning Zumba"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newClass.class_type} onValueChange={(v) => setNewClass({...newClass, class_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zumba">Zumba</SelectItem>
                    <SelectItem value="aerobics">Aerobics</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="pcod_special">PCOD Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input 
                    type="date"
                    value={newClass.scheduled_date}
                    onChange={(e) => setNewClass({...newClass, scheduled_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input 
                    type="time"
                    value={newClass.scheduled_time}
                    onChange={(e) => setNewClass({...newClass, scheduled_time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Capacity</Label>
                <Input 
                  type="number"
                  value={newClass.max_capacity}
                  onChange={(e) => setNewClass({...newClass, max_capacity: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddClass} className="bg-[#2A9D8F]">Create Class</Button>
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
        ) : classes.length === 0 ? (
          <Card className="col-span-full rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No classes scheduled</p>
            </CardContent>
          </Card>
        ) : (
          classes.map((cls) => (
            <Card key={cls.class_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {cls.class_type}
                  </Badge>
                  <span className="text-sm text-slate-500">{cls.enrolled || 0}/{cls.max_capacity}</span>
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{cls.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{cls.scheduled_date}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{cls.scheduled_time}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ TRAINER ATTENDANCE ============
const TrainerAttendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const response = await api.get('/trainer/my-clients');
      setMembers(response.data);
      // Initialize attendance state
      const initialAttendance = {};
      response.data.forEach(m => {
        initialAttendance[m.user_id] = false;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (memberId, present) => {
    setAttendance({ ...attendance, [memberId]: present });
    if (present) {
      try {
        await api.post('/attendance/check-in', {
          client_id: memberId
        });
        toast.success('Attendance marked');
      } catch (error) {
        toast.error('Failed to mark attendance');
      }
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-attendance">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Attendance</h2>
          <p className="text-slate-500 text-sm">Mark attendance for your members</p>
        </div>
        <Input 
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
        />
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.profile?.preferred_batch || '-'}</TableCell>
                    <TableCell>{member.profile?.goal || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={attendance[member.user_id] || false}
                        onCheckedChange={(checked) => handleMarkAttendance(member.user_id, checked)}
                      />
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

// ============ TRAINER WORKOUT PLANS ============
const TrainerWorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    client_id: '', name: '', exercises: [], frequency: '3x per week', pcod_safe: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, exercisesRes] = await Promise.all([
        api.get('/trainer/my-clients'),
        exerciseAPI.getAll({})
      ]);
      setMembers(membersRes.data);
      setExercises(exercisesRes.data);
      
      // Fetch workout plans
      const allPlans = [];
      for (const member of membersRes.data.slice(0, 10)) {
        try {
          const res = await workoutPlanAPI.getAll(member.user_id);
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
    if (!newPlan.client_id || !newPlan.name) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      await workoutPlanAPI.create({
        ...newPlan,
        exercises: newPlan.exercises.length ? newPlan.exercises : [{
          exercise_id: 'ex_default',
          exercise_name: 'Warm-up',
          sets: 1,
          reps: 10,
          order: 0
        }]
      });
      toast.success('Workout plan created');
      setShowNewDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create plan');
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-workout-plans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Workout Plans</h2>
          <p className="text-slate-500 text-sm">Create and manage workout plans</p>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workout Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Member *</Label>
                <Select value={newPlan.client_id} onValueChange={(v) => setNewPlan({...newPlan, client_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                  {members
                    .filter((m) => typeof m.user_id === 'string' && m.user_id.trim() !== '')
                    .map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.name || m.email || m.user_id}
                      </SelectItem>
                  ))}

                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input 
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  placeholder="e.g., Weight Loss Routine"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Input 
                  value={newPlan.frequency}
                  onChange={(e) => setNewPlan({...newPlan, frequency: e.target.value})}
                  placeholder="e.g., 3x per week"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPlan.pcod_safe}
                  onCheckedChange={(checked) => setNewPlan({...newPlan, pcod_safe: checked})}
                />
                <Label>PCOD Safe</Label>
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
              <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No workout plans found</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.workout_plan_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {plan.pcod_safe && (
                    <Badge className="bg-pink-100 text-pink-700">PCOD Safe</Badge>
                  )}
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.client_name || 'Member'}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exercises</span>
                    <span className="font-medium">{plan.exercises?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frequency</span>
                    <span className="font-medium">{plan.frequency}</span>
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

// ============ TRAINER EXERCISES ============
const TrainerExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '', description: '', category: 'strengthening', instructions: [], contraindications: ['None'], pcod_safe: true
  });

  const fetchExercises = useCallback(async () => {
    try {
      const response = await exerciseAPI.getAll({
  category: category === 'all' ? undefined : category,
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
        instructions: ['Step 1'],
        contraindications: ['None']
      });
      toast.success('Exercise added');
      setShowAddDialog(false);
      fetchExercises();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add exercise');
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-exercises">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">Exercise Library</h2>
          <p className="text-slate-500 text-sm">Browse and add exercises</p>
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="strengthening">Strengthening</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibility</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
            </SelectContent>
          </Select>
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
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea 
                    value={newExercise.description}
                    onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newExercise.pcod_safe}
                    onCheckedChange={(checked) => setNewExercise({...newExercise, pcod_safe: checked})}
                  />
                  <Label>PCOD Safe</Label>
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
          exercises.map((exercise) => (
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
                <p className="text-slate-500 text-sm line-clamp-2">{exercise.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ TRAINER PROGRESS ============
const TrainerProgress = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [newMetric, setNewMetric] = useState({ metric_type: 'weight', value: 0, unit: 'kg', notes: '' });

  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get('/trainer/my-clients');
      setMembers(response.data);
      if (response.data.length > 0) {
        setSelectedMember(response.data[0].user_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
  try {
    const response = await progressAPI.getByClient(selectedMember);
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
  }, [selectedMember]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (selectedMember) {
      fetchProgress();
    }
  }, [selectedMember, fetchProgress]);

  const handleRecordProgress = async () => {
    if (!selectedMember) return;
    try {
      await progressAPI.record(selectedMember, newMetric.metric_type, newMetric.value, newMetric.unit, newMetric.notes);
      toast.success('Progress recorded');
      setShowRecordDialog(false);
      fetchProgress();
    } catch (error) {
      toast.error('Failed to record progress');
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-progress">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Member Progress</h2>
          <p className="text-slate-500 text-sm">Track member progress</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>
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
                  <Label>Metric</Label>
                  <Select value={newMetric.metric_type} onValueChange={(v) => setNewMetric({...newMetric, metric_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="body_fat">Body Fat %</SelectItem>
                      <SelectItem value="muscle_mass">Muscle Mass</SelectItem>
                      <SelectItem value="waist">Waist</SelectItem>
                      <SelectItem value="hip">Hip</SelectItem>
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
                (Array.isArray(progress) ? progress : []).map((p) =>  (
                  <TableRow key={p.metric_id}>
                    <TableCell>{p.recorded_at?.split('T')[0]}</TableCell>
                    <TableCell className="capitalize">{p.metric_type?.replace('_', ' ')}</TableCell>
                    <TableCell className="font-medium">{p.value} {p.unit}</TableCell>
                    <TableCell>{p.notes || '-'}</TableCell>
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

// ============ TRAINER PCOD ============
const TrainerPCOD = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPCODMembers();
  }, []);

  const fetchPCODMembers = async () => {
    try {
      const response = await api.get('/trainer/my-clients');
      // Filter PCOD members
      const pcodMembers = response.data.filter(m => m.profile?.pcod_tracking);
      setMembers(pcodMembers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="trainer-pcod">
      <div>
        <h2 className="font-heading font-bold text-xl">PCOD Tracking</h2>
        <p className="text-slate-500 text-sm">Monitor PCOD members and their progress</p>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-pink-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-slate-900">PCOD-Aware Training</p>
              <p className="text-slate-600 text-sm">
                Special considerations for members with PCOD - low-impact exercises, stress management, and cycle-aware training.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Cycle Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No PCOD members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.profile?.goal || '-'}</TableCell>
                    <TableCell>{member.profile?.preferred_batch || '-'}</TableCell>
                    <TableCell>
                      {member.profile?.cycle_tracking_consent ? (
                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">Not Enabled</Badge>
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

export default TrainerDashboard;
