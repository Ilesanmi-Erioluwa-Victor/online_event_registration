import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Table from '../../components/common/Table.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { registrationsAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';

const Registrations = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [markingId, setMarkingId] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [emailSending, setEmailSending] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchRegistrations();
  }, [page, debouncedSearch, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const response = await registrationsAPI.getEventRegistrations(id, params);
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (regId, status) => {
    setMarkingId(`${regId}-${status}`);
    try {
      await registrationsAPI.markAttendance(regId, status);
      toast.success(`Marked as ${status}`);
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setMarkingId(null);
    }
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await registrationsAPI.exportRegistrations(id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleSendBulkEmail = async () => {
    setEmailSending(true);
    try {
      await registrationsAPI.sendBulkEmail(id, emailData);
      toast.success('Emails sent');
      setShowEmailModal(false);
    } catch (err) {
      toast.error('Failed to send emails');
    } finally {
      setEmailSending(false);
    }
  };
  
  const columns = [
    {
      header: 'Participant',
      render: (row) => (
        <div>
          <div className="font-medium">{row.fullName}</div>
          <div className="text-xs text-neutral-500">{row.email}</div>
        </div>
      ),
    },
    { header: 'Reg Code', render: (row) => <span className="font-mono text-xs">{row.registrationCode}</span> },
    { header: 'Ticket', render: (row) => <span className="font-mono text-xs">{row.ticketNumber}</span> },
    { header: 'Phone', key: 'phone' },
    { header: 'Date', render: (row) => formatDate(row.registrationDate) },
    { header: 'Status', render: (row) => <span className="px-2 py-0.5 rounded text-xs bg-primary-pale text-primary">{row.status}</span> },
    { header: 'Attendance', render: (row) => <span className="px-2 py-0.5 rounded text-xs bg-neutral-100">{row.attendanceStatus}</span> },
    {
      header: 'Actions',
      render: (row) => {
        const isMarking = markingId && markingId.startsWith(row._id);
        return (
          <div className="flex gap-1">
            {row.status === 'Confirmed' && (
              <>
                <button
                  onClick={() => handleMarkAttendance(row._id, 'Present')}
                  disabled={isMarking}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {markingId === `${row._id}-Present` ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : null}
                  Present
                </button>
                <button
                  onClick={() => handleMarkAttendance(row._id, 'Absent')}
                  disabled={isMarking}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {markingId === `${row._id}-Absent` ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : null}
                  Absent
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];
  
  return (
    <PageWrapper>
      <div className="mb-4">
        <Link to={`/organizer/events/${id}`} className="text-primary hover:underline text-sm">
          ← Back to Event
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Registrations</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowEmailModal(true)}>
            <EnvelopeIcon className="h-4 w-4" /> Email All
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleExport('csv')}
            loading={exporting === 'csv'}
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, code..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <Table columns={columns} data={registrations} loading={loading} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      
      <Modal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} title="Email All Confirmed Registrants">
        <div className="space-y-3">
          <Input
            label="Subject"
            value={emailData.subject}
            onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            required
          />
          <div>
            <label className="label">Message</label>
            <textarea
              className="input-field"
              rows="6"
              value={emailData.message}
              onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowEmailModal(false)}
              disabled={emailSending}
            >
              Cancel
            </Button>
            <Button onClick={handleSendBulkEmail} loading={emailSending}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
};

export default Registrations;
