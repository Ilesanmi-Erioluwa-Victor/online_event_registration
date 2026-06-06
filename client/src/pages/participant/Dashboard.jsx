import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import CountdownTimer from '../../components/common/CountdownTimer.jsx';
import Button from '../../components/common/Button.jsx';
import { registrationsAPI } from '../../api/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatDate.js';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await registrationsAPI.getMy({ limit: 50 });
        setRegistrations(response.data.registrations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);
  
  const upcoming = registrations.filter(r => 
    r.status === 'Confirmed' && new Date(r.event?.startDate) >= new Date()
  );
  const past = registrations.filter(r => new Date(r.event?.endDate) < new Date());
  const attended = registrations.filter(r => r.attendanceStatus === 'Present').length;
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Hello, {user?.fullName}!</h1>
        <p className="text-neutral-600">Welcome to your dashboard</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-neutral-500">Total Registered</div>
          <div className="text-3xl font-bold text-primary">{registrations.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-neutral-500">Events Attended</div>
          <div className="text-3xl font-bold text-green-600">{attended}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-neutral-500">Upcoming Events</div>
          <div className="text-3xl font-bold text-accent">{upcoming.length}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <Link to="/participant/events">
          <Button variant="secondary" size="sm">Browse More</Button>
        </Link>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : upcoming.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500">
          You haven't registered for any upcoming events yet.{' '}
          <Link to="/participant/events" className="text-primary hover:underline">Browse events</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.slice(0, 4).map((reg) => (
            <div key={reg._id} className="card overflow-hidden border-l-4 border-primary-pale">
              <div className="h-32 bg-gradient-to-br from-primary-pale to-primary-light">
                {reg.event?.bannerImage && (
                  <img src={reg.event.bannerImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-1">{reg.event?.title}</h3>
                <div className="space-y-1 text-sm text-neutral-600 mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {formatDate(reg.event?.startDate)} • {reg.event?.startTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    <span className="truncate">{reg.event?.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <div className="text-xs text-neutral-500">Starts in</div>
                    <CountdownTimer targetDate={reg.event?.startDate} />
                  </div>
                  <Link to={`/participant/registrations/${reg._id}/ticket`}>
                    <Button size="sm">View Ticket</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default ParticipantDashboard;
