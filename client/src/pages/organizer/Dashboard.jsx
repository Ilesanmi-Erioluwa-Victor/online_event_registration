import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import EventCard from '../../components/features/EventCard.jsx';
import { reportsAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportsAPI.getOrganizerStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  if (loading) return <PageWrapper><div>Loading...</div></PageWrapper>;
  
  const metrics = [
    { label: 'My Events', value: stats?.totalEvents || 0, icon: CalendarDaysIcon, color: 'bg-blue-500' },
    { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: UsersIcon, color: 'bg-green-500' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: ClipboardDocumentListIcon, color: 'bg-purple-500' },
    { label: 'Avg Attendance %', value: `${stats?.avgAttendance || 0}%`, icon: ChartBarIcon, color: 'bg-orange-500' },
  ];
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Organizer Dashboard</h1>
        <p className="text-neutral-600">Manage your events and registrations</p>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">{metric.label}</div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">{metric.value}</div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/organizer/events/new" className="btn-primary text-sm">
            <PlusCircleIcon className="h-4 w-4" /> Create Event
          </Link>
          <Link to="/organizer/events" className="btn-secondary text-sm">View My Events</Link>
        </div>
      </div>
      
      {/* Recent Events */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">My Recent Events</h2>
        {stats?.recentEvents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentEvents.slice(0, 3).map((event) => (
              <EventCard key={event._id} event={event} basePath="/organizer/events" />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-neutral-500">
            No events yet. <Link to="/organizer/events/new" className="text-primary hover:underline">Create your first event</Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default OrganizerDashboard;
