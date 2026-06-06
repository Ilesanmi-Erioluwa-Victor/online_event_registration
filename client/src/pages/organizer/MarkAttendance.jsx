import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Button from '../../components/common/Button.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { registrationsAPI } from '../../api/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { formatDate } from '../../utils/formatDate.js';

const MarkAttendance = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ present: 0, absent: 0, pending: 0 });
  const [togglingId, setTogglingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchRegistrations();
  }, [id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationsAPI.getEventRegistrations(id, { limit: 500 });
      const data = response.data.registrations.filter(r => r.status === 'Confirmed');
      setRegistrations(data);
      setStats({
        present: data.filter(r => r.attendanceStatus === 'Present').length,
        absent: data.filter(r => r.attendanceStatus === 'Absent').length,
        pending: data.filter(r => r.attendanceStatus === 'Pending').length,
      });
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (regId, currentStatus) => {
    const newStatus = currentStatus === 'Present' ? 'Pending' : 'Present';
    setTogglingId(regId);
    try {
      await registrationsAPI.markAttendance(regId, newStatus);
      fetchRegistrations();
    } catch (err) {
      toast.error('Cannot mark attendance yet (event may not have started)');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = () => {
    toast.success('Attendance saved');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await registrationsAPI.exportAttendance(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };
  
  const filtered = registrations.filter(r => 
    !debouncedSearch || 
    r.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    r.registrationCode.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <PageWrapper>
      <div className="mb-4">
        <Link to={`/organizer/events/${id}`} className="text-primary hover:underline text-sm">
          ← Back to Event
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mark Attendance</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport} loading={exporting} className="flex-1 sm:flex-none">
            Export Report
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">Save All</Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.present}</div>
          <div className="text-sm text-neutral-500">Present</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-sm text-neutral-500">Absent</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-neutral-600">{stats.pending}</div>
          <div className="text-sm text-neutral-500">Pending</div>
        </div>
      </div>
      
      <div className="card p-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or reg code..."
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((reg) => (
            <div key={reg._id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-pale text-primary rounded-full flex items-center justify-center font-semibold">
                  {getInitials(reg.fullName)}
                </div>
                <div>
                  <div className="font-medium">{reg.fullName}</div>
                  <div className="text-xs text-neutral-500">
                    {reg.registrationCode} • {reg.ticketNumber}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleAttendance(reg._id, reg.attendanceStatus)}
                disabled={togglingId === reg._id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                  reg.attendanceStatus === 'Present' ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              >
                {togglingId === reg._id ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white absolute left-1/2 -translate-x-1/2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reg.attendanceStatus === 'Present' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default MarkAttendance;
