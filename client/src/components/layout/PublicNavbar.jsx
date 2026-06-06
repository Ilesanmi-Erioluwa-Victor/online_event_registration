import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user ? `/${user.role}/dashboard` : null;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/organizers', label: 'Organizers' },
  ];

  return (
    <nav
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? 'bg-white/95 backdrop-blur shadow-md text-neutral-800'
          : 'bg-primary-dark text-white shadow-md'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                scrolled ? 'bg-primary text-white' : 'bg-accent text-white'
              }`}
            >
              E
            </div>
            <div>
              <div className="font-bold text-lg leading-none">EventHub</div>
              <div
                className={`text-xs ${
                  scrolled ? 'text-neutral-500' : 'text-primary-light'
                }`}
              >
                Register. Attend. Connect.
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-neutral-700 hover:bg-neutral-100'
                    : 'text-primary-light hover:bg-primary-light/20 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'hover:bg-neutral-100 text-neutral-800'
                      : 'hover:bg-primary-light/20 text-white'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      scrolled
                        ? 'bg-primary text-white'
                        : 'bg-primary-light text-white'
                    }`}
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-neutral-800 rounded-lg shadow-lg overflow-hidden border border-neutral-200">
                    <div className="p-3 border-b">
                      <div className="font-medium truncate">{user.fullName}</div>
                      <div className="text-xs text-neutral-500 truncate">
                        {user.email}
                      </div>
                      <div className="text-xs text-primary capitalize mt-1">
                        {user.role}
                      </div>
                    </div>
                    {dashboardPath && (
                      <Link
                        to={dashboardPath}
                        className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                      >
                        <UserCircleIcon className="h-4 w-4" />
                        Go to Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-primary hover:bg-primary-pale'
                      : 'text-white hover:bg-primary-light/20'
                  }`}
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? 'hover:bg-neutral-100' : 'hover:bg-primary-light/20'
            }`}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={`md:hidden border-t ${
            scrolled
              ? 'bg-white border-neutral-200 text-neutral-800'
              : 'bg-primary-dark border-primary-light/20 text-white'
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  scrolled
                    ? 'hover:bg-neutral-100'
                    : 'hover:bg-primary-light/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div
              className={`pt-3 mt-2 border-t space-y-2 ${
                scrolled ? 'border-neutral-200' : 'border-primary-light/20'
              }`}
            >
              {user ? (
                <>
                  {dashboardPath && (
                    <Link
                      to={dashboardPath}
                      className={`block w-full text-center px-4 py-2 rounded-lg text-sm font-medium ${
                        scrolled
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-accent text-white hover:bg-accent-dark'
                      }`}
                    >
                      Go to Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium border ${
                      scrolled
                        ? 'border-neutral-300 hover:bg-neutral-100'
                        : 'border-primary-light/30 hover:bg-primary-light/20'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block w-full text-center px-4 py-2 rounded-lg text-sm font-medium border ${
                      scrolled
                        ? 'border-primary text-primary hover:bg-primary-pale'
                        : 'border-primary-light/30 text-white hover:bg-primary-light/20'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center btn-primary text-sm py-2"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
