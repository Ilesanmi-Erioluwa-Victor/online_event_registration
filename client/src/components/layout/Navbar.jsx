import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    return `/${user?.role}/dashboard`;
  };

  return (
    <nav className="bg-primary-dark text-white shadow-md sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-primary-light/20"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <Link to={getDashboardPath()} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold">
                E
              </div>
              <div>
                <div className="font-bold text-lg leading-none">EventHub</div>
                <div className="text-xs text-primary-light">Register. Attend. Connect.</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 hover:bg-primary-light/20 rounded-full" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 hover:bg-primary-light/20 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center font-semibold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.fullName}</div>
                  <div className="text-xs text-primary-light capitalize">{user?.role}</div>
                </div>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white text-neutral-800 rounded-lg shadow-lg overflow-hidden z-40">
                    <div className="p-3 border-b">
                      <div className="font-medium truncate">{user?.fullName}</div>
                      <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
                      <div className="text-xs text-primary capitalize mt-1">{user?.role}</div>
                    </div>
                    <Link
                      to={`/${user?.role}/dashboard`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm"
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
