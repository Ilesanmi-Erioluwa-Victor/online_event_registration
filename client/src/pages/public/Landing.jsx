import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  UsersIcon,
  SparklesIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PublicEventCard from '../../components/features/PublicEventCard.jsx';
import OrganizerCard from '../../components/features/OrganizerCard.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { publicAPI } from '../../api/index.js';

const STAT_COLOR_CLASSES = {
  primary: { bg: 'bg-primary-pale', text: 'text-primary' },
  success: { bg: 'bg-green-100', text: 'text-green-600' },
  accent: { bg: 'bg-accent-light', text: 'text-accent' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-600' },
};

const StatCard = ({ icon: Icon, value, label, color = 'primary' }) => {
  const palette = STAT_COLOR_CLASSES[color] || STAT_COLOR_CLASSES.primary;
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${palette.bg}`}
      >
        <Icon className={`h-6 w-6 ${palette.text}`} />
      </div>
      <div>
        <div className="text-2xl font-bold text-neutral-900">{value}</div>
        <div className="text-sm text-neutral-500">{label}</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Landing = () => {
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, upcomingRes, pastRes, organizersRes] =
          await Promise.all([
            publicAPI.getStats(),
            publicAPI.getEvents({
              period: 'upcoming',
              limit: 6,
              sort: 'startDate',
            }),
            publicAPI.getEvents({ period: 'past', limit: 6, sort: '-startDate' }),
            publicAPI.getOrganizers({ limit: 8 }),
          ]);

        setStats(statsRes?.data ?? null);
        setUpcomingEvents(Array.isArray(upcomingRes?.data?.events) ? upcomingRes.data.events : []);
        setPastEvents(Array.isArray(pastRes?.data?.events) ? pastRes.data.events : []);
        setOrganizers(Array.isArray(organizersRes?.data?.organizers) ? organizersRes.data.organizers : []);
      } catch (err) {
        toast.error(err?.message?.includes('Expected JSON')
          ? 'Backend not reachable. Set VITE_API_URL in Vercel env vars.'
          : 'Failed to load landing page');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterEvents = (events) => {
    if (!debouncedSearch) return events;
    const term = debouncedSearch.toLowerCase();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term) ||
        e.category?.name?.toLowerCase().includes(term)
    );
  };

  const filteredUpcoming = filterEvents(upcomingEvents);
  const filteredPast = filterEvents(pastEvents);

  const searchResults = debouncedSearch
    ? [...filteredUpcoming, ...filteredPast]
    : [];

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-4">
            <SparklesIcon className="h-4 w-4" />
            <span>Discover events happening around you</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Find Your Next Experience
          </h1>
          <p className="text-lg sm:text-xl text-primary-light max-w-2xl mx-auto mb-8">
            Browse conferences, workshops, concerts, and community gatherings.
            Register in seconds and get your ticket instantly.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-2 shadow-lg flex items-center gap-2">
              <div className="pl-3 text-neutral-400">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, category, location..."
                className="flex-1 px-2 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none"
              />
              <Link
                to="/events"
                className="hidden sm:inline-flex btn-primary text-sm py-2"
              >
                Browse All
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              to="/events"
              className="btn-primary text-base px-6 py-3 sm:hidden"
            >
              Browse All Events
            </Link>
            <Link
              to="/organizers"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              <UsersIcon className="h-5 w-5" />
              Meet Organizers
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={CalendarDaysIcon}
            value={stats?.totalEvents ?? '—'}
            label="Total Events"
          />
          <StatCard
            icon={ClockIcon}
            value={stats?.upcomingEvents ?? '—'}
            label="Upcoming"
            color="success"
          />
          <StatCard
            icon={UserGroupIcon}
            value={stats?.totalRegistrations ?? '—'}
            label="Registrations"
            color="accent"
          />
          <StatCard
            icon={UsersIcon}
            value={stats?.totalOrganizers ?? '—'}
            label="Organizers"
          />
        </div>
      </section>

      {debouncedSearch && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader
            title={`Search results for "${debouncedSearch}"`}
            subtitle={`${searchResults.length} event${
              searchResults.length === 1 ? '' : 's'
            } found`}
          />
          {searchResults.length === 0 ? (
            <div className="card p-8 text-center text-neutral-500">
              No events match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((event) => (
                <PublicEventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="Upcoming Events"
          subtitle="Don't miss out on these upcoming events"
          action={
            <Link
              to="/events?period=upcoming"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          }
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="card h-80 animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="card p-8 text-center text-neutral-500">
            <CalendarDaysIcon className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            No upcoming events at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <PublicEventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-primary-pale/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader
            title="Featured Organizers"
            subtitle="Connect with event organizers making great experiences"
            action={
              <Link
                to="/organizers"
                className="text-sm text-primary hover:underline font-medium"
              >
                View all →
              </Link>
            }
          />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="card h-48 animate-pulse bg-neutral-100"
                />
              ))}
            </div>
          ) : organizers.length === 0 ? (
            <div className="card p-8 text-center text-neutral-500">
              <UsersIcon className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
              No organizers to show yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {organizers.slice(0, 8).map((organizer) => (
                <OrganizerCard key={organizer._id} organizer={organizer} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="Past Events"
          subtitle="Take a look at events that have already wrapped up"
          action={
            <Link
              to="/events?period=past"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          }
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="card h-80 animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        ) : pastEvents.length === 0 ? (
          <div className="card p-8 text-center text-neutral-500">
            No past events to show.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <PublicEventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to Join?</h2>
          <p className="text-primary-light mb-6 max-w-2xl mx-auto">
            Create an account today to register for events, get personalized
            recommendations, and download tickets instantly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Landing;
