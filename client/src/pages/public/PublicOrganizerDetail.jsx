import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PublicEventCard from '../../components/features/PublicEventCard.jsx';
import { publicAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';

const PublicOrganizerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const response = await publicAPI.getOrganizerById(id);
        setData(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load organizer');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizer();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card h-64 animate-pulse bg-neutral-100" />
        </div>
      </PublicLayout>
    );
  }

  if (!data) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Organizer not found
          </h2>
          <Link to="/organizers" className="btn-primary mt-4 inline-block">
            Browse organizers
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const { organizer, events } = data;
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= now);
  const pastEvents = events.filter((e) => new Date(e.endDate) < now);
  const displayedEvents = tab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/organizers"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to organizers
        </Link>

        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl sm:text-4xl font-bold flex-shrink-0 overflow-hidden">
              {organizer.profileImage ? (
                <img
                  src={organizer.profileImage}
                  alt={organizer.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                organizer.fullName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {organizer.organization || organizer.fullName}
              </h1>
              {organizer.organization && (
                <p className="text-neutral-600 mt-1">{organizer.fullName}</p>
              )}
              {organizer.bio && (
                <p className="text-neutral-700 mt-3">{organizer.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-500">
                <span>
                  Member since{' '}
                  <span className="font-medium text-neutral-700">
                    {formatDate(organizer.createdAt)}
                  </span>
                </span>
                {organizer.email && (
                  <a
                    href={`mailto:${organizer.email}`}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    {organizer.email}
                  </a>
                )}
                {organizer.phone && (
                  <a
                    href={`tel:${organizer.phone}`}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {organizer.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {events.length}
              </div>
              <div className="text-xs text-neutral-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {upcomingEvents.length}
              </div>
              <div className="text-xs text-neutral-500">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-700">
                {pastEvents.length}
              </div>
              <div className="text-xs text-neutral-500">Past</div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex gap-2 border-b border-neutral-200 mb-4">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === 'upcoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === 'past'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Past ({pastEvents.length})
            </button>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="card p-12 text-center text-neutral-500">
              No {tab} events from this organizer yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedEvents.map((event) => (
                <PublicEventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicOrganizerDetail;
