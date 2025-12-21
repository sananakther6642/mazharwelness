import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { toast } from 'sonner';
import { guestAPI } from '../lib/api';
import { format } from 'date-fns';
import { 
  ArrowLeft, Calendar as CalendarIcon, CheckCircle2, Phone, 
  User, MessageSquare, Clock 
} from 'lucide-react';
import { cn } from '../lib/utils';

const BookingPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceCategory: '',
    preferredDate: null,
    preferredTime: '',
    message: '',
  });

  const serviceCategories = [
    { value: 'paediatric_physio', label: 'Paediatric Physiotherapy' },
    { value: 'weight_management', label: 'Weight Management' },
    { value: 'pcod', label: 'PCOD Management' },
    { value: 'zumba_aerobics_yoga', label: 'Zumba / Aerobics / Yoga' },
    { value: 'pain_management', label: 'Pain Management' },
  ];

  const timeSlots = [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.serviceCategory || 
        !formData.preferredDate || !formData.preferredTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await guestAPI.createBooking({
        full_name: formData.fullName,
        phone: formData.phone,
        service_category: formData.serviceCategory,
        preferred_date: format(formData.preferredDate, 'yyyy-MM-dd'),
        preferred_time: formData.preferredTime,
        message: formData.message || null,
      });

      setBookingId(response.data.booking_id);
      setStep(2);
      toast.success('Booking request submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2A9D8F] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {step === 1 ? (
            <Card className="rounded-3xl shadow-floating border-0" data-testid="booking-form-card">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="font-heading font-bold text-2xl text-slate-900">
                  Book an Appointment
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  No registration required. Fill in your details and we'll contact you shortly.
                </p>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 h-12 rounded-xl"
                        data-testid="booking-name-input"
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
                        data-testid="booking-phone-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Category *</Label>
                    <Select 
                      value={formData.serviceCategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, serviceCategory: value }))}
                    >
                      <SelectTrigger className="h-12 rounded-xl" data-testid="booking-service-select">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 rounded-xl justify-start text-left font-normal",
                              !formData.preferredDate && "text-slate-500"
                            )}
                            data-testid="booking-date-btn"
                          >
                            <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
                            {formData.preferredDate ? (
                              format(formData.preferredDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.preferredDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, preferredDate: date }))}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Time *</Label>
                      <Select 
                        value={formData.preferredTime}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
                      >
                        <SelectTrigger className="h-12 rounded-xl" data-testid="booking-time-select">
                          <Clock className="mr-2 h-5 w-5 text-slate-400" />
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message (optional)</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Any specific concerns or questions..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="pl-10 rounded-xl min-h-[100px]"
                        data-testid="booking-message-input"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-14 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold text-base"
                    disabled={loading}
                    data-testid="booking-submit-btn"
                  >
                    {loading ? 'Submitting...' : 'Book Appointment'}
                  </Button>

                  <p className="text-center text-sm text-slate-500">
                    By booking, you agree to our terms of service and privacy policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl shadow-floating border-0" data-testid="booking-success-card">
              <CardContent className="py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-3">
                  Booking Request Received!
                </h2>
                
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Thank you for choosing Mazhar Wellness. Our team will contact you shortly 
                  to confirm your appointment.
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-left">
                  <h3 className="font-semibold text-slate-900 mb-3">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Name:</span> {formData.fullName}</p>
                    <p><span className="text-slate-500">Phone:</span> {formData.phone}</p>
                    <p><span className="text-slate-500">Service:</span> {
                      serviceCategories.find(s => s.value === formData.serviceCategory)?.label
                    }</p>
                    <p><span className="text-slate-500">Date:</span> {format(formData.preferredDate, 'PPP')}</p>
                    <p><span className="text-slate-500">Time:</span> {formData.preferredTime}</p>
                    <p><span className="text-slate-500">Reference:</span> {bookingId}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button variant="outline" className="rounded-full px-8">
                      Back to Home
                    </Button>
                  </Link>
                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full px-8 bg-green-600 hover:bg-green-700">
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
