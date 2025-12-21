import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { packageAPI } from '../lib/api';
import { 
  CheckCircle, ArrowRight, IndianRupee, Star, 
  Sparkles, Calendar 
} from 'lucide-react';

const PricingPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annual, setAnnual] = useState(false);

  // Static packages for display
  const staticPackages = [
    {
      name: 'Starter',
      description: 'Perfect for trying out our services',
      price: 2999,
      features: [
        '5 Physiotherapy sessions',
        'Initial assessment included',
        'Home exercise program',
        'Valid for 30 days',
        'Email support',
      ],
      popular: false,
      category: 'physio',
    },
    {
      name: 'Wellness Pro',
      description: 'Our most popular package',
      price: 7999,
      features: [
        '12 Physiotherapy sessions',
        'Detailed assessment & report',
        'Personalized treatment plan',
        'Home exercise videos',
        'Valid for 60 days',
        'WhatsApp support',
        '1 Progress review session',
      ],
      popular: true,
      category: 'physio',
    },
    {
      name: 'Premium Care',
      description: 'Comprehensive care package',
      price: 14999,
      features: [
        '25 Physiotherapy sessions',
        'Full diagnostic assessment',
        'Custom treatment protocol',
        'Video consultation included',
        'Valid for 90 days',
        'Priority WhatsApp support',
        'Monthly progress reports',
        'Family discount 10%',
      ],
      popular: false,
      category: 'physio',
    },
    {
      name: 'Fitness Basic',
      description: 'Start your fitness journey',
      price: 1999,
      monthlyPrice: 1999,
      features: [
        'Access to group classes',
        'Zumba, Aerobics, Yoga',
        '12 classes per month',
        'Basic fitness assessment',
        'Flexible batch timings',
      ],
      popular: false,
      category: 'fitness',
    },
    {
      name: 'PCOD Wellness',
      description: 'Holistic PCOD management',
      price: 5999,
      monthlyPrice: 5999,
      features: [
        'Personal trainer sessions',
        'Custom diet plan',
        'PCOD-safe exercises',
        'Cycle tracking support',
        'Nutritionist consult',
        'Progress monitoring',
        'Valid for 30 days',
      ],
      popular: true,
      category: 'fitness',
    },
    {
      name: 'Transform',
      description: 'Complete body transformation',
      price: 9999,
      monthlyPrice: 9999,
      features: [
        '20 Personal training sessions',
        'Customized workout plan',
        'Diet plan & meal prep guide',
        'Weekly nutritionist check-in',
        'Body composition analysis',
        'Valid for 60 days',
        'Unlimited group classes',
      ],
      popular: false,
      category: 'fitness',
    },
  ];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await packageAPI.getAll();
        setPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 gradient-hero" data-testid="pricing-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Pricing
            </Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 mb-6">
              Transparent <span className="text-[#2A9D8F]">Pricing</span> for Quality Care
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Choose a package that fits your needs. All prices include GST. 
              No hidden charges. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Physiotherapy Packages */}
      <section className="py-16 bg-white" data-testid="physio-packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-2">
              Physiotherapy Packages
            </h2>
            <p className="text-slate-600">
              Paediatric and adult physiotherapy services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {staticPackages.filter(p => p.category === 'physio').map((pkg, index) => (
              <Card 
                key={pkg.name}
                className={`rounded-3xl border-2 transition-all hover:-translate-y-1 ${
                  pkg.popular 
                    ? 'border-[#2A9D8F] shadow-lg relative' 
                    : 'border-slate-100 shadow-floating'
                }`}
                data-testid={`physio-pkg-${index}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#F4A261] text-white rounded-full px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="font-heading font-bold text-xl mb-2">
                    {pkg.name}
                  </CardTitle>
                  <p className="text-slate-600 text-sm">{pkg.description}</p>
                  <div className="mt-4">
                    <span className="flex items-center justify-center text-4xl font-heading font-extrabold text-slate-900">
                      <IndianRupee className="w-6 h-6" />
                      {pkg.price.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-[#2A9D8F] flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/book">
                    <Button 
                      className={`w-full h-12 rounded-full font-bold ${
                        pkg.popular
                          ? 'bg-[#2A9D8F] hover:bg-[#21867a]'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fitness Packages */}
      <section className="py-16 bg-[#F8FAFC]" data-testid="fitness-packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-2">
              Fitness & Wellness Packages
            </h2>
            <p className="text-slate-600">
              Weight management, PCOD, and group fitness programs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {staticPackages.filter(p => p.category === 'fitness').map((pkg, index) => (
              <Card 
                key={pkg.name}
                className={`rounded-3xl border-2 transition-all hover:-translate-y-1 ${
                  pkg.popular 
                    ? 'border-[#F4A261] shadow-lg relative' 
                    : 'border-slate-100 shadow-floating'
                }`}
                data-testid={`fitness-pkg-${index}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#F4A261] text-white rounded-full px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="font-heading font-bold text-xl mb-2">
                    {pkg.name}
                  </CardTitle>
                  <p className="text-slate-600 text-sm">{pkg.description}</p>
                  <div className="mt-4">
                    <span className="flex items-center justify-center text-4xl font-heading font-extrabold text-slate-900">
                      <IndianRupee className="w-6 h-6" />
                      {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-[#F4A261] flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/book">
                    <Button 
                      className={`w-full h-12 rounded-full font-bold ${
                        pkg.popular
                          ? 'bg-[#F4A261] hover:bg-[#e8955a]'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" data-testid="pricing-faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Can I switch between packages?',
                a: 'Yes, you can upgrade or change your package at any time. Any remaining sessions will be adjusted or carried forward.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept UPI, credit/debit cards, net banking, and cash payments. EMI options are available for packages above ₹5,000.',
              },
              {
                q: 'Is there a cancellation policy?',
                a: 'You can cancel within 48 hours of purchase for a full refund. After that, unused sessions can be frozen for up to 30 days.',
              },
              {
                q: 'Do you offer corporate packages?',
                a: 'Yes! We offer special corporate wellness programs. Contact us for customized pricing for your organization.',
              },
            ].map((faq, index) => (
              <Card key={index} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2A9D8F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Not Sure Which Package is Right for You?
          </h2>
          <p className="text-white/80 mb-8">
            Book a free consultation and our team will help you choose the best option.
          </p>
          <Link to="/book">
            <Button 
              size="lg"
              className="h-14 px-8 rounded-full bg-white text-[#2A9D8F] hover:bg-slate-100 font-bold"
              data-testid="pricing-cta-btn"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
