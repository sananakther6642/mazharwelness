import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import BookingPage from './pages/BookingPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import GalleryPage from './pages/GalleryPage';
import ClientDashboard from './pages/ClientDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-heading font-bold text-2xl">M</span>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'reception':
        return <Navigate to="/reception" replace />;
      case 'physiotherapist':
        return <Navigate to="/physio" replace />;
      case 'trainer':
        return <Navigate to="/trainer" replace />;
      case 'nutritionist':
        return <Navigate to="/nutrition" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// App Router with session_id detection
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment for session_id (Google OAuth callback)
  // This must be checked synchronously during render, not in useEffect
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/book" element={<BookingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/gallery" element={<GalleryPage />} />

      {/* Client Dashboard */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Dashboard - placeholder */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPlaceholder role="Admin" />
          </ProtectedRoute>
        } 
      />

      {/* Reception Dashboard - placeholder */}
      <Route 
        path="/reception/*" 
        element={
          <ProtectedRoute allowedRoles={['reception', 'admin']}>
            <DashboardPlaceholder role="Reception" />
          </ProtectedRoute>
        } 
      />

      {/* Physiotherapist Dashboard - placeholder */}
      <Route 
        path="/physio/*" 
        element={
          <ProtectedRoute allowedRoles={['physiotherapist', 'admin']}>
            <DashboardPlaceholder role="Physiotherapist" />
          </ProtectedRoute>
        } 
      />

      {/* Trainer Dashboard - placeholder */}
      <Route 
        path="/trainer/*" 
        element={
          <ProtectedRoute allowedRoles={['trainer', 'admin']}>
            <DashboardPlaceholder role="Trainer" />
          </ProtectedRoute>
        } 
      />

      {/* Nutritionist Dashboard - placeholder */}
      <Route 
        path="/nutrition/*" 
        element={
          <ProtectedRoute allowedRoles={['nutritionist', 'admin']}>
            <DashboardPlaceholder role="Nutritionist" />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Placeholder Dashboard for other roles
const DashboardPlaceholder = ({ role }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-heading font-bold text-2xl">M</span>
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
          {role} Dashboard
        </h1>
        <p className="text-slate-600 mb-6">
          Welcome, {user?.name}! The {role.toLowerCase()} dashboard is coming soon.
        </p>
        <div className="space-y-3">
          <a href="/">
            <button className="w-full h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold transition-colors">
              Back to Home
            </button>
          </a>
          <button 
            onClick={logout}
            className="w-full h-12 rounded-full border-2 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// 404 Page
const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-heading font-extrabold text-8xl text-[#2A9D8F] mb-4">404</h1>
        <h2 className="font-heading font-bold text-2xl text-slate-900 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/">
          <button className="h-12 px-8 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold transition-colors">
            Back to Home
          </button>
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
