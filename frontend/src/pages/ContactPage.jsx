import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  Phone, Mail, MapPin, Clock, MessageCircle, 
  Send, Instagram, Facebook 
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91 99999 99999', '+91 88888 88888'],
      action: { href: 'tel:+919999999999', label: 'Call Now' },
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['hello@mazharwellness.com', 'support@mazharwellness.com'],
      action: { href: 'mailto:hello@mazharwellness.com', label: 'Send Email' },
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['123 Wellness Street,', 'Mumbai, Maharashtra 400001'],
      action: { href: 'https://maps.google.com', label: 'Get Directions' },
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon - Sat: 7:00 AM - 8:00 PM', 'Sunday: 8:00 AM - 1:00 PM'],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 gradient-hero" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Contact Us
            </Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 mb-6">
              We'd Love to <span className="text-[#2A9D8F]">Hear From You</span>
            </h1>
            <p className="text-lg text-slate-600">
              Have questions or want to book an appointment? Reach out to us through 
              any of the channels below. We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-white" data-testid="contact-info">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={info.title}
                className="rounded-2xl border-0 shadow-floating text-center"
                data-testid={`contact-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-[#2A9D8F]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                    {info.title}
                  </h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-slate-600 text-sm">{detail}</p>
                  ))}
                  {info.action && (
                    <a 
                      href={info.action.href}
                      target={info.action.href.startsWith('http') ? '_blank' : undefined}
                      rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-block mt-3 text-[#2A9D8F] font-medium text-sm hover:underline"
                    >
                      {info.action.label} →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & WhatsApp */}
      <section className="py-16 bg-[#F8FAFC]" data-testid="contact-form-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="rounded-3xl border-0 shadow-floating" data-testid="contact-form-card">
              <CardContent className="p-8">
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="contact-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="contact-email-input"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 99999 99999"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="contact-phone-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl"
                        data-testid="contact-subject-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="rounded-xl min-h-[150px]"
                      data-testid="contact-message-input"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] font-bold"
                    disabled={loading}
                    data-testid="contact-submit-btn"
                  >
                    {loading ? 'Sending...' : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp & Social */}
            <div className="space-y-8">
              <Card className="rounded-3xl border-0 shadow-floating bg-green-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900">
                        Chat on WhatsApp
                      </h3>
                      <p className="text-slate-600">Quick responses guaranteed</p>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-6">
                    For faster responses, chat with us directly on WhatsApp. 
                    We typically respond within 30 minutes during business hours.
                  </p>
                  <a 
                    href="https://wa.me/919999999999?text=Hi!%20I'm%20interested%20in%20your%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 font-bold"
                      data-testid="whatsapp-btn"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Start WhatsApp Chat
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="rounded-3xl border-0 shadow-floating">
                <CardContent className="p-8">
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-4">
                    Follow Us
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Stay updated with health tips, success stories, and the latest news.
                  </p>
                  <div className="flex gap-4">
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
                      >
                        <Instagram className="w-5 h-5 mr-2" />
                        Instagram
                      </Button>
                    </a>
                    <a 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Facebook className="w-5 h-5 mr-2" />
                        Facebook
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card className="rounded-3xl border-0 shadow-floating overflow-hidden">
                <div className="h-48 bg-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Map View</p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#2A9D8F] text-sm hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
