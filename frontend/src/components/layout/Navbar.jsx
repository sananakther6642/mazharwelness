import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'reception':
        return '/reception';
      case 'physiotherapist':
        return '/physio';
      case 'trainer':
        return '/trainer';
      case 'nutritionist':
        return '/nutrition';
      default:
        return '/dashboard';
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-slate-100" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#2A9D8F] font-heading font-bold text-lg">Mazhar</span>
              <span className="text-slate-600 font-heading font-semibold text-lg ml-1">Wellness</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-[#E0F2F1] text-[#2A9D8F]'
                    : 'text-slate-600 hover:text-[#2A9D8F] hover:bg-slate-50'
                }`}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#2A9D8F] transition-colors"
              data-testid="whatsapp-link"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">+91 99999 99999</span>
            </a>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2" data-testid="user-menu-btn">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer" data-testid="dashboard-link">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600" data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-full" data-testid="login-btn">
                    Login
                  </Button>
                </Link>
                <Link to="/book">
                  <Button className="rounded-full bg-[#2A9D8F] hover:bg-[#21867a] shadow-lg" data-testid="book-btn">
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center">
                        <span className="text-white font-heading font-bold text-lg">M</span>
                      </div>
                      <div>
                        <span className="text-[#2A9D8F] font-heading font-bold">Mazhar</span>
                        <span className="text-slate-600 font-heading font-semibold ml-1">Wellness</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 py-4 px-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                          isActive(link.href)
                            ? 'bg-[#E0F2F1] text-[#2A9D8F]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 border-t space-y-3">
                    {isAuthenticated ? (
                      <>
                        <Link to={getDashboardLink()} onClick={() => setIsOpen(false)}>
                          <Button className="w-full rounded-full bg-[#2A9D8F] hover:bg-[#21867a]">
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full rounded-full"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link to="/book" onClick={() => setIsOpen(false)}>
                          <Button className="w-full rounded-full bg-[#2A9D8F] hover:bg-[#21867a]">
                            Book Appointment
                          </Button>
                        </Link>
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full rounded-full">
                            Login
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
