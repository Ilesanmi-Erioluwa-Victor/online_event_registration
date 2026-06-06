import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PlusCircleIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const adminLinks = [
    { to: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/organizer/events/new', icon: PlusCircleIcon, label: 'Create Event' },
    { to: '/admin/events', icon: CalendarDaysIcon, label: 'All Events' },
    { to: '/admin/users', icon: UsersIcon, label: 'Users' },
    { to: '/admin/registrations', icon: ClipboardDocumentListIcon, label: 'Registrations' },
    { to: '/admin/reports', icon: ChartBarIcon, label: 'Reports' },
    { to: '/admin/audit-logs', icon: ShieldCheckIcon, label: 'Audit Logs' },
    { to: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  const organizerLinks = [
    { to: '/organizer/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/organizer/events', icon: CalendarDaysIcon, label: 'My Events' },
    { to: '/organizer/events/new', icon: PlusCircleIcon, label: 'Create Event' },
  ];

  const participantLinks = [
    { to: '/participant/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/participant/events', icon: CalendarDaysIcon, label: 'Browse Events' },
    { to: '/participant/registrations', icon: ClipboardDocumentListIcon, label: 'My Registrations' },
  ];

  let links = [];
  if (user?.role === 'admin') links = adminLinks;
  else if (user?.role === 'organizer') links = organizerLinks;
  else if (user?.role === 'participant') links = participantLinks;

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const navContent = (
    <>
      <div className="flex items-center justify-between mb-4 md:mb-4">
        <div className="text-xs uppercase tracking-wider text-primary-light font-semibold">
          {user?.role} Menu
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded hover:bg-primary-light/20 text-primary-light"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-primary-light text-white font-medium'
                  : 'text-primary-light hover:bg-primary-light/20 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden md:block bg-primary-dark text-white w-64 min-h-[calc(100vh-4rem)] flex-shrink-0">
        <div className="p-4">{navContent}</div>
      </aside>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-primary-dark text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pt-4 min-h-screen flex flex-col">
          <div className="mb-4 pb-4 border-b border-primary-light/20 flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold">
              E
            </div>
            <div>
              <div className="font-bold leading-none">EventHub</div>
              <div className="text-xs text-primary-light">Register. Attend. Connect.</div>
            </div>
          </div>
          {navContent}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
