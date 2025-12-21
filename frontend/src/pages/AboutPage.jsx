import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, Award, Users, Target, ArrowRight, 
  GraduationCap, Clock, Star 
} from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We understand that every patient is unique. Our care is personalized and compassionate.',
    },
    {
      icon: Award,
      title: 'Clinical Excellence',
      description: 'Our team follows evidence-based practices and stays updated with the latest research.',
    },
    {
      icon: Users,
      title: 'Collaborative Care',
      description: 'We work together - physiotherapists, trainers, and nutritionists - for holistic results.',
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'We set measurable goals and track progress to ensure you see real results.',
    },
  ];

  const team = [
    {
      name: 'Dr. Sarah Ahmed',
      role: 'Lead Physiotherapist',
      specialization: 'Paediatric Neurology',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
    },
    {
      name: 'Priya Sharma',
      role: 'Head Trainer',
      specialization: "Women's Fitness & PCOD",
      image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=300&h=300',
    },
    {
      name: 'Anjali Gupta',
      role: 'Senior Nutritionist',
      specialization: 'Clinical Nutrition',
      image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=300&h=300',
    },
  ];

  const milestones = [
    { year: '2025', title: 'Professional Practice Begins', description: 'Started physiotherapy practice with a focus on paediatric care' },
    { year: '2026', title: 'Mazhar Wellness Established', description: 'Clinic officially opens with comprehensive wellness services' },
    { year: '2026', title: "Women's Wellness Programs", description: 'Introducing fitness and PCOD management programs' },
    { year: '2026', title: 'Digital Care Launch', description: 'Online consultations and digital health services go live' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 gradient-hero" data-testid="about-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
                About Us
              </Badge>
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 mb-6">
                Caring for Your Family's <span className="text-[#2A9D8F]">Health & Wellness</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                At Mazhar Wellness & Paediatric Physio, we believe in providing compassionate, 
                expert care that makes a real difference in your life. Our team of specialists 
                is dedicated to helping children thrive and empowering women to achieve their 
                health goals.
              </p>
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="font-heading font-extrabold text-4xl text-[#2A9D8F]">10+</p>
                  <p className="text-slate-600">Years Experience</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-4xl text-[#2A9D8F]">5000+</p>
                  <p className="text-slate-600">Happy Clients</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-4xl text-[#2A9D8F]">15+</p>
                  <p className="text-slate-600">Expert Staff</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1570105954248-fa0c1376edfe?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Clinic interior"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white" data-testid="about-mission">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-3xl border-0 shadow-floating bg-[#E0F2F1]">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#2A9D8F] flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4">Our Mission</h3>
                <p className="text-slate-700 leading-relaxed">
                  To provide exceptional, personalized healthcare that empowers every child 
                  to reach their developmental potential and every woman to achieve optimal 
                  wellness, in a supportive and nurturing environment.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-floating bg-[#FFF7ED]">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-[#F4A261] flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-700 leading-relaxed">
                  To be the leading wellness center that sets the standard for integrated 
                  paediatric care and women's health, recognized for clinical excellence, 
                  innovation, and transformative patient outcomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[#F8FAFC]" data-testid="about-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Our Values
            </Badge>
            <h2 className="font-heading font-bold text-3xl text-slate-900">
              What We Stand For
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={value.title}
                className="rounded-2xl border-0 shadow-sm text-center"
                data-testid={`value-${index}`}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E0F2F1] flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-[#2A9D8F]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white" data-testid="about-team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#F4A261]/10 text-[#F4A261] hover:bg-[#F4A261]/10 rounded-full px-4 py-1.5">
              Our Team
            </Badge>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">
              Meet Our Experts
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our team of qualified professionals brings years of experience and a passion 
              for helping you achieve your health goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card 
                key={member.name}
                className="rounded-3xl border-0 shadow-floating overflow-hidden group"
                data-testid={`team-${index}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#2A9D8F] font-medium mb-2">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.specialization}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-[#F8FAFC]" data-testid="about-timeline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#E0F2F1] text-[#2A9D8F] hover:bg-[#E0F2F1] rounded-full px-4 py-1.5">
              Our Journey
            </Badge>
            <h2 className="font-heading font-bold text-3xl text-slate-900">
              Milestones Over the Years
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.year}
                className="flex gap-6 items-start"
                data-testid={`milestone-${index}`}
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-heading font-bold text-2xl text-[#2A9D8F]">
                    {milestone.year}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-[#2A9D8F] border-4 border-[#E0F2F1]"></div>
                  {index < milestones.length - 1 && (
                    <div className="absolute top-4 left-1.5 w-1 h-16 bg-[#E0F2F1]"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h4 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    {milestone.title}
                  </h4>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#2A9D8F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of happy clients who have transformed their health with us.
          </p>
          <Link to="/book">
            <Button 
              size="lg"
              className="h-14 px-8 rounded-full bg-white text-[#2A9D8F] hover:bg-slate-100 font-bold"
              data-testid="about-cta-btn"
            >
              Book Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
