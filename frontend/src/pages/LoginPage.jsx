import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectToDashboard = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from);
      return;
    }
    
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'reception':
        navigate('/reception');
        break;
      case 'physiotherapist':
        navigate('/physio');
        break;
      case 'trainer':
        navigate('/trainer');
        break;
      case 'nutritionist':
        navigate('/nutrition');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.name}!`);
      redirectToDashboard(userData.role);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const userData = await login(demoEmail, demoPassword);
      toast.success(`Welcome, ${userData.name}!`);
      redirectToDashboard(userData.role);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check if demo users are seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col" data-testid="login-page">
      {/* Back to Home */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2A9D8F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md rounded-3xl shadow-floating border-0" data-testid="login-card">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-heading font-bold text-2xl">M</span>
            </div>
            <CardTitle className="font-heading font-bold text-2xl text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-[#2A9D8F]"
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-[#2A9D8F]"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold"
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-slate-400 text-sm">or</span>
              <Separator className="flex-1" />
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 rounded-full border-slate-200"
              onClick={handleGoogleLogin}
              data-testid="google-login-btn"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2A9D8F] font-semibold hover:underline" data-testid="register-link">
                Register here
              </Link>
            </p>

            {/* Demo Logins Section */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm font-semibold text-slate-700 text-center mb-4">Demo Logins</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => handleDemoLogin('admin@demo.com', 'Demo@12345')}
                  data-testid="demo-admin-btn"
                >
                  🔵 Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                  onClick={() => handleDemoLogin('reception@demo.com', 'Demo@12345')}
                  data-testid="demo-reception-btn"
                >
                  🟢 Reception
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleDemoLogin('physio@demo.com', 'Demo@12345')}
                  data-testid="demo-physio-btn"
                >
                  🩺 Physio
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  onClick={() => handleDemoLogin('trainer@demo.com', 'Demo@12345')}
                  data-testid="demo-trainer-btn"
                >
                  💪 Trainer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => handleDemoLogin('nutrition@demo.com', 'Demo@12345')}
                  data-testid="demo-nutrition-btn"
                >
                  🥗 Nutritionist
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-lg border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                  onClick={() => handleDemoLogin('client@demo.com', 'Demo@12345')}
                  data-testid="demo-client-btn"
                >
                  👤 Client
                </Button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-3">
                All demo accounts use password: <code className="bg-slate-100 px-1 rounded">Demo@12345</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
