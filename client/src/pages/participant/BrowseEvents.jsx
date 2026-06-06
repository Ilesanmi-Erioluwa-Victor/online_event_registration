import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import EventCard from '../../components/features/EventCard.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { eventsAPI } from '../../api/index.js';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  const debouncedSearch = useDebounce(search, 400);
  
  useEffect(() => {
    fetchEvents();
  }, [page, debouncedSearch, filter]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      
      // Apply filters
      if (filter === 'free') params.isFree = true;
      if (filter === 'virtual') params.eventType = 'Virtual';
      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Add date filtering
      }
      
      const response = await eventsAPI.getAll(params);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  const filters = [
    { key: 'all', label: 'All Events' },
    { key: 'today', label: 'Today' },
    { key: 'free', label: 'Free' },
    { key: 'virtual', label: 'Virtual' },
  ];
  
  return (
    <PageWrapper>
      <div className="bg-gradient-to-r from-primary-dark to-primary rounded-xl p-6 sm:p-8 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
        <p className="text-primary-light mb-4">Find and register for exciting events near you</p>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search events by title, category, location..."
          className="max-w-2xl"
        />
      </div>
      
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              filter === f.key
                ? 'bg-primary text-white'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500">
          No events found matching your criteria
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </PageWrapper>
  );
};

export default BrowseEvents;
