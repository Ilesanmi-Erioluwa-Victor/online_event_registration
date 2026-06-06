import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import PublicEventCard from '../../components/features/PublicEventCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { publicAPI } from '../../api/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';

const PublicEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [period, setPeriod] = useState(searchParams.get('period') || 'upcoming');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [isFree, setIsFree] = useState(searchParams.get('isFree') || '');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, period, type, isFree]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (period) params.set('period', period);
    if (type) params.set('type', type);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, period, type, setSearchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 12 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (period) params.period = period;
        if (type) params.eventType = type;
        if (isFree) params.isFree = isFree;

        const response = await publicAPI.getEvents(params);
        setEvents(response.data.events);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } catch (err) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [page, debouncedSearch, period, type, isFree]);

  const periodFilters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All' },
  ];

  const typeFilters = [
    { key: '', label: 'All Types' },
    { key: 'Physical', label: 'Physical' },
    { key: 'Virtual', label: 'Virtual' },
    { key: 'Hybrid', label: 'Hybrid' },
  ];

  const priceFilters = [
    { key: '', label: 'Any Price' },
    { key: 'true', label: 'Free' },
  ];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Discover Events
          </h1>
          <p className="text-primary-light mb-6">
            Browse upcoming and past events from our community
          </p>
          <div className="bg-white rounded-xl p-2 shadow-lg flex items-center gap-2 max-w-2xl">
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {periodFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setPeriod(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  period === f.key
                    ? 'bg-primary text-white'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((f) => (
              <button
                key={f.key || 'all-types'}
                onClick={() => setType(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  type === f.key
                    ? 'bg-accent text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {f.label}
              </button>
            ))}
            {priceFilters.map((f) => (
              <button
                key={`price-${f.key || 'any'}`}
                onClick={() => setIsFree(f.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isFree === f.key
                    ? 'bg-success text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="card h-80 animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="card p-12 text-center text-neutral-500">
            <CalendarDaysIcon className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p>No events found matching your criteria.</p>
            <button
              onClick={() => {
                setSearch('');
                setPeriod('upcoming');
                setType('');
                setIsFree('');
              }}
              className="text-primary hover:underline text-sm mt-3"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-neutral-500 mb-3">
              Showing {events.length} of {total} event
              {total === 1 ? '' : 's'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <PublicEventCard key={event._id} event={event} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default PublicEvents;
