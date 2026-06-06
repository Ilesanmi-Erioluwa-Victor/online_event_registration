import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Button from '../../components/common/Button.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { eventsAPI, categoriesAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';
import { calculateEventStatus } from '../../utils/eventStatus.js';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const debouncedSearch = useDebounce(search, 400);
  
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [page, debouncedSearch, statusFilter, categoryFilter]);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await eventsAPI.getAdminEvents(params);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDelete = async (event) => {
    try {
      await eventsAPI.delete(event._id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
    setConfirmDelete(null);
  };
  
  const columns = [
    {
      header: 'Event',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-pale rounded flex-shrink-0 overflow-hidden">
            {row.bannerImage ? (
              <img src={row.bannerImage} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary text-xs">E</div>
            )}
          </div>
          <div>
            <div className="font-medium">{row.title}</div>
            <div className="text-xs text-neutral-500 font-mono">{row.eventCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Organizer',
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.organizer?.fullName}</div>
          <div className="text-xs text-neutral-500">{row.organizer?.organization || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      render: (row) => row.category?.name || '-',
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.startDate),
    },
    {
      header: 'Type',
      render: (row) => <Badge>{row.eventType}</Badge>,
    },
    {
      header: 'Registrations',
      render: (row) => `${row.currentRegistrations} / ${row.maxCapacity}`,
    },
    {
      header: 'Status',
      render: (row) => <Badge status={calculateEventStatus(row)}>{calculateEventStatus(row)}</Badge>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Link
            to={`/organizer/events/${row._id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            to={`/organizer/events/${row._id}/edit`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setConfirmDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">All Events</h1>
          <p className="text-neutral-600">Manage all events on the platform</p>
        </div>
        <Button onClick={() => {/* export */}} variant="secondary" className="w-full sm:w-auto">Export PDF</Button>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title or code..."
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <Table columns={columns} data={events} loading={loading} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Event"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
      />
    </PageWrapper>
  );
};

export default AllEvents;
