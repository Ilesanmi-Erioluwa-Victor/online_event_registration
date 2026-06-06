import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import EventCard from '../../components/features/EventCard.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { eventsAPI } from '../../api/index.js';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 400);
  
  useEffect(() => {
    fetchEvents();
  }, [page, debouncedSearch, statusFilter]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      
      const response = await eventsAPI.getMyEvents(params);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Events</h1>
          <p className="text-neutral-600">Events you have created</p>
        </div>
        <Link to="/organizer/events/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <PlusIcon className="h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search events..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : events.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500">
          No events found. <Link to="/organizer/events/new" className="text-primary hover:underline">Create your first event</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} basePath="/organizer/events" />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </PageWrapper>
  );
};

export default MyEvents;
