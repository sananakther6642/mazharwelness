import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
                <span className="text-white font-heading font-bold text-lg">M</span>
              </div>
              <div>
                <span className="text-[#2A9D8F] font-heading font-bold text-lg">Mazhar</span>
                <span className="text-white font-heading font-semibold text-lg ml-1">Wellness</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Expert paediatric physiotherapy and women's wellness programs. 
              Helping children reach their milestones and women achieve their health goals.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#2A9D8F] transition-colors"
                data-testid="instagram-link"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#2A9D8F] transition-colors"
                data-testid="facebook-link"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/services', label: 'Our Services' },
                { href: '/pricing', label: 'Pricing & Packages' },
                { href: '/about', label: 'About Us' },
                { href: '/gallery', label: 'Gallery' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-slate-400 hover:text-[#2A9D8F] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              {[
                'Paediatric Physiotherapy',
                'PCOD Management',
                'Weight Loss Programs',
                'Zumba & Aerobics',
                'Yoga Classes',
                'Pain Management',
              ].map((service) => (
                <li key={service}>
                  <span className="text-slate-400 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2A9D8F] flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">
                  123 Wellness Street,<br />
                  Mumbai, Maharashtra 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#2A9D8F] flex-shrink-0" />
                <a href="tel:+919999999999" className="text-slate-400 text-sm hover:text-[#2A9D8F]">
                  +91 99999 99999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#2A9D8F] flex-shrink-0" />
                <a href="mailto:hello@mazharwellness.com" className="text-slate-400 text-sm hover:text-[#2A9D8F]">
                  hello@mazharwellness.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#2A9D8F] flex-shrink-0 mt-0.5" />
                <div className="text-slate-400 text-sm">
                  <p>Mon - Sat: 7:00 AM - 8:00 PM</p>
                  <p>Sunday: 8:00 AM - 1:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {currentYear} Mazhar Wellness & Paediatric Physio. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-500 text-sm hover:text-slate-400">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-500 text-sm hover:text-slate-400">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
