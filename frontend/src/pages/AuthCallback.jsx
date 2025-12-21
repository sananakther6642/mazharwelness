import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const hasProcessed = useRef(false);
  const [error, setError] = useState(null);
  const { googleLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Exchange session_id for user data
        const userData = await googleLogin(sessionId);
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        toast.success(`Welcome, ${userData.name}!`);
        
        // Redirect based on role
        switch (userData.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'reception':
            navigate('/reception', { replace: true });
            break;
          case 'physiotherapist':
            navigate('/physio', { replace: true });
            break;
          case 'trainer':
            navigate('/trainer', { replace: true });
            break;
          case 'nutritionist':
            navigate('/nutrition', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        toast.error('Authentication failed. Please try again.');
        
        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    processAuth();
  }, [googleLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Authentication Failed</h2>
          <p className="text-slate-600">{error}</p>
          <p className="text-sm text-slate-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero" data-testid="auth-callback">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Signing you in...</h2>
        <p className="text-slate-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
