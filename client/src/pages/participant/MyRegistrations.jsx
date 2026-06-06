import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  XCircleIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { registrationsAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';
import CountdownTimer from '../../components/common/CountdownTimer.jsx';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('all');
  const [confirmCancel, setConfirmCancel] = useState(null);
  
  useEffect(() => {
    fetchRegistrations();
  }, [page, filter]);
  
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (filter !== 'all') params.status = filter;
      
      const response = await registrationsAPI.getMy(params);
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async () => {
    try {
      await registrationsAPI.cancel(confirmCancel._id, 'Cancelled by user');
      toast.success('Registration cancelled');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
    setConfirmCancel(null);
  };
  
  const isCancellable = (reg) => {
    if (reg.status !== 'Confirmed') return false;
    return new Date() < new Date(reg.event?.startDate);
  };
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Registrations</h1>
        <p className="text-neutral-600">Your registered events</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'Confirmed', 'Waitlisted', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-white border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded text-sm ${view === 'list' ? 'bg-primary text-white' : ''}`}
          >
            List
          </button>
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1 rounded text-sm ${view === 'grid' ? 'bg-primary text-white' : ''}`}
          >
            Grid
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : registrations.length === 0 ? (
        <div className="card p-8 text-center text-neutral-500">
          No registrations found.{' '}
          <Link to="/participant/events" className="text-primary hover:underline">Browse events</Link>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <div key={reg._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full sm:w-20 h-20 bg-primary-pale rounded overflow-hidden flex-shrink-0">
                {reg.event?.bannerImage && (
                  <img src={reg.event.bannerImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{reg.event?.title}</h3>
                <div className="text-sm text-neutral-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(reg.event?.startDate)} • {reg.event?.startTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    {reg.event?.location}
                  </div>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1">
                  {reg.registrationCode}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  <Badge status={reg.status}>{reg.status}</Badge>
                  <Badge status={reg.attendanceStatus}>{reg.attendanceStatus}</Badge>
                </div>
                {isCancellable(reg) && (
                  <CountdownTimer targetDate={reg.event?.startDate} />
                )}
                <div className="flex gap-1">
                  <Link to={`/participant/registrations/${reg._id}/ticket`}>
                    <Button size="sm" variant="ghost">
                      <EyeIcon className="h-4 w-4" /> Ticket
                    </Button>
                  </Link>
                  {isCancellable(reg) && (
                    <Button size="sm" variant="danger" onClick={() => setConfirmCancel(reg)}>
                      <XCircleIcon className="h-4 w-4" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations.map((reg) => (
            <div key={reg._id} className="card overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary-pale to-primary-light">
                {reg.event?.bannerImage && (
                  <img src={reg.event.bannerImage} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{reg.event?.title}</h3>
                <div className="text-sm text-neutral-600 mb-2">{formatDate(reg.event?.startDate)}</div>
                <div className="flex gap-1 mb-3">
                  <Badge status={reg.status}>{reg.status}</Badge>
                  <Badge status={reg.attendanceStatus}>{reg.attendanceStatus}</Badge>
                </div>
                <Link to={`/participant/registrations/${reg._id}/ticket`}>
                  <Button size="sm" className="w-full">View Ticket</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      
      <ConfirmDialog
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={handleCancel}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${confirmCancel?.event?.title}"?`}
      />
    </PageWrapper>
  );
};

export default MyRegistrations;
