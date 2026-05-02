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
import { toast } from 'sonner';
import api, { dietPlanAPI, progressAPI } from '../lib/api';
import { 
  LayoutDashboard, Users, Apple, FileText, Calendar,
  TrendingUp, LogOut, Menu, X, Plus, Edit, Eye, 
  Search, Bell, ChevronRight, Utensils, ClipboardList, Heart
} from 'lucide-react';

const NutritionDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user || (user.role !== 'nutritionist' && user.role !== 'admin')) {
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/nutrition' },
    { icon: Users, label: 'My Clients', path: '/nutrition/clients' },
    { icon: Apple, label: 'Diet Plans', path: '/nutrition/diet-plans' },
    { icon: ClipboardList, label: 'Templates', path: '/nutrition/templates' },
    { icon: Calendar, label: 'Follow-ups', path: '/nutrition/followups' },
    { icon: TrendingUp, label: 'Progress', path: '/nutrition/progress' },
  ];

  const isActive = (path) => {
    if (path === '/nutrition') return location.pathname === '/nutrition';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="nutrition-dashboard">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-purple-900 text-white z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-purple-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div>
              <span className="text-white font-heading font-bold">Nutrition</span>
              <span className="text-purple-300 font-heading text-sm ml-1">Panel</span>
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
                      : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                  }`}
                  data-testid={`nutrition-menu-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-purple-200 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            data-testid="nutrition-logout-btn"
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
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'N'}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500">Nutritionist</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<NutritionOverview stats={stats} />} />
            <Route path="/clients" element={<NutritionClients />} />
            <Route path="/diet-plans" element={<NutritionDietPlans />} />
            <Route path="/templates" element={<NutritionTemplates />} />
            <Route path="/followups" element={<NutritionFollowups />} />
            <Route path="/progress" element={<NutritionProgress />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ============ NUTRITION OVERVIEW ============
const NutritionOverview = ({ stats }) => {
  const statCards = [
    { label: 'Assigned Clients', value: stats.assigned_clients || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Diet Plans', value: stats.active_plans || 0, icon: Apple, color: 'bg-green-500' },
    { label: 'Follow-ups Today', value: stats.today_followups || 0, icon: Calendar, color: 'bg-orange-500' },
    { label: 'Templates', value: stats.templates || 0, icon: ClipboardList, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8" data-testid="nutrition-overview">
      <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-purple-900 to-purple-700 text-white">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-2xl mb-2">Nutritionist Dashboard</h2>
          <p className="text-purple-100">Create diet plans, track progress, and manage follow-ups.</p>
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
          { label: 'Create Diet Plan', icon: Apple, path: '/nutrition/diet-plans', color: 'bg-green-100 text-green-600' },
          { label: 'View Clients', icon: Users, path: '/nutrition/clients', color: 'bg-blue-100 text-blue-600' },
          { label: 'Follow-ups', icon: Calendar, path: '/nutrition/followups', color: 'bg-orange-100 text-orange-600' },
          { label: 'Templates', icon: ClipboardList, path: '/nutrition/templates', color: 'bg-purple-100 text-purple-600' },
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

// ============ NUTRITION CLIENTS ============
const NutritionClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/nutritionist/my-clients');
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="nutrition-clients">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl">My Clients</h2>
          <p className="text-slate-500 text-sm">Clients assigned for nutrition counseling</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search clients..." 
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
                <TableHead>Active Plan</TableHead>
                <TableHead>Last Follow-up</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No clients assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                clients.filter(c => 
                  c.name?.toLowerCase().includes(search.toLowerCase())
                ).map((client) => (
                  <TableRow key={client.user_id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {client.profile?.client_type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.profile?.goal || '-'}</TableCell>
                    <TableCell>
                      {client.has_active_plan ? (
                        <Badge className="bg-green-100 text-green-700">Yes</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{client.last_followup || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Apple className="w-4 h-4" />
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

// ============ NUTRITION DIET PLANS ============
const NutritionDietPlans = () => {
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    client_id: '',
    plan_type: 'weight_loss',
    meals: [],
    daily_calories: 1800,
    water_intake_liters: 2.5,
    restrictions: [],
    supplements: [],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clientsRes = await api.get('/nutritionist/my-clients');
      setClients(clientsRes.data);
      
      // Fetch diet plans
      const allPlans = [];
      for (const client of clientsRes.data.slice(0, 10)) {
        try {
          const res = await dietPlanAPI.getAll(client.user_id);
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
    if (!newPlan.client_id) {
      toast.error('Please select a client');
      return;
    }
    try {
      const planData = {
        ...newPlan,
        meals: [
          {
            time: '08:00',
            meal_type: 'breakfast',
            items: [{ name: 'Oatmeal', portion: '1 bowl', calories: 300 }],
            total_calories: 300
          },
          {
            time: '13:00',
            meal_type: 'lunch',
            items: [{ name: 'Grilled chicken salad', portion: '1 plate', calories: 500 }],
            total_calories: 500
          },
          {
            time: '19:00',
            meal_type: 'dinner',
            items: [{ name: 'Fish with vegetables', portion: '1 plate', calories: 600 }],
            total_calories: 600
          }
        ]
      };
      await dietPlanAPI.create(planData);
      toast.success('Diet plan created');
      setShowNewDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create plan');
    }
  };

  const planTypeLabels = {
    weight_loss: 'Weight Loss',
    weight_gain: 'Weight Gain',
    maintenance: 'Maintenance',
    pcod: 'PCOD Diet',
    therapeutic: 'Therapeutic',
    sports: 'Sports Nutrition'
  };

  return (
    <div className="space-y-6" data-testid="nutrition-diet-plans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Diet Plans</h2>
          <p className="text-slate-500 text-sm">Create and manage diet plans</p>
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
              <DialogTitle>Create Diet Plan</DialogTitle>
              <DialogDescription>Create a personalized diet plan for your client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={newPlan.client_id} onValueChange={(v) => setNewPlan({...newPlan, client_id: v})}>
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
                <Label>Plan Type</Label>
                <Select value={newPlan.plan_type} onValueChange={(v) => setNewPlan({...newPlan, plan_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="pcod">PCOD Diet</SelectItem>
                    <SelectItem value="therapeutic">Therapeutic</SelectItem>
                    <SelectItem value="sports">Sports Nutrition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Calories</Label>
                  <Input 
                    type="number"
                    value={newPlan.daily_calories}
                    onChange={(e) => setNewPlan({...newPlan, daily_calories: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Water (Liters)</Label>
                  <Input 
                    type="number"
                    step="0.5"
                    value={newPlan.water_intake_liters}
                    onChange={(e) => setNewPlan({...newPlan, water_intake_liters: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({...newPlan, notes: e.target.value})}
                  placeholder="Special instructions or notes..."
                />
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
              <Apple className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No diet plans found</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.diet_plan_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {planTypeLabels[plan.plan_type] || plan.plan_type}
                  </Badge>
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{plan.client_name || 'Client'}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Calories</span>
                    <span className="font-medium">{plan.daily_calories || '-'} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Water</span>
                    <span className="font-medium">{plan.water_intake_liters || '-'} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meals</span>
                    <span className="font-medium">{plan.meals?.length || 0} per day</span>
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

// ============ NUTRITION TEMPLATES ============
const NutritionTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '', plan_type: 'weight_loss', daily_calories: 1800, description: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/diet-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name) {
      toast.error('Please enter template name');
      return;
    }
    try {
      await api.post('/diet-templates', {
        ...newTemplate,
        meals: [
          { time: '08:00', meal_type: 'breakfast', items: [] },
          { time: '13:00', meal_type: 'lunch', items: [] },
          { time: '19:00', meal_type: 'dinner', items: [] }
        ]
      });
      toast.success('Template created');
      setShowAddDialog(false);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  return (
    <div className="space-y-6" data-testid="nutrition-templates">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Diet Templates</h2>
          <p className="text-slate-500 text-sm">Reusable diet plan templates</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input 
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="e.g., 1500 Cal Weight Loss"
                />
              </div>
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={newTemplate.plan_type} onValueChange={(v) => setNewTemplate({...newTemplate, plan_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="pcod">PCOD Diet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Daily Calories</Label>
                <Input 
                  type="number"
                  value={newTemplate.daily_calories}
                  onChange={(e) => setNewTemplate({...newTemplate, daily_calories: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Template description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddTemplate} className="bg-[#2A9D8F]">Create Template</Button>
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
        ) : templates.length === 0 ? (
          <Card className="col-span-full rounded-2xl border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No templates found. Create your first template.</p>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.template_id} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {template.plan_type?.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{template.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{template.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Calories</span>
                  <span className="font-medium">{template.daily_calories} kcal</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============ NUTRITION FOLLOW-UPS ============
const NutritionFollowups = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    client_id: '', date: '', notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/nutritionist/my-clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="nutrition-followups">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Follow-ups</h2>
          <p className="text-slate-500 text-sm">Schedule and track client follow-ups</p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2A9D8F] hover:bg-[#21867a]">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Follow-up</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={newFollowup.client_id} onValueChange={(v) => setNewFollowup({...newFollowup, client_id: v})}>
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
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={newFollowup.date}
                  onChange={(e) => setNewFollowup({...newFollowup, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  value={newFollowup.notes}
                  onChange={(e) => setNewFollowup({...newFollowup, notes: e.target.value})}
                  placeholder="Follow-up notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button className="bg-[#2A9D8F]">Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Last Follow-up</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No clients assigned
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.user_id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.last_followup || '-'}</TableCell>
                    <TableCell>{client.next_followup || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Calendar className="w-4 h-4" />
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

// ============ NUTRITION PROGRESS ============
const NutritionProgress = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [newMetric, setNewMetric] = useState({ metric_type: 'weight', value: 0, unit: 'kg', notes: '' });

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/nutritionist/my-clients');
      setClients(response.data);
      if (response.data.length > 0) {
        setSelectedClient(response.data[0].user_id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
  try {
    const response = await progressAPI.getByClient(selectedClient);
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
    setProgress([]); // prevent crash
  }
}, [selectedClient]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (selectedClient) {
      fetchProgress();
    }
  }, [selectedClient, fetchProgress]);

  const handleRecordProgress = async () => {
    if (!selectedClient) return;
    try {
      await progressAPI.record(selectedClient, newMetric.metric_type, newMetric.value, newMetric.unit, newMetric.notes);
      toast.success('Progress recorded');
      setShowRecordDialog(false);
      fetchProgress();
    } catch (error) {
      toast.error('Failed to record progress');
    }
  };

  return (
    <div className="space-y-6" data-testid="nutrition-progress">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl">Client Progress</h2>
          <p className="text-slate-500 text-sm">Track weight and measurements</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
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
                      <SelectItem value="bmi">BMI</SelectItem>
                      <SelectItem value="body_fat">Body Fat %</SelectItem>
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
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
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
                (Array.isArray(progress) ? progress : []).map((p) => (

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

export default NutritionDashboard;
