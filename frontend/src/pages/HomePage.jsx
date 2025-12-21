import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Baby, Heart, Dumbbell, Sparkles, Users, Clock, Award, 
  ArrowRight, CheckCircle2, Star, MessageCircle, Calendar,
  Activity, Leaf
} from 'lucide-react';

const HomePage = () => {
  const services = [
    {
      icon: Baby,
      title: 'Paediatric Physiotherapy',
      description: 'Expert care for children with developmental delays, neurological conditions, and orthopaedic issues.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Heart,
      title: 'PCOD Management',
      description: 'Holistic program combining exercise, nutrition, and lifestyle changes for PCOD wellness.',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: Dumbbell,
      title: 'Weight Management',
      description: 'Personalized fitness and nutrition plans for sustainable weight loss and toning.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Sparkles,
      title: 'Zumba & Yoga',
      description: 'Fun group classes for fitness, flexibility, and stress relief.',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const stats = [
    { value: '2026', label: 'Launching' },
    { value: '15+', label: 'Expert Staff' },
    { value: '2025', label: 'Practice Since' },
    { value: '100%', label: 'Commitment' },
  ];

  const testimonials = [
    {
      name: 'Our Vision',
      content: "Built on hands-on clinical experience and a patient-first approach. We're excited to bring personalised paediatric and women's wellness care to our community.",
      type: 'vision',
    },
    {
      name: 'Our Promise',
      content: "Designed to deliver structured, ethical, and personalised care. Looking forward to sharing real client experiences after our official launch.",
      type: 'vision',
    },
    {
      name: 'Coming Soon',
      content: "Excited to begin our wellness journey here. We look forward to sharing testimonials as our story unfolds in 2026.",
      type: 'preview',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 gradient-hero relative overflow-hidden" data-testid="hero-section">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#2A9D8F]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4A261]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <Badge className="mb-6 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
                <Leaf className="w-4 h-4 mr-2" />
                Trusted by 5000+ Families
              </Badge>
              
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight mb-6">
                Expert Care for{' '}
                <span className="text-[#2A9D8F]">Little Ones</span> &{' '}
                <span className="text-[#F4A261]">Women's Wellness</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Specialized paediatric physiotherapy and holistic wellness programs designed 
                to help your child thrive and empower women to achieve their health goals.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/book">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 rounded-full bg-[#2A9D8F] hover:bg-[#21867a] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-base font-bold"
                    data-testid="hero-book-btn"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/services">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 rounded-full border-2 border-slate-200 hover:border-[#2A9D8F] hover:bg-[#E0F2F1] text-base font-bold"
                    data-testid="hero-services-btn"
                  >
                    View Services
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t border-slate-200">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#21867a] border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">{i}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F4A261] text-[#F4A261]" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">500+ 5-star reviews</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fadeInUp stagger-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/13731099/pexels-photo-13731099.jpeg"
                  alt="Child physiotherapy session"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-floating animate-fadeInUp stagger-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-slate-900">200+ Sessions</p>
                    <p className="text-sm text-slate-500">This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="font-heading font-extrabold text-4xl lg:text-5xl text-[#2A9D8F] mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#F8FAFC]" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Our Services
            </Badge>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mb-4">
              Comprehensive Wellness Solutions
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From paediatric care to women's fitness, we offer personalized programs 
              tailored to your unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={service.title}
                className="bg-white rounded-3xl border-0 shadow-floating hover:shadow-soft transition-all hover:-translate-y-1 cursor-pointer group"
                data-testid={`service-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full border-2 border-[#2A9D8F] text-[#2A9D8F] hover:bg-[#2A9D8F] hover:text-white"
                data-testid="view-all-services-btn"
              >
                View All Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-[#F4A261]/10 text-[#F4A261] hover:bg-[#F4A261]/10 rounded-full px-4 py-1.5">
                Why Choose Us
              </Badge>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mb-6">
                Your Health, Our Priority
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                We combine clinical expertise with a warm, caring approach to deliver 
                outstanding results for every patient.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Users, title: 'Expert Team', desc: 'Qualified physiotherapists, trainers & nutritionists' },
                  { icon: Clock, title: 'Flexible Timings', desc: 'Morning, evening & weekend slots available' },
                  { icon: Award, title: 'Proven Results', desc: '98% patient satisfaction rate' },
                  { icon: Activity, title: 'Personalized Plans', desc: 'Customized programs for your unique needs' },
                ].map((item, index) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#E0F2F1] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#2A9D8F]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-lg text-slate-900">{item.title}</h4>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1617372591382-4ecd2bf8bbc3?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Woman doing yoga"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-floating max-w-[250px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4A261] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-heading font-bold text-slate-900">Online Consults</p>
                </div>
                <p className="text-sm text-slate-600">
                  Can't visit? Book an online consultation from the comfort of your home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F8FAFC]" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Testimonials
            </Badge>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 mb-4">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name}
                className="bg-white rounded-3xl border-0 shadow-floating"
                data-testid={`testimonial-${index}`}
              >
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F4A261] text-[#F4A261]" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#21867a] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{testimonial.name.charAt(0)}</span>
                    </div>
                    <p className="font-heading font-bold text-slate-900">{testimonial.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2A9D8F]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Book your first consultation today and take the first step towards better health.
            Our team is ready to help you achieve your goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/book">
              <Button 
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-[#2A9D8F] hover:bg-slate-100 shadow-lg text-base font-bold"
                data-testid="cta-book-btn"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
            <a 
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-2 border-white text-white hover:bg-white/10 text-base font-bold"
                data-testid="cta-whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
