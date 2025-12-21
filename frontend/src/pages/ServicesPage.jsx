import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { serviceAPI } from '../lib/api';
import { 
  Baby, Heart, Dumbbell, Sparkles, Activity, Clock, 
  IndianRupee, ArrowRight, CheckCircle 
} from 'lucide-react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const categoryInfo = {
    paediatric_physio: {
      icon: Baby,
      color: 'bg-blue-50 text-blue-600',
      title: 'Paediatric Physiotherapy',
      description: 'Specialized therapy for children with developmental, neurological, and orthopaedic conditions.',
    },
    weight_management: {
      icon: Dumbbell,
      color: 'bg-orange-50 text-orange-600',
      title: 'Weight Management',
      description: 'Personalized fitness and nutrition programs for sustainable weight loss and toning.',
    },
    pcod: {
      icon: Heart,
      color: 'bg-pink-50 text-pink-600',
      title: 'PCOD Management',
      description: 'Holistic approach combining exercise, nutrition, and lifestyle changes for PCOD wellness.',
    },
    zumba_aerobics_yoga: {
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600',
      title: 'Zumba, Aerobics & Yoga',
      description: 'Fun and energizing group classes for fitness, flexibility, and stress relief.',
    },
    pain_management: {
      icon: Activity,
      color: 'bg-teal-50 text-teal-600',
      title: 'Pain Management',
      description: 'Physiotherapy solutions for chronic pain, sports injuries, and post-surgery recovery.',
    },
  };

  const serviceFeatures = {
    paediatric_physio: [
      'Developmental milestone assessment',
      'Early intervention therapy',
      'Neurological rehabilitation',
      'Orthopaedic conditions',
      'Sensory integration',
      'Home exercise programs',
    ],
    weight_management: [
      'Body composition analysis',
      'Customized workout plans',
      'Nutritional guidance',
      'Progress tracking',
      'Group fitness classes',
      'One-on-one training',
    ],
    pcod: [
      'Hormonal health focus',
      'PCOD-safe exercises',
      'Cycle-aware training',
      'Nutrition planning',
      'Stress management',
      'Progress monitoring',
    ],
    zumba_aerobics_yoga: [
      'High-energy Zumba',
      'Low-impact aerobics',
      'Hatha & Vinyasa yoga',
      'Flexible batch timings',
      'All fitness levels',
      'Fun group environment',
    ],
    pain_management: [
      'Chronic pain relief',
      'Sports injury rehab',
      'Post-surgery recovery',
      'Manual therapy',
      'Electrotherapy',
      'Posture correction',
    ],
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getAll();
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.category === activeTab);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 gradient-hero" data-testid="services-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Our Services
            </Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 mb-6">
              Comprehensive <span className="text-[#2A9D8F]">Wellness Solutions</span>
            </h1>
            <p className="text-lg text-slate-600">
              From paediatric care to women's fitness, we offer personalized programs 
              tailored to your unique health needs and goals.
            </p>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-white" data-testid="services-categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <Card 
                  key={key}
                  className="rounded-3xl border-0 shadow-floating hover:shadow-soft transition-all hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setActiveTab(key)}
                  data-testid={`category-${key}`}
                >
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-2xl ${info.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">
                      {info.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {info.description}
                    </p>
                    <ul className="space-y-2">
                      {serviceFeatures[key].slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-[#2A9D8F]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service List with Tabs */}
      <section className="py-16 bg-[#F8FAFC]" data-testid="services-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">
              Available Services & Pricing
            </h2>
            <p className="text-slate-600">
              View our services and their pricing. All prices include GST.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent mb-8">
              <TabsTrigger 
                value="all" 
                className="rounded-full px-6 py-2 data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white"
              >
                All Services
              </TabsTrigger>
              {Object.entries(categoryInfo).map(([key, info]) => (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className="rounded-full px-4 py-2 data-[state=active]:bg-[#2A9D8F] data-[state=active]:text-white"
                >
                  {info.title.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="rounded-2xl animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => {
                  const catInfo = categoryInfo[service.category];
                  const Icon = catInfo?.icon || Activity;
                  return (
                    <Card 
                      key={service.service_id}
                      className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all"
                      data-testid={`service-${service.service_id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-10 h-10 rounded-xl ${catInfo?.color || 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <Badge variant="secondary" className="rounded-full">
                            {catInfo?.title.split(' ')[0] || 'Service'}
                          </Badge>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Clock className="w-4 h-4" />
                            {service.duration_minutes} mins
                          </div>
                          <div className="flex items-center text-[#2A9D8F] font-bold">
                            <IndianRupee className="w-4 h-4" />
                            {service.price}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500">No services found in this category.</p>
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2A9D8F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 mb-8">
            Book your first consultation today. No registration required.
          </p>
          <Link to="/book">
            <Button 
              size="lg"
              className="h-14 px-8 rounded-full bg-white text-[#2A9D8F] hover:bg-slate-100 font-bold"
              data-testid="services-cta-btn"
            >
              Book Appointment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
