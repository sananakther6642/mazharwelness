import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Baby, Heart, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Parent fields
    childName: '',
    childAge: '',
    childCondition: '',
    // Woman fields
    age: '',
    goal: '',
    preferredBatch: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && !clientType) {
      toast.error('Please select your category');
      return;
    }
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'client'
      });

      toast.success('Registration successful! Welcome to Mazhar Wellness.');
      
      // Navigate to profile completion or dashboard
      navigate('/dashboard', { state: { needsProfile: true, clientType } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col" data-testid="register-page">
      {/* Back to Home */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2A9D8F] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg rounded-3xl shadow-floating border-0" data-testid="register-card">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-heading font-bold text-2xl">M</span>
            </div>
            <CardTitle className="font-heading font-bold text-2xl text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              {step === 1 && 'Choose your category to get started'}
              {step === 2 && 'Enter your account details'}
              {step === 3 && 'Tell us a bit more about yourself'}
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-[#2A9D8F]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Choose Category */}
            {step === 1 && (
              <div className="space-y-6">
                <RadioGroup value={clientType} onValueChange={setClientType}>
                  <div 
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      clientType === 'parent' 
                        ? 'border-[#2A9D8F] bg-[#E0F2F1]' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setClientType('parent')}
                    data-testid="parent-option"
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="parent" id="parent" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Baby className="w-5 h-5 text-blue-600" />
                          </div>
                          <Label htmlFor="parent" className="font-heading font-bold text-lg cursor-pointer">
                            I'm a Parent
                          </Label>
                        </div>
                        <p className="text-sm text-slate-600">
                          Register for paediatric physiotherapy services for your child
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      clientType === 'woman' 
                        ? 'border-[#2A9D8F] bg-[#E0F2F1]' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setClientType('woman')}
                    data-testid="woman-option"
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value="woman" id="woman" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-600" />
                          </div>
                          <Label htmlFor="woman" className="font-heading font-bold text-lg cursor-pointer">
                            Women's Wellness
                          </Label>
                        </div>
                        <p className="text-sm text-slate-600">
                          Register for fitness, PCOD management, or weight loss programs
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                <Button 
                  onClick={handleNextStep}
                  className="w-full h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold"
                  data-testid="step1-next-btn"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

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
                  data-testid="google-register-btn"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-center text-sm text-slate-600 mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#2A9D8F] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 h-12 rounded-xl"
                      data-testid="name-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 rounded-xl"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 99999 99999"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 h-12 rounded-xl"
                      data-testid="phone-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 rounded-xl"
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 h-12 rounded-xl"
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold"
                    data-testid="step2-next-btn"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {clientType === 'parent' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child's Name</Label>
                      <Input
                        id="childName"
                        name="childName"
                        placeholder="Your child's name"
                        value={formData.childName}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="child-name-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childAge">Child's Age (years)</Label>
                      <Input
                        id="childAge"
                        name="childAge"
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.childAge}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="child-age-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="childCondition">Condition/Concern (optional)</Label>
                      <Input
                        id="childCondition"
                        name="childCondition"
                        placeholder="e.g., Developmental delay, Cerebral Palsy"
                        value={formData.childCondition}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="child-condition-input"
                      />
                    </div>
                  </>
                )}

                {clientType === 'woman' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="age">Your Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="e.g., 30"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="age-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Your Goal</Label>
                      <Input
                        id="goal"
                        name="goal"
                        placeholder="e.g., Weight loss, PCOD management, General fitness"
                        value={formData.goal}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="goal-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredBatch">Preferred Batch/Time</Label>
                      <Input
                        id="preferredBatch"
                        name="preferredBatch"
                        placeholder="e.g., Morning 7-8 AM, Evening 6-7 PM"
                        value={formData.preferredBatch}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="batch-input"
                      />
                    </div>
                  </>
                )}

                <p className="text-sm text-slate-500">
                  You can always update this information later from your profile.
                </p>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-full"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold"
                    disabled={loading}
                    data-testid="register-submit-btn"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
